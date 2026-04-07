# TASK-201 — DB Migration + Seed

**Phase:** 2A — DB Migration (song song với TASK-301)
**Depends on:** TASK-101 (enum `BULK_IMPORT_COMPLETED` phải có trong types trước)
**Blocks:** TASK-401

---

## Mục tiêu

Thực hiện migration tối thiểu cần thiết cho feature import: thêm enum value `BULK_IMPORT_COMPLETED` vào `NotificationEventType` trong Prisma schema, chạy migration, và cập nhật seed để thêm permission `request.import`.

> **Design Decision D2:** Không tạo `ImportAuditLog` table mới — dùng `AuditLog` hiện có với `entityType: 'BulkImportJob'`.

---

## Danh sách thay đổi

### 1. SỬA: `apps/api/prisma/schema.prisma`

Tìm enum `NotificationEventType`, thêm value mới:

```prisma
enum NotificationEventType {
  REQUEST_CREATED
  REQUEST_ASSIGNED
  REQUEST_STATUS_CHANGED
  REQUEST_COMMENTED
  REQUEST_MENTIONED
  SLA_NEAR_BREACH_RESPONSE
  SLA_NEAR_BREACH_RESOLUTION
  BULK_IMPORT_COMPLETED   // ← THÊM MỚI
}
```

> Đọc schema hiện tại trước để đảm bảo tên enum chính xác và vị trí thêm hợp lý.

---

### 2. CHẠY migration

```bash
cd apps/api
npx prisma migrate dev --name add-bulk-import-notification
```

Kiểm tra migration file được tạo trong `prisma/migrations/` có đúng ALTER TYPE statement.

---

### 3. SỬA: `apps/api/prisma/seed.ts`

Tìm phần seed `AuthPermission` và thêm permission mới:

```typescript
// Thêm vào danh sách permissions được seed:
{ code: 'request.import', description: 'Bulk import service requests' },
```

Tìm phần seed role `OPS_COORDINATOR`, thêm permission vào role này:

```typescript
// OPS_COORDINATOR permissions: thêm 'request.import'
```

> Đọc seed file trước để hiểu cấu trúc — có thể dùng `upsert` hoặc `createMany`. Không xóa permissions hiện có.
>
> `TENANT_ADMIN` thường có toàn bộ permissions — kiểm tra xem có cần thêm thủ công không hay đã được include tự động qua `Object.values()`.

---

### 4. CHẠY seed (sau migration)

```bash
cd apps/api
npx prisma db seed
```

Hoặc nếu seed được chạy qua pnpm:

```bash
pnpm --filter @supportops/api db:seed
```

> Kiểm tra không có lỗi duplicate key — seed nên dùng `upsert`.

---

## Quality Gate

```bash
# Kiểm tra migration đã apply thành công
cd apps/api && npx prisma migrate status

# Kiểm tra schema vẫn generate types đúng
cd apps/api && npx prisma generate

# Build api để đảm bảo Prisma client compatible
pnpm --filter @supportops/api build
```

**Tất cả phải pass trước khi báo Done.**

---

## Checklist

- [ ] `schema.prisma` — `BULK_IMPORT_COMPLETED` thêm vào `NotificationEventType`
- [ ] Migration chạy thành công (`prisma migrate dev`)
- [ ] `seed.ts` — `request.import` permission thêm vào `AuthPermission`
- [ ] `seed.ts` — `OPS_COORDINATOR` role được gán permission `request.import`
- [ ] `db:seed` chạy không lỗi
- [ ] `pnpm --filter @supportops/api build` → PASS
- [ ] `_STATUS.md` cập nhật → ✅ Done
