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
SMOKE_PORT="${SMOKE_PORT:-8080}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-}"
RUN_AUDIT_PRUNE="${RUN_AUDIT_PRUNE:-1}"
API_AUDIT_PRUNE_CMD="${API_AUDIT_PRUNE_CMD:-pnpm --filter @supportops/api audit:prune}"

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
  log "Backing up database before migration"
  BACKUP_DIR="${DEPLOY_PATH}/backups"
  mkdir -p "${BACKUP_DIR}"
  BACKUP_FILE="${BACKUP_DIR}/pre-deploy-$(date +%Y%m%d-%H%M%S).sql"
  docker compose -p supportops_staging -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" \
    exec -T postgres pg_dump -U "${POSTGRES_USER:-postgres}" "${POSTGRES_DB:-supportops_staging}" \
    > "${BACKUP_FILE}" 2>/dev/null \
    && log "Database backup saved to ${BACKUP_FILE}" \
    || log "Warning: database backup failed — continuing anyway (staging)"

  log "Running database migrations"
  docker compose -p supportops_staging -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" run --rm api sh -lc "${API_MIGRATE_CMD}"
fi

log "Starting services"
docker compose -p supportops_staging -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" up -d --remove-orphans

# Auto-seed on first deploy if DB has no users
USER_COUNT=$(docker compose -p supportops_staging -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" \
  exec -T postgres psql -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-supportops_staging}" \
  -tAc 'SELECT COUNT(*) FROM "User";' 2>/dev/null || echo "error")

if [ "${USER_COUNT}" = "0" ]; then
  log "Empty database detected — running seed"
  docker compose -p supportops_staging -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" \
    run --rm api sh -lc "pnpm --filter @supportops/api exec prisma db seed"
elif [ "${USER_COUNT}" = "error" ]; then
  log "Could not check user count — skipping auto-seed"
else
  log "Database already has ${USER_COUNT} user(s) — skipping seed"
fi

log "Running smoke tests"
SMOKE_PORT="${SMOKE_PORT}" "${SMOKE_SCRIPT}"

if [ "${RUN_AUDIT_PRUNE}" = "1" ]; then
  log "Pruning old audit logs"
  docker compose -p supportops_staging -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" \
    run --rm api sh -lc "${API_AUDIT_PRUNE_CMD}" \
    || log "Warning: audit log prune failed"
fi

rm -f "${ENV_FILE}.rollback"
trap - ERR
log "Deploy completed successfully"
