from unittest.mock import AsyncMock

import asyncpg
import pytest

from main import app, shutdown, startup


async def test_startup_raises_when_database_url_missing(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)

    with pytest.raises(RuntimeError, match="DATABASE_URL environment variable is required"):
        await startup()


async def test_startup_initializes_db_pool_with_expected_config(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("DATABASE_URL", "postgresql://user:pass@localhost:5432/db")
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)

    pool = AsyncMock()
    create_pool_mock = AsyncMock(return_value=pool)
    monkeypatch.setattr(asyncpg, "create_pool", create_pool_mock)

    await startup()

    create_pool_mock.assert_awaited_once_with(
        "postgresql://user:pass@localhost:5432/db",
        min_size=2,
        max_size=10,
        command_timeout=30,
    )
    assert app.state.db_pool is pool


async def test_startup_sets_empty_adapters_when_no_api_keys(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("DATABASE_URL", "postgresql://user:pass@localhost:5432/db")
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.setattr(asyncpg, "create_pool", AsyncMock(return_value=AsyncMock()))

    await startup()

    assert app.state.ai_adapters == {}


async def test_startup_initializes_anthropic_adapter_when_key_exists(
    monkeypatch: pytest.MonkeyPatch, mocker
) -> None:  # type: ignore[no-untyped-def]
    monkeypatch.setenv("DATABASE_URL", "postgresql://user:pass@localhost:5432/db")
    monkeypatch.setenv("ANTHROPIC_API_KEY", "anthropic-key")
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.setattr(asyncpg, "create_pool", AsyncMock(return_value=AsyncMock()))

    anthropic_instance = object()
    anthropic_cls = mocker.patch("adapters.anthropic_adapter.AnthropicAdapter", return_value=anthropic_instance)

    await startup()

    anthropic_cls.assert_called_once_with(api_key="anthropic-key")
    assert app.state.ai_adapters["anthropic"] is anthropic_instance
    assert "openai" not in app.state.ai_adapters


async def test_startup_initializes_openai_adapter_when_key_exists(
    monkeypatch: pytest.MonkeyPatch, mocker
) -> None:  # type: ignore[no-untyped-def]
    monkeypatch.setenv("DATABASE_URL", "postgresql://user:pass@localhost:5432/db")
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.setenv("OPENAI_API_KEY", "openai-key")
    monkeypatch.setattr(asyncpg, "create_pool", AsyncMock(return_value=AsyncMock()))

    openai_instance = object()
    openai_cls = mocker.patch("adapters.openai_adapter.OpenAiAdapter", return_value=openai_instance)

    await startup()

    openai_cls.assert_called_once_with(api_key="openai-key")
    assert app.state.ai_adapters["openai"] is openai_instance
    assert "anthropic" not in app.state.ai_adapters


async def test_shutdown_closes_db_pool_once() -> None:
    pool = AsyncMock()
    app.state.db_pool = pool

    await shutdown()

    pool.close.assert_awaited_once()
