# TASK-306 — BE: Canned Response Module
> **Phase:** 3 — Backend | **Prereq:** TASK-201 done

---

## Files cần tạo

```text
apps/api/src/modules/canned-response/
├── canned-response.module.ts
├── canned-response.controller.ts
├── canned-response.controller.spec.ts
├── canned-response.service.ts
├── canned-response.service.spec.ts
└── dto/
    ├── create-canned-response.dto.ts
    ├── update-canned-response.dto.ts
    └── canned-response-response.dto.ts
```

---

## Spec chi tiết

### Endpoints
| Method | Path | Guard |
|---|---|---|
| GET | `/canned-responses` | Auth + `canned-response.read` |
| POST | `/canned-responses` | Auth + `canned-response.write` |
| GET | `/canned-responses/search` | Auth + `canned-response.read` |
| PUT | `/canned-responses/:id` | Auth + `canned-response.write` |
| DELETE | `/canned-responses/:id` | Auth + `canned-response.write` |

### RBAC
```text
canned-response.read   → TECHNICIAN, OPS_COORDINATOR, TENANT_ADMIN
canned-response.write  → OPS_COORDINATOR, TENANT_ADMIN
```

### Variable resolution method
```typescript
resolveVariables(
  body: string,
  ctx: { requesterName: string; requestCode: string; assigneeName: string }
): string {
  return body
    .replace(/\{\{requester_name\}\}/g, ctx.requesterName)
    .replace(/\{\{request_code\}\}/g,   ctx.requestCode)
    .replace(/\{\{assignee_name\}\}/g,  ctx.assigneeName);
}
```

### Search (for picker — `/` shortcut)
```typescript
// Search by shortcut OR title
where: {
  tenantId,
  isDeleted: false,
  OR: [
    { shortcut: { startsWith: q } },
    { title:    { contains: q, mode: 'insensitive' } },
  ]
}
```

---

## Test cases bắt buộc
```text
✓ EMPLOYEE không thể read canned responses (403)
✓ TECHNICIAN có thể read nhưng không thể write
✓ resolveVariables: thay thế đúng tất cả {{variables}}
✓ Soft delete hoạt động
✓ Shortcut unique per tenant (409 nếu duplicate)
```

## Quality gate
```bash
pnpm --filter @supportops/api test canned-response
pnpm typecheck && pnpm lint
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-307**
