#!/usr/bin/env bash
set -Eeuo pipefail

log() {
  printf '[deploy-staging] %s\n' "$*"
}

fail() {
  printf '[deploy-staging][error] %s\n' "$*" >&2
  exit 1
}

DEPLOY_PATH="${DEPLOY_PATH:-$(pwd)}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.staging.yml}"
ENV_FILE="${ENV_FILE:-.env.staging}"
RUN_MIGRATIONS="${RUN_MIGRATIONS:-1}"
API_MIGRATE_CMD="${API_MIGRATE_CMD:-pnpm --filter @supportops/api exec prisma migrate deploy}"
SMOKE_SCRIPT="${SMOKE_SCRIPT:-deploy/smoke-test.sh}"
SMOKE_PORT="${SMOKE_PORT:-80}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-}"

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
    docker compose -p supportops_staging -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" up -d --remove-orphans || true
  fi
  exit "${code}"
}
trap rollback ERR

if [ -f "${ENV_FILE}" ]; then
  cp "${ENV_FILE}" "${ENV_FILE}.rollback"
  HAS_ROLLBACK=1
fi

# Source env file early to get domain vars for cert init
set -a
# shellcheck disable=SC1090
source "${ENV_FILE}"
set +a

if [ -n "${CERTBOT_EMAIL:-}" ]; then
  DEPLOY_PATH="${DEPLOY_PATH}" COMPOSE_FILE="${COMPOSE_FILE}" ENV_FILE="${ENV_FILE}" \
    "${DEPLOY_PATH}/deploy/init-letsencrypt.sh"
else
  log "CERTBOT_EMAIL not set — skipping certificate init"
fi

log "Pulling images"
docker compose -p supportops_staging -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" pull

if [ "${RUN_MIGRATIONS}" = "1" ]; then
  log "Running database migrations"
  docker compose -p supportops_staging -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" run --rm api sh -lc "${API_MIGRATE_CMD}"
fi

log "Starting services"
docker compose -p supportops_staging -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" up -d --remove-orphans

log "Running smoke tests"
SMOKE_PORT="${SMOKE_PORT}" "${SMOKE_SCRIPT}"

rm -f "${ENV_FILE}.rollback"
trap - ERR
log "Deploy completed successfully"
