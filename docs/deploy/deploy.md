# DEPLOY.md

## Mục tiêu

Tài liệu này mô tả quy trình deploy chuẩn cho `supportops-monorepo` để tránh lỗi lặp lại giữa các lần deploy. Tư duy đúng là deploy theo tầng:

1. **Infra**: domain, DNS, VPS, Docker
2. **Data**: PostgreSQL, Redis, migration, seed
3. **Service**: API usable, không còn lỗi 500
4. **Frontend**: build-time env đúng, login UI gọi đúng API
5. **Edge/Security**: Nginx, HTTPS, TLS, cookie secure

Không deploy full stack một phát rồi debug ngược. Luôn đi từ dưới lên.

---

## Kiến trúc production hiện tại

- `app.thannguyen.org` → frontend web
- `api.thannguyen.org` → backend API
- `postgres` → database nội bộ Docker network
- `redis` → cache / queue nội bộ Docker network
- `nginx` → reverse proxy public (`80/443`)

Compose file: `docker-compose.prod.yml`

---

## Điều kiện bắt buộc trước khi deploy

### 1. Local phải pass trước

Trước khi push code để deploy, local phải kiểm được tối thiểu:

- DB local trống vẫn chạy migrate được
- Seed chạy được
- Demo account login được
- Frontend không gọi `localhost:8080`
- Nếu có sửa migration thì phải test lại từ DB trống

### 2. Repo phải có các thứ sau

- `docker-compose.prod.yml`
- `.env.prod.example` hoặc ít nhất là danh sách env production rõ ràng
- Prisma schema + migrations hợp lệ
- Seed script chạy được
- Demo credential rõ ràng trong README/docs

### 3. Server phải sẵn sàng

- Domain đã trỏ DNS đúng IP server
- Docker và Docker Compose cài xong
- Port `80` và `443` mở được
- Repo đã clone trên server

---

## Biến môi trường production

Tạo file `.env` ở root repo.

Mẫu tối thiểu:

```env
APP_DOMAIN=app.thannguyen.org
API_DOMAIN=api.thannguyen.org
APP_ORIGIN=https://app.thannguyen.org
API_ORIGIN=https://api.thannguyen.org

POSTGRES_DB=supportops
POSTGRES_USER=postgres
POSTGRES_PASSWORD=CHANGE_ME_DB_PASSWORD

JWT_SECRET=CHANGE_ME_LONG_RANDOM_SECRET
FILE_SIGNING_SECRET=CHANGE_ME_LONG_RANDOM_FILE_SECRET

ACCESS_TOKEN_TTL_SECONDS=900
REFRESH_TOKEN_TTL_SECONDS=604800

MAIL_ENABLED=false
MAIL_PROVIDER=resend
MAIL_DAILY_LIMIT=90
MAIL_FROM_EMAIL=onboarding@resend.dev
MAIL_FROM_NAME=SupportOps
RESEND_API_KEY=
```

Tạo secret nhanh:

```bash
openssl rand -hex 24
openssl rand -hex 32
openssl rand -hex 32
```

---

## Quy tắc rất quan trọng về env

### Runtime env
Dùng cho container lúc chạy, ví dụ trong `docker-compose.prod.yml`:

- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `APP_ORIGIN`

### Build-time env
Dùng cho frontend Next.js tại **thời điểm build**.

Ví dụ:

- `NEXT_PUBLIC_API_BASE_URL`

Nếu chỉ set ở `environment:` mà không truyền vào `build.args`, frontend có thể bake cứng fallback như `http://localhost:8080/api/v1`.

### Rule
Bất kỳ biến nào bắt đầu bằng `NEXT_PUBLIC_` phải được kiểm tra kỹ xem có cần vào **build-time** không.

---

## Dockerfile web: yêu cầu bắt buộc

`apps/web/Dockerfile` phải có build args/env trước lệnh build:

```dockerfile
ARG NEXT_PUBLIC_API_BASE_URL
ARG API_INTERNAL_URL
ARG BACKEND_INTERNAL_URL

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV API_INTERNAL_URL=$API_INTERNAL_URL
ENV BACKEND_INTERNAL_URL=$BACKEND_INTERNAL_URL
```

