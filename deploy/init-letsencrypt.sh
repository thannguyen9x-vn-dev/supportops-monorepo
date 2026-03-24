#!/usr/bin/env bash
set -Eeuo pipefail

log() { printf '[init-letsencrypt] %s\n' "$*"; }
fail() { printf '[init-letsencrypt][error] %s\n' "$*" >&2; exit 1; }

: "${APP_DOMAIN:?APP_DOMAIN is required}"
: "${API_DOMAIN:?API_DOMAIN is required}"
: "${CERTBOT_EMAIL:?CERTBOT_EMAIL is required}"

DEPLOY_PATH="${DEPLOY_PATH:-$(pwd)}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.staging.yml}"
ENV_FILE="${ENV_FILE:-.env.staging}"
CERTS_DIR="${DEPLOY_PATH}/deploy/nginx/certs"

# Skip if real certs already exist (not a fresh deploy)
if [ -f "${CERTS_DIR}/live/${APP_DOMAIN}/fullchain.pem" ]; then
  log "Certificates already exist for ${APP_DOMAIN}, skipping init"
  exit 0
fi

log "No certificates found — obtaining Let's Encrypt certificates via standalone mode"
log "Domains: ${APP_DOMAIN}, ${API_DOMAIN}"

cd "${DEPLOY_PATH}"

# Use certbot standalone (no nginx needed — binds directly to port 80)
DOMAINS="-d ${APP_DOMAIN}"
if [ "${APP_DOMAIN}" != "${API_DOMAIN}" ]; then
  DOMAINS="${DOMAINS} -d ${API_DOMAIN}"
fi

docker run --rm \
  -v "${CERTS_DIR}:/etc/letsencrypt" \
  -v "${DEPLOY_PATH}/deploy/nginx/www:/var/www/certbot" \
  -p 80:80 \
  certbot/certbot certonly --standalone \
  --email "${CERTBOT_EMAIL}" \
  ${DOMAINS} \
  --agree-tos --no-eff-email

# If APP_DOMAIN and API_DOMAIN are different, the cert is a SAN cert saved under APP_DOMAIN.
# Create a symlink so nginx can find it under API_DOMAIN path too.
if [ "${APP_DOMAIN}" != "${API_DOMAIN}" ] && [ ! -f "${CERTS_DIR}/live/${API_DOMAIN}/fullchain.pem" ]; then
  log "Creating symlink for ${API_DOMAIN} → ${APP_DOMAIN} cert"
  mkdir -p "${CERTS_DIR}/live/${API_DOMAIN}"
  ln -sf "../${APP_DOMAIN}/fullchain.pem" "${CERTS_DIR}/live/${API_DOMAIN}/fullchain.pem"
  ln -sf "../${APP_DOMAIN}/privkey.pem"   "${CERTS_DIR}/live/${API_DOMAIN}/privkey.pem"
fi

# Patch renewal config to use webroot so the certbot sidecar container can renew without needing port 80
RENEWAL_CONF="${CERTS_DIR}/renewal/${APP_DOMAIN}.conf"
if [ -f "${RENEWAL_CONF}" ]; then
  log "Patching renewal config to use webroot authenticator"
  sed -i 's/authenticator = standalone/authenticator = webroot/' "${RENEWAL_CONF}"
  grep -q 'webroot_path' "${RENEWAL_CONF}" || \
    printf '\nwebroot_path = /var/www/certbot\n' >> "${RENEWAL_CONF}"
fi

log "Certificate init complete"
