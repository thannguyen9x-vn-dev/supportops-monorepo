from collections.abc import AsyncGenerator
import socket
from unittest.mock import AsyncMock, MagicMock

import asyncpg
import pytest
from httpx import ASGITransport, AsyncClient

from main import app


@pytest.fixture(autouse=True)
def block_external_dependencies(monkeypatch: pytest.MonkeyPatch) -> None:
    """Prevent tests from touching real network or creating real DB pools."""

    async def _blocked_create_pool(*args, **kwargs):  # type: ignore[no-untyped-def]
        raise AssertionError("Real asyncpg.create_pool is blocked in tests")

    def _blocked_connect(*args, **kwargs):  # type: ignore[no-untyped-def]
        raise AssertionError("External network access is blocked in tests")

    monkeypatch.setattr(asyncpg, "create_pool", _blocked_create_pool)
    monkeypatch.setattr(socket.socket, "connect", _blocked_connect)


@pytest.fixture
def mock_conn() -> AsyncMock:
    conn = AsyncMock()
    conn.fetch = AsyncMock(return_value=[])
    return conn


@pytest.fixture
def mock_db_pool(mock_conn: AsyncMock) -> MagicMock:
    pool = MagicMock()
    acquire_ctx = AsyncMock()
    acquire_ctx.__aenter__.return_value = mock_conn
    acquire_ctx.__aexit__.return_value = False
    pool.acquire.return_value = acquire_ctx
    pool.close = AsyncMock()
    return pool


@pytest.fixture
def mock_anthropic_adapter() -> AsyncMock:
    adapter = AsyncMock()
    adapter.ask = AsyncMock(return_value="mock anthropic reply")
    return adapter


@pytest.fixture
def mock_openai_adapter() -> AsyncMock:
    adapter = AsyncMock()
    adapter.ask = AsyncMock(return_value="mock openai reply")
    return adapter


@pytest.fixture
async def async_client(
    mock_db_pool: MagicMock,
    mock_anthropic_adapter: AsyncMock,
    mock_openai_adapter: AsyncMock,
) -> AsyncGenerator[AsyncClient, None]:
    app.state.db_pool = mock_db_pool
    app.state.ai_adapters = {
        "anthropic": mock_anthropic_adapter,
        "openai": mock_openai_adapter,
    }

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest.fixture
async def async_client_no_adapters(
    mock_db_pool: MagicMock,
) -> AsyncGenerator[AsyncClient, None]:
    app.state.db_pool = mock_db_pool
    app.state.ai_adapters = {}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