Trong `docker-compose.prod.yml`, service `web` phải có:

```yaml
build:
  context: .
  dockerfile: apps/web/Dockerfile
  args:
    NEXT_PUBLIC_API_BASE_URL: ${API_ORIGIN}/api/v1
    API_INTERNAL_URL: http://api:8081/api/v1
    BACKEND_INTERNAL_URL: http://api:8081/api/v1
```

Nếu thiếu chỗ này, browser rất dễ gọi sai sang `localhost`.

---

## Quy trình deploy chuẩn

### Bước 0 — Pull code mới

```bash
git pull
```

Nếu vừa sửa migration ở local, phải chắc chắn server đã nhận commit mới.

---

### Bước 1 — Dựng database trước

```bash
docker compose -f docker-compose.prod.yml up -d postgres redis
```

Kiểm tra:

```bash
docker ps
```

Kỳ vọng:

- `postgres` healthy
- `redis` healthy

Không dựng `web`/`nginx` trước khi DB sẵn sàng.

---

### Bước 2 — Chạy migration

Không chạy migration trong runtime container `api` nếu container đó không chứa schema/source đầy đủ.

Dùng container Node tạm thời trong cùng Docker network.

Lấy biến DB từ `.env`:

```bash
POSTGRES_DB=$(grep '^POSTGRES_DB=' .env | cut -d= -f2-)
POSTGRES_USER=$(grep '^POSTGRES_USER=' .env | cut -d= -f2-)
POSTGRES_PASSWORD=$(grep '^POSTGRES_PASSWORD=' .env | cut -d= -f2-)
```

Chạy migrate:

```bash
docker run --rm \
  --network supportops-monorepo_supportops_net \
  -e DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public" \
  -v "$PWD":/app \
  -w /app \
  node:20-alpine \
  sh -lc "corepack enable && pnpm dlx prisma@6.7.0 migrate deploy --schema=./apps/api/prisma/schema.prisma"
```

### Nếu migration từng fail trước đó
Có thể cần `migrate resolve --rolled-back ...` trước khi `migrate deploy`.

### Nếu migration fail vì thứ tự sai
Fix ở local, verify trên DB trống, commit, push, rồi server mới `git pull` lại.

Không vá migration trực tiếp trên server trừ khi bạn thật sự đang làm hotfix production.

---

### Bước 3 — Chạy seed

Seed chỉ chạy sau khi migration pass.

Lệnh seed chuẩn:

```bash
POSTGRES_DB=$(grep '^POSTGRES_DB=' .env | cut -d= -f2-)
POSTGRES_USER=$(grep '^POSTGRES_USER=' .env | cut -d= -f2-)
POSTGRES_PASSWORD=$(grep '^POSTGRES_PASSWORD=' .env | cut -d= -f2-)

docker run --rm \
  --network supportops-monorepo_supportops_net \
  -e DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public" \
  -v "$PWD":/app \
  -w /app/apps/api \
  node:20-alpine \
  sh -lc "corepack enable && apk add --no-cache libc6-compat python3 make g++ git && HUSKY=0 pnpm install --frozen-lockfile && pnpm exec prisma generate --schema=./prisma/schema.prisma && pnpm exec ts-node --transpile-only prisma/seed.ts"
```

### Tại sao seed phải đi theo cách này
Vì seed của repo hiện tại phụ thuộc:

- source code thật
- Prisma client generate đúng schema
- `ts-node`
- DB URL đúng

### Verify seed xong
Kiểm tra user demo có tồn tại chưa:

```bash
POSTGRES_DB=$(grep '^POSTGRES_DB=' .env | cut -d= -f2-)
POSTGRES_USER=$(grep '^POSTGRES_USER=' .env | cut -d= -f2-)

docker compose -f docker-compose.prod.yml exec postgres \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -c "SELECT id, email FROM \"User\" WHERE email = 'admin@supportops-demo.com';"
```

Kỳ vọng: có ít nhất 1 row.

---

### Bước 4 — Dựng API

```bash
docker compose -f docker-compose.prod.yml up -d --build api
```

Kiểm tra log:

