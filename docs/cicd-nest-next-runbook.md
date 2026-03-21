# CI/CD Runbook (Next.js + NestJS)

Tài liệu này bám đúng flow:
1) Chốt kiến trúc deploy
2) Docker hóa
3) CI cho PR
4) CD staging
5) CD production + migrate + rollback
6) Vận hành
7) Security tối thiểu

## 1) Kiến trúc deploy

- `web` (Next.js) chạy cổng nội bộ `3000`
- `api` (NestJS) chạy cổng nội bộ `8081`
- `postgres` và `redis` chỉ chạy nội bộ Docker network
- `nginx` public ra `80/443`, reverse proxy theo host:
- `app.domain.com` -> `web:3000`
- `api.domain.com` -> `api:8081`

File chính:
- `docker-compose.prod.yml`
- `deploy/nginx/templates/supportops.conf.template`

## 2) Docker hóa và chạy full stack

Đã có:
- `apps/web/Dockerfile` (multi-stage + Next standalone)
- `apps/api/Dockerfile` (multi-stage + prisma generate)
- `deploy/.env.prod.example`
- `.dockerignore`

Chạy local theo chế độ production-like:

```bash
cp deploy/.env.prod.example .env.prod
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Kiểm tra:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod ps
curl -H "Host: app.example.com" http://127.0.0.1/
curl -H "Host: api.example.com" http://127.0.0.1/api/v1/health
```

## 3) CI cho Pull Request

Workflow: `.github/workflows/ci-pr.yml`

Pipeline chạy theo thứ tự:
- `pnpm install --frozen-lockfile`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm -r --if-present test`
- build shared UI packages
- build web
- build api-nest

Mục tiêu: fail bất kỳ bước nào thì PR đỏ.

## 4) CD Staging tự động (merge vào develop)

Workflow: `.github/workflows/cd-staging.yml`

Flow:
- build image `web` + `api`
- push GHCR (`staging-<sha>` + `staging-latest`)
- ssh vào VPS staging
- ghi `.env.prod`
- `docker compose pull && docker compose up -d`
- health-check app/api qua Nginx

### GitHub Secrets cần có (staging)

- `STAGING_HOST`
- `STAGING_USER`
- `STAGING_SSH_KEY`
- `STAGING_DEPLOY_PATH` (ví dụ `/opt/supportops-staging`)
- `STAGING_GHCR_USERNAME`
- `STAGING_GHCR_TOKEN`
- `STAGING_APP_DOMAIN`
- `STAGING_API_DOMAIN`
- `STAGING_APP_ORIGIN` (ví dụ `http://app-staging.example.com` hoặc `https://...`)
- `STAGING_API_ORIGIN`
- `STAGING_POSTGRES_DB`
- `STAGING_POSTGRES_USER`
- `STAGING_POSTGRES_PASSWORD`
- `STAGING_JWT_SECRET`
- `STAGING_FILE_SIGNING_SECRET`
- `STAGING_MAIL_ENABLED`
- `STAGING_MAIL_PROVIDER`
- `STAGING_MAIL_DAILY_LIMIT`
- `STAGING_MAIL_FROM_EMAIL`
- `STAGING_MAIL_FROM_NAME`
- `STAGING_RESEND_API_KEY`

## 5) CD Production an toàn (tag v*)

Workflow: `.github/workflows/cd-production.yml`

Flow:
- trigger khi push tag `v*` (ví dụ `v1.0.0`)
- build + push image theo tag
- ssh lên production
- backup `.env.prod` hiện tại -> `.env.prod.rollback`
- apply env mới
- chạy migration:
- `docker compose run --rm api pnpm --filter @supportops/api exec prisma migrate deploy`
- rollout containers mới
- health-check app + api
- nếu fail: restore `.env.prod.rollback` và `docker compose up -d` (rollback image trước)

### GitHub Secrets cần có (production)

- `PROD_HOST`
- `PROD_USER`
- `PROD_SSH_KEY`
- `PROD_DEPLOY_PATH` (ví dụ `/opt/supportops-prod`)
- `PROD_GHCR_USERNAME`
- `PROD_GHCR_TOKEN`
- `PROD_APP_DOMAIN`
- `PROD_API_DOMAIN`
- `PROD_APP_ORIGIN`
- `PROD_API_ORIGIN`
- `PROD_POSTGRES_DB`
- `PROD_POSTGRES_USER`
- `PROD_POSTGRES_PASSWORD`
- `PROD_JWT_SECRET`
- `PROD_FILE_SIGNING_SECRET`
- `PROD_MAIL_ENABLED`
- `PROD_MAIL_PROVIDER`
- `PROD_MAIL_DAILY_LIMIT`
- `PROD_MAIL_FROM_EMAIL`
- `PROD_MAIL_FROM_NAME`
- `PROD_RESEND_API_KEY`

## 6) Vận hành cơ bản

- API health: `/api/v1/health`
- Web health: `/`
- Đã có healthcheck trong `docker-compose.prod.yml` cho cả `web` và `api`.

Khuyến nghị thêm:
- Sentry cho `web` + `api` để bắt runtime errors.
- Uptime Kuma monitor:
- `https://app.domain.com/`
- `https://api.domain.com/api/v1/health`

## 7) Security tối thiểu trước go-live

- Không publish port Postgres/Redis ra ngoài.
- Secrets tách staging/prod bằng GitHub Environments.
- Container app chạy non-root (đã set trong Dockerfile).
- Bật HTTPS bằng Let's Encrypt ở Nginx trước production traffic thực.
- Bật backup DB định kỳ trước giờ deploy.

## 8) Quy trình deploy đề xuất

1. Merge vào `develop` -> staging auto deploy.
2. Test staging xong -> tạo tag `vX.Y.Z`.
3. Production deploy tự chạy và có rollback khi health fail.
