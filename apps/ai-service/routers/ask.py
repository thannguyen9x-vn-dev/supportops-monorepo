"""POST /ask — main AI chat endpoint."""

import json
import logging
from datetime import date, datetime, timezone

import asyncpg
from fastapi import APIRouter, Header, HTTPException, Request
from pydantic import BaseModel

from db.queries import get_report_data
from tools.report_tool import parse_tool_input

logger = logging.getLogger(__name__)

router = APIRouter()

VALID_MODELS = {
    "claude-sonnet-4-20250514",
    "claude-opus-4-20250514",
    "gpt-4o",
    "gpt-4o-mini",
}

ANTHROPIC_MODELS = {"claude-sonnet-4-20250514", "claude-opus-4-20250514"}

SYSTEM_PROMPT = """You are an AI assistant for SupportOps, an IT service management platform.
You help TENANT_ADMIN users understand their operational data by answering questions about:
- Request volume and trends
- Request status breakdown
- SLA health and compliance
- Team performance (technician stats)
- Service type breakdown

IMPORTANT RULES:
1. You MUST use the get_report_data tool to fetch real data. Never make up numbers.
2. If the user's question does not specify a date range, ask them to clarify before calling the tool.
3. If the question is outside SupportOps domain (weather, cooking, etc.), politely decline and suggest relevant operational questions.
4. Always respond in the same language as the user's message.
5. Format numbers clearly. Use tables when presenting multiple data points.
6. Today's date is {today}.
"""


class ChatMessageInput(BaseModel):
    role: str
    content: str


class AskRequest(BaseModel):
    message: str
    history: list[ChatMessageInput] = []
    model: str = "claude-sonnet-4-20250514"


class AskResponse(BaseModel):
    reply: str
    model: str


@router.post("/ask", response_model=AskResponse)
async def ask(
    body: AskRequest,
    request: Request,
    x_tenant_id: str = Header(..., alias="x-tenant-id"),
) -> AskResponse:
    """Handle a chat message from the TENANT_ADMIN.

    tenantId is injected by NestJS after JWT verification — never trusted from body.
    """
    if not x_tenant_id:
        raise HTTPException(status_code=400, detail="x-tenant-id header is required")

    model = body.model if body.model in VALID_MODELS else "claude-sonnet-4-20250514"

    db_pool: asyncpg.Pool = request.app.state.db_pool
    ai_adapters: dict = request.app.state.ai_adapters

    today = date.today().isoformat()
    system = SYSTEM_PROMPT.format(today=today)

    from adapters.base import ChatMessage

    history = [ChatMessage(role=m.role, content=m.content) for m in body.history]

    async def tool_executor(tool_name: str, tool_input: dict) -> str:
        if tool_name != "get_report_data":
            return json.dumps({"error": f"Unknown tool: {tool_name}"})
        try:
            from_date_str, to_date_str, metrics = parse_tool_input(tool_input)
            from_date = date.fromisoformat(from_date_str)
            to_date = date.fromisoformat(to_date_str)
            async with db_pool.acquire() as conn:
                data = await get_report_data(conn, x_tenant_id, from_date, to_date, metrics)
            return json.dumps(data)
        except Exception as exc:
            logger.error("Tool execution error: %s", exc)
            return json.dumps({"error": str(exc)})

    adapter = ai_adapters.get("anthropic" if model in ANTHROPIC_MODELS else "openai")
    if adapter is None:
        raise HTTPException(status_code=503, detail="AI provider not configured")

    reply = await adapter.ask(
        model=model,
        system_prompt=system,
        history=history,
        user_message=body.message,
        tool_executor=tool_executor,
    )

    return AskResponse(reply=reply, model=model)