```bash
docker compose -f docker-compose.prod.yml logs --tail=100 api
```

### Health check API

```bash
curl -i https://api.thannguyen.org/api/v1/health
```

Kỳ vọng: `200 OK`

---

### Bước 5 — Test login API trước khi dựng web

Đây là bước rất quan trọng.

```bash
curl -i 'https://api.thannguyen.org/api/v1/auth/login' \
  -H 'Origin: https://app.thannguyen.org' \
  -H 'Content-Type: application/json' \
  --data '{"email":"admin@supportops-demo.com","password":"DemoPass123!","rememberMe":false}'
```

### Kỳ vọng hợp lệ
- `200` nếu đúng account/password
- `401` nếu password/email sai

### Không chấp nhận
- `500`

Nếu vẫn là `500`, quay lại fix backend/API/DB trước. Không dựng web tiếp.

---

### Bước 6 — Dựng Web

```bash
docker compose -f docker-compose.prod.yml up -d --build web
```

Kiểm tra log:

```bash
docker compose -f docker-compose.prod.yml logs --tail=100 web
```

### Kiểm tra bundle không còn bake localhost

```bash
docker compose -f docker-compose.prod.yml exec web sh -lc "grep -R 'localhost:8080/api/v1' . 2>/dev/null | head -20"
```

Kỳ vọng: không ra gì.

### Kiểm tra URL đúng đã vào bundle chưa

```bash
docker compose -f docker-compose.prod.yml exec web sh -lc "grep -R 'api.thannguyen.org/api/v1' . 2>/dev/null | head -20"
```

---

### Bước 7 — Test login UI

Mở trình duyệt:

- `https://app.thannguyen.org`

Test login bằng:

- `admin@supportops-demo.com`
- `DemoPass123!`

Nếu lỗi, mở DevTools > Network.

### Điều cần nhìn
- Request URL có đúng là `https://api.thannguyen.org/api/v1/auth/login` không
- Status code là gì
- Response message là gì

### Cách hiểu nhanh
- `localhost:8080` → build-time env sai
- `500` → API/backend/DB lỗi
- `401 Invalid credentials` → seed/account/password chưa đúng

---

### Bước 8 — Dựng nginx

```bash
docker compose -f docker-compose.prod.yml up -d --force-recreate nginx
```

Kiểm tra:

```bash
docker compose -f docker-compose.prod.yml logs --tail=200 nginx
docker compose -f docker-compose.prod.yml exec nginx nginx -t
```

---

## HTTPS / TLS

### Xin cert bằng webroot
Trước khi xin cert, nginx phải route:

- `/.well-known/acme-challenge/`

về:

- `/var/www/certbot`

Ví dụ test file challenge:

```bash
mkdir -p deploy/nginx/www/.well-known/acme-challenge
echo "ok-certbot" > deploy/nginx/www/.well-known/acme-challenge/test.txt
```

Browser phải mở được:

- `http://app.thannguyen.org/.well-known/acme-challenge/test.txt`
- `http://api.thannguyen.org/.well-known/acme-challenge/test.txt`

### Xin cert

```bash
certbot certonly --webroot \
  -w /root/supportops-monorepo/deploy/nginx/www \
  -d app.thannguyen.org \
  -d api.thannguyen.org
```

### Copy cert vào thư mục nginx mount

```bash
mkdir -p deploy/nginx/certs
cp /etc/letsencrypt/live/app.thannguyen.org/fullchain.pem deploy/nginx/certs/fullchain.pem
cp /etc/letsencrypt/live/app.thannguyen.org/privkey.pem deploy/nginx/certs/privkey.pem
```

### Kiểm tra cert trong container

```bash
docker compose -f docker-compose.prod.yml exec nginx ls -la /etc/nginx/certs
```

---

## Nginx template tối thiểu

Nginx phải có cả:

- port `80` redirect sang HTTPS
- port `443 ssl` với cert/key thật

Và challenge path phải được đặt trước `location /`.

Nếu `curl -vk https://127.0.0.1` fail handshake, hãy kiểm tra ngay:

- file cert có tồn tại không
- config render ra có `listen 443 ssl;` không
- `nginx -t` có pass không

