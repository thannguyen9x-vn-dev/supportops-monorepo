# TASK-303 — BE: Request Watcher
> **Phase:** 3 — Backend | **Prereq:** TASK-301 done

---

## Mục tiêu
Extend existing `request.controller.ts` + `request.service.ts` với watch/unwatch functionality.

---

## Files cần tạo / sửa

```text
apps/api/src/modules/service-ops/request/
├── request.controller.ts               ← SỬA: thêm 3 endpoints
├── request.service.ts                  ← SỬA: thêm 4 methods
└── dto/
    ├── watch-request-response.dto.ts   ← TẠO MỚI
    └── watcher-list-response.dto.ts    ← TẠO MỚI
```

---

## Spec chi tiết

### Endpoints mới thêm vào `request.controller.ts`
| Method | Path | Guard |
|---|---|---|
| POST | `/requests/:id/watch` | Auth + `request.watch` |
| DELETE | `/requests/:id/watch` | Auth + `request.watch` |
| GET | `/requests/:id/watchers` | Auth + `request.watchers.read` |

### Methods thêm vào `request.service.ts`
```typescript
watchRequest(tenantId: string, userId: string, requestId: string): Promise<WatchStatusResponse>
unwatchRequest(tenantId: string, userId: string, requestId: string): Promise<WatchStatusResponse>
getWatchers(tenantId: string, requestId: string): Promise<RequestWatcherItem[]>

// Gọi tự động khi request tạo mới (creator) hoặc được assigned (assignee)
autoWatch(tenantId: string, userId: string, requestId: string, autoWatch = true): Promise<void>
```

### Auto-watch logic — wire vào existing code:
```text
Khi request.service.ts xử lý:
- createRequest() → gọi autoWatch(tenantId, creatorId, requestId)
- assignRequest() → gọi autoWatch(tenantId, assigneeId, requestId)
```

### RBAC
```text
EMPLOYEE: watch/unwatch own requests chỉ
TECHNICIAN+: watch/unwatch bất kỳ request nào
OPS_COORDINATOR/TENANT_ADMIN: xem watchers list
```

---

## Test cases bắt buộc
```text
✓ watchRequest: tạo RequestWatcher row
✓ watchRequest: idempotent (watch 2 lần không lỗi)
✓ unwatchRequest: xóa row
✓ autoWatch: sets autoWatch=true
✓ EMPLOYEE không thể watch request của người khác (403)
✓ tenantId isolation
```

## Quality gate
```bash
pnpm --filter @supportops/api test request
pnpm typecheck && pnpm lint
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-304**
