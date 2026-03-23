#!/usr/bin/env bash
set -Eeuo pipefail

log() {
  printf '[deploy] %s\n' "$*"
}

fail() {
  printf '[deploy][error] %s\n' "$*" >&2
  exit 1
}

DEPLOY_PATH="${DEPLOY_PATH:-$(pwd)}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-.env.prod}"
RUN_MIGRATIONS="${RUN_MIGRATIONS:-1}"
API_MIGRATE_CMD="${API_MIGRATE_CMD:-pnpm --filter @supportops/api exec prisma migrate deploy}"
SMOKE_SCRIPT="${SMOKE_SCRIPT:-deploy/smoke-test.sh}"

cd "${DEPLOY_PATH}"

[ -f "${COMPOSE_FILE}" ] || fail "Missing compose file: ${COMPOSE_FILE}"
[ -f "${ENV_FILE}" ] || fail "Missing env file: ${ENV_FILE}"
[ -x "${SMOKE_SCRIPT}" ] || fail "Smoke test script is missing or not executable: ${SMOKE_SCRIPT}"

HAS_ROLLBACK=0
rollback() {
  local code="$?"
  if [ "${HAS_ROLLBACK}" -eq 1 ] && [ -f "${ENV_FILE}.rollback" ]; then
    log "Deploy failed. Rolling back env file and restarting previous stack"
    cp "${ENV_FILE}.rollback" "${ENV_FILE}"
    docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" up -d --remove-orphans || true
  fi
  exit "${code}"
}
trap rollback ERR

if [ -f "${ENV_FILE}" ]; then
  cp "${ENV_FILE}" "${ENV_FILE}.rollback"
  HAS_ROLLBACK=1
fi

log "Pulling images"
docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" pull

if [ "${RUN_MIGRATIONS}" = "1" ]; then
  log "Running database migrations"
  docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" run --rm api sh -lc "${API_MIGRATE_CMD}"
fi

log "Starting services"
docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" up -d --remove-orphans

set -a
# shellcheck disable=SC1090
source "${ENV_FILE}"
set +a

log "Running smoke tests"
"${SMOKE_SCRIPT}"

rm -f "${ENV_FILE}.rollback"
trap - ERR
log "Deploy completed successfully"
