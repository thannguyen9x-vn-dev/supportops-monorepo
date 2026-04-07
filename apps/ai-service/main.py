"""SupportOps AI Service — FastAPI app.

Runs as a standalone Python service on the same server as NestJS.
NestJS acts as proxy: verifies JWT, injects x-tenant-id header, then forwards here.

This service is READ-ONLY — it never writes to the database.
API keys are loaded from environment variables only — never from DB or returned to clients.
"""

import logging
import os

import asyncpg
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.ask import router as ask_router
from routers.export import router as export_router

load_dotenv()

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="SupportOps AI Service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None,
)

# Only allow calls from the NestJS API (same server / internal network)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:3000"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

app.include_router(ask_router)
app.include_router(export_router)


@app.on_event("startup")
async def startup() -> None:
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL environment variable is required")

    app.state.db_pool = await asyncpg.create_pool(
        database_url,
        min_size=2,
        max_size=10,
        command_timeout=30,
    )
    logger.info("Database pool created")

    # Build adapters — only instantiate providers that have API keys configured
    adapters: dict = {}

    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    if anthropic_key:
        from adapters.anthropic_adapter import AnthropicAdapter
        adapters["anthropic"] = AnthropicAdapter(api_key=anthropic_key)
        logger.info("Anthropic adapter initialized")
    else:
        logger.warning("ANTHROPIC_API_KEY not set — Anthropic models unavailable")

    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key:
        from adapters.openai_adapter import OpenAiAdapter
        adapters["openai"] = OpenAiAdapter(api_key=openai_key)
        logger.info("OpenAI adapter initialized")
    else:
        logger.warning("OPENAI_API_KEY not set — OpenAI models unavailable")

    app.state.ai_adapters = adapters


@app.on_event("shutdown")
async def shutdown() -> None:
    await app.state.db_pool.close()
    logger.info("Database pool closed")


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
