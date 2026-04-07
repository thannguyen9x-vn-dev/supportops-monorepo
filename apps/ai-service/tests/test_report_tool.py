from tools.report_tool import ANTHROPIC_TOOL, OPENAI_FUNCTION, parse_tool_input


def test_parse_tool_input_returns_expected_tuple() -> None:
    tool_input = {
        "from_date": "2026-01-01",
        "to_date": "2026-01-31",
        "metrics": ["request_volume", "status_breakdown"],
    }

    result = parse_tool_input(tool_input)

    assert result == ("2026-01-01", "2026-01-31", ["request_volume", "status_breakdown"])


def test_parse_tool_input_raises_key_error_when_from_date_missing() -> None:
    tool_input = {"to_date": "2026-01-31", "metrics": ["request_volume"]}

    try:
        parse_tool_input(tool_input)
        assert False, "Expected KeyError when from_date is missing"
    except KeyError as exc:
        assert str(exc) == "'from_date'"


def test_parse_tool_input_raises_key_error_when_to_date_missing() -> None:
    tool_input = {"from_date": "2026-01-01", "metrics": ["request_volume"]}

    try:
        parse_tool_input(tool_input)
        assert False, "Expected KeyError when to_date is missing"
    except KeyError as exc:
        assert str(exc) == "'to_date'"


def test_parse_tool_input_raises_key_error_when_metrics_missing() -> None:
    tool_input = {"from_date": "2026-01-01", "to_date": "2026-01-31"}

    try:
        parse_tool_input(tool_input)
        assert False, "Expected KeyError when metrics is missing"
    except KeyError as exc:
        assert str(exc) == "'metrics'"


def test_anthropic_tool_schema_invariants() -> None:
    assert ANTHROPIC_TOOL["name"] == "get_report_data"
    assert "description" in ANTHROPIC_TOOL
    assert "input_schema" in ANTHROPIC_TOOL

    required = ANTHROPIC_TOOL["input_schema"]["required"]
    assert set(required) == {"from_date", "to_date", "metrics"}


def test_openai_function_schema_invariants() -> None:
    assert OPENAI_FUNCTION["type"] == "function"
    assert OPENAI_FUNCTION["function"]["name"] == "get_report_data"
    assert OPENAI_FUNCTION["function"]["description"] == ANTHROPIC_TOOL["description"]

    metrics_enum = OPENAI_FUNCTION["function"]["parameters"]["properties"]["metrics"]["items"]["enum"]
    assert set(metrics_enum) == {
        "request_volume",
        "status_breakdown",
        "sla_health",
        "team_performance",
        "service_type_breakdown",
    }
