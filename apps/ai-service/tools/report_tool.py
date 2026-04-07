"""Tool/function definition for AI providers to fetch report data."""

from typing import Any

# ─── Anthropic tool definition ────────────────────────────────────────────────

ANTHROPIC_TOOL = {
    "name": "get_report_data",
    "description": (
        "Fetch operational data for the current tenant. "
        "Use this tool to retrieve request counts, status breakdown, SLA health, "
        "team performance, or service type breakdown for a given date range. "
        "Always use this tool — never make up numbers."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "from_date": {
                "type": "string",
                "description": "Start date in YYYY-MM-DD format (inclusive).",
            },
            "to_date": {
                "type": "string",
                "description": "End date in YYYY-MM-DD format (inclusive).",
            },
            "metrics": {
                "type": "array",
                "items": {
                    "type": "string",
                    "enum": [
                        "request_volume",
                        "status_breakdown",
                        "sla_health",
                        "team_performance",
                        "service_type_breakdown",
                    ],
                },
                "description": "List of metrics to retrieve.",
            },
        },
        "required": ["from_date", "to_date", "metrics"],
    },
}

# ─── OpenAI function definition ───────────────────────────────────────────────

OPENAI_FUNCTION = {
    "type": "function",
    "function": {
        "name": "get_report_data",
        "description": ANTHROPIC_TOOL["description"],
        "parameters": {
            "type": "object",
            "properties": {
                "from_date": {
                    "type": "string",
                    "description": "Start date in YYYY-MM-DD format (inclusive).",
                },
                "to_date": {
                    "type": "string",
                    "description": "End date in YYYY-MM-DD format (inclusive).",
                },
                "metrics": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "enum": [
                            "request_volume",
                            "status_breakdown",
                            "sla_health",
                            "team_performance",
                            "service_type_breakdown",
                        ],
                    },
                    "description": "List of metrics to retrieve.",
                },
            },
            "required": ["from_date", "to_date", "metrics"],
        },
    },
}


def parse_tool_input(tool_input: dict[str, Any]) -> tuple[str, str, list[str]]:
    """Extract and validate tool call arguments."""
    from_date: str = tool_input["from_date"]
    to_date: str = tool_input["to_date"]
    metrics: list[str] = tool_input["metrics"]
    return from_date, to_date, metrics
