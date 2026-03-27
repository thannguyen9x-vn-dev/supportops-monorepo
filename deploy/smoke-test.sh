#!/usr/bin/env bash
set -Eeuo pipefail

: "${APP_DOMAIN:?APP_DOMAIN is required for smoke test}"
: "${API_DOMAIN:?API_DOMAIN is required for smoke test}"

SMOKE_PORT="${SMOKE_PORT:-80}"
MAX_RETRIES="${SMOKE_MAX_RETRIES:-12}"
RETRY_INTERVAL="${SMOKE_RETRY_INTERVAL:-10}"

smoke_curl() {
  curl -fsS --max-time 5 "$@" >/dev/null
}

wait_for() {
  local desc="$1"; shift
  for i in $(seq 1 "${MAX_RETRIES}"); do
    if smoke_curl "$@" 2>/dev/null; then
      echo "[smoke-test] ${desc}: OK"
      return 0
    fi
    echo "[smoke-test] ${desc}: attempt ${i}/${MAX_RETRIES} failed, retrying in ${RETRY_INTERVAL}s..."
    sleep "${RETRY_INTERVAL}"
  done
  echo "[smoke-test] ${desc}: FAILED after ${MAX_RETRIES} attempts" >&2
  return 1
}

wait_for "web"    -H "Host: ${APP_DOMAIN}" "http://127.0.0.1:${SMOKE_PORT}/"
wait_for "api"    -H "Host: ${API_DOMAIN}" "http://127.0.0.1:${SMOKE_PORT}/api/v1/health"

echo "Smoke tests passed"
