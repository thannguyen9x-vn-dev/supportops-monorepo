# TASK-301 — NestJS: Permission seed — report.export
> **Phase:** 3 — NestJS Backend | **Prereq:** none | **Status:** ⏳ Pending

## Mục tiêu
Thêm permission `report.export` vào seed data và gán cho role `TENANT_ADMIN`. Đây là bước bắt buộc trước khi NestJS controller có thể enforce guard.

## Files cần tạo / sửa

```text
apps/api/prisma/seed.ts    ← MODIFIED (thêm permission + gán role)
```

## Spec chi tiết

### Tìm và sửa `apps/api/prisma/seed.ts`

**Bước 1:** Tìm phần seed `AuthPermission` (hoặc `permissions` array) và thêm entry mới:

```typescript
// Trong mảng permissions hoặc block upsert AuthPermission:
{ code: 'report.export', description: 'Export operational reports (CSV/Excel/PDF)' }
```

Pattern thường thấy trong seed:
```typescript
const permissions = await Promise.all([
  // ... existing permissions ...
  prisma.authPermission.upsert({
    where: { code: 'report.export' },
    create: { code: 'report.export', description: 'Export operational reports (CSV/Excel/PDF)' },
    update: {},
  }),
])
```

**Bước 2:** Tìm phần gán permission cho `TENANT_ADMIN` role (block `AuthRolePermission`) và thêm mapping:

```typescript
// Trong phần seed role-permission mapping cho TENANT_ADMIN:
prisma.authRolePermission.upsert({
  where: {
    roleId_permissionId: {
      roleId: tenantAdminRole.id,
      permissionId: reportExportPermission.id,
    },
  },
  create: {
    roleId: tenantAdminRole.id,
    permissionId: reportExportPermission.id,
  },
  update: {},
}),
```

> Xem cách các permission khác được gán (ví dụ `audit.read`) để đặt đúng pattern. Dùng `upsert` để idempotent — chạy seed nhiều lần không bị lỗi duplicate.

### Chạy seed để apply

```bash
cd apps/api
npx prisma db seed
```

## Quality gate

```bash
cd apps/api

# Chạy seed:
npx prisma db seed
# Expected: không có lỗi

# Verify trong DB (psql hoặc Prisma Studio):
npx prisma studio
# Kiểm tra bảng AuthPermission có row 'report.export'
# Kiểm tra bảng AuthRolePermission có mapping TENANT_ADMIN ↔ report.export
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-302** (sau khi TASK-101 xong)
