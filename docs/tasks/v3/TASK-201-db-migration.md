# TASK-201 — DB Migration: TenantAiSettings
> **Phase:** 2 — Database | **Prereq:** TASK-101 done | **Status:** ✅ Done

---

## Mục tiêu

Thêm model `TenantAiSettings` vào Prisma schema và tạo migration SQL cho production. DB không khả dụng ở local → tạo file SQL thủ công thay vì chạy `prisma migrate dev`.

---

## Files cần tạo / sửa

```text
apps/api/prisma/schema.prisma                                              ← MODIFIED
apps/api/prisma/migrations/20260406000000_add_tenant_ai_settings/
└── migration.sql                                                          ← NEW
apps/api/prisma/seed.ts                                                    ← MODIFIED
```

---

## Spec chi tiết

### `apps/api/prisma/schema.prisma` — thêm model

```prisma
model TenantAiSettings {
  id           String   @id @default(uuid())
  tenantId     String   @unique
  defaultModel String   @default("claude-sonnet-4-20250514")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  tenant       Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
}
```

Thêm vào model `Tenant`:
```prisma
aiSettings  TenantAiSettings?
```

### `migration.sql`

```sql
CREATE TABLE "TenantAiSettings" (
    "id"           TEXT NOT NULL,
    "tenantId"     TEXT NOT NULL,
    "defaultModel" TEXT NOT NULL DEFAULT 'claude-sonnet-4-20250514',
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TenantAiSettings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TenantAiSettings_tenantId_key" ON "TenantAiSettings"("tenantId");

ALTER TABLE "TenantAiSettings"
    ADD CONSTRAINT "TenantAiSettings_tenantId_fkey"
    FOREIGN KEY ("tenantId")
    REFERENCES "Tenant"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
```

### `apps/api/prisma/seed.ts` — thêm permissions

```typescript
// Thêm vào mảng permissions:
{ code: 'report.read', description: 'View reports and analytics' },
{ code: 'ai.ask',      description: 'Use AI Assistant chat' },
```

TENANT_ADMIN nhận tất cả permissions (bao gồm 2 cái mới) vì seed dùng `permissions.map((p) => p.code)`.

---

## Lưu ý quan trọng

**DB không khả dụng ở local** → KHÔNG chạy `prisma migrate dev`. Thay vào đó:
1. Tạo file migration SQL thủ công
2. Chạy `prisma generate` để cập nhật Prisma Client types

```bash
pnpm --filter @supportops/api exec prisma generate
```

---

## Quality gate

```bash
pnpm --filter @supportops/api exec prisma validate   # schema hợp lệ
pnpm --filter @supportops/api exec prisma generate   # client types updated
pnpm typecheck                                        # 0 errors
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-301**
