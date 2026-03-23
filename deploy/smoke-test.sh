#!/usr/bin/env bash
set -Eeuo pipefail

: "${APP_DOMAIN:?APP_DOMAIN is required for smoke test}"
: "${API_DOMAIN:?API_DOMAIN is required for smoke test}"

curl -fsS -H "Host: ${APP_DOMAIN}" "http://127.0.0.1/" >/dev/null
curl -fsS -H "Host: ${API_DOMAIN}" "http://127.0.0.1/api/v1/health" >/dev/null

echo "Smoke tests passed"