---

## Checklist deploy nhanh

### Trước khi deploy
- [ ] Local migrate pass trên DB trống
- [ ] Local seed pass
- [ ] Demo login pass ở local
- [ ] Repo đã push code mới

### Trên server
- [ ] `git pull`
- [ ] `.env` đúng
- [ ] `postgres` + `redis` healthy
- [ ] migration pass
- [ ] seed pass
- [ ] user demo tồn tại trong DB
- [ ] API health = 200
- [ ] API login không còn 500
- [ ] Web build không còn `localhost`
- [ ] UI login gọi đúng API URL
- [ ] nginx pass `nginx -t`
- [ ] HTTPS mở được

---

## Demo credential hiện tại

Theo repo:

- Email: `admin@supportops-demo.com`
- Password: `DemoPass123!`

Nếu login 401, kiểm tra lại:

1. seed đã chạy chưa
2. user có tồn tại trong DB chưa
3. seed file có còn đúng credential đó không

---

## Những lỗi đã từng gặp và cách nhận biết nhanh

### 1. Frontend gọi `localhost:8080`
**Dấu hiệu:** browser Network request URL là `http://localhost:8080/...`

**Nguyên nhân:** `NEXT_PUBLIC_API_BASE_URL` không vào build-time

**Fix:** sửa `apps/web/Dockerfile` + `build.args` trong compose

### 2. Login 500
**Dấu hiệu:** API trả `500 Internal Server Error`

**Nguyên nhân:** DB schema/migration/backend lỗi

**Fix:** quay lại migrate/API, chưa test web tiếp

### 3. Login 401
**Dấu hiệu:** API trả `401 Invalid credentials`

**Nguyên nhân:** user demo chưa được seed hoặc password không đúng

**Fix:** seed lại, verify DB có user

### 4. HTTPS port 443 mở nhưng vẫn fail
**Dấu hiệu:** `SSL_ERROR_SYSCALL`, browser không connect được HTTPS

**Nguyên nhân:** nginx chưa có 443 ssl thật hoặc cert chưa mount

**Fix:** kiểm tra nginx conf render, cert folder, `nginx -t`

### 5. Certbot challenge 404
**Dấu hiệu:** `/.well-known/acme-challenge/...` ra 404 từ web/api

**Nguyên nhân:** nginx chưa có location riêng cho challenge path

**Fix:** thêm `location ^~ /.well-known/acme-challenge/`

---

## Khuyến nghị cải tiến repo về sau

### 1. Thêm `migrate` service và `seed` service trong compose
Để khỏi phải dùng `docker run node:20-alpine ...` dài dòng.

### 2. Thêm script root-level
Ví dụ:
- `deploy:migrate`
- `deploy:seed`
- `deploy:bootstrap`

### 3. Thêm `DATABASE_URL` rõ ràng trong `.env.prod.example`

### 4. Giữ migration chain luôn test được từ DB trống
Đây là rule bắt buộc nếu muốn deploy ổn định.

### 5. Viết thêm tài liệu `LOCAL_SETUP.md`
Tách riêng cho local dev và local DB reset/seed flow.

---

## Quy tắc cuối cùng

Nếu gặp lỗi, luôn hỏi theo thứ tự:

1. **DNS đúng chưa?**
2. **Container chạy chưa?**
3. **DB migrate xong chưa?**
4. **Seed có dữ liệu chưa?**
5. **API có usable chưa?**
6. **Frontend có gọi đúng URL chưa?**
7. **Nginx/HTTPS có đúng chưa?**

Không nhảy thẳng vào UI message rồi đoán.

---

## Trạng thái thành công tối thiểu

Deploy được coi là thành công khi đạt đủ:

- `https://app.thannguyen.org` mở được
- `https://api.thannguyen.org/api/v1/health` trả 200
- login bằng demo account thành công
- UI không gọi `localhost`
- không còn `500` ở API login

---

## Ghi chú

Tài liệu này nên được cập nhật mỗi khi:

- đổi flow migration
- đổi cách seed
- đổi Dockerfile web
- đổi cách mount cert/nginx
- đổi demo credential

