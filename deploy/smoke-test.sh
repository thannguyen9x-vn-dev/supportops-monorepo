#!/usr/bin/env bash
set -Eeuo pipefail

: "${APP_DOMAIN:?APP_DOMAIN is required for smoke test}"
: "${API_DOMAIN:?API_DOMAIN is required for smoke test}"

SMOKE_PORT="${SMOKE_PORT:-80}"

curl -fsS -H "Host: ${APP_DOMAIN}" "http://127.0.0.1:${SMOKE_PORT}/" >/dev/null
curl -fsS -H "Host: ${API_DOMAIN}" "http://127.0.0.1:${SMOKE_PORT}/api/v1/health" >/dev/null

echo "Smoke tests passed"
