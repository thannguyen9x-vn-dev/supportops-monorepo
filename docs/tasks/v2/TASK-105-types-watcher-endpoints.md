# TASK-105 — Types: Watcher + Endpoints update
> **Phase:** 1 — Types | **Prereq:** TASK-101–104 done

---

## Files cần tạo / sửa

```text
packages/types/src/
├── types/
│   └── watcher.types.ts          ← TẠO MỚI
├── service-ops/
│   └── endpoints.ts              ← SỬA: append (KHÔNG xóa cũ)
└── index.ts                       ← SỬA: append exports
```

---

## Spec chi tiết

### `types/watcher.types.ts`
```typescript
export interface RequestWatcher {
  userId:    string;
  userName:  string;
  autoWatch: boolean;
  createdAt: string;
}

export interface WatchStatusResponse {
  requestId: string;
  userId:    string;
  watching:  boolean;
}
```

### `service-ops/endpoints.ts` — CHỈ APPEND, không sửa existing:
```typescript
// ─── V2 Endpoints (append sau existing exports) ───────────────────

export const NOTIFICATION_ENDPOINTS = {
  list:        '/notifications',
  stream:      '/notifications/stream',
  unreadCount: '/notifications/unread-count',
  markRead:    (id: string) => `/notifications/${id}/read`,
  markAllRead: '/notifications/read-all',
} as const;

export const NOTIFICATION_PREFERENCE_ENDPOINTS = {
  get:    '/notification-preferences',
  update: '/notification-preferences',
} as const;

export const WATCHER_ENDPOINTS = {
  watch:   (requestId: string) => `/requests/${requestId}/watch`,
  unwatch: (requestId: string) => `/requests/${requestId}/watch`,
  list:    (requestId: string) => `/requests/${requestId}/watchers`,
} as const;

export const KNOWLEDGE_BASE_ENDPOINTS = {
  list:      '/knowledge-base',
  search:    '/knowledge-base/search',
  create:    '/knowledge-base',
  detail:    (id: string) => `/knowledge-base/${id}`,
  update:    (id: string) => `/knowledge-base/${id}`,
  publish:   (id: string) => `/knowledge-base/${id}/publish`,
  unpublish: (id: string) => `/knowledge-base/${id}/unpublish`,
  delete:    (id: string) => `/knowledge-base/${id}`,
} as const;

export const CANNED_RESPONSE_ENDPOINTS = {
  list:   '/canned-responses',
  search: '/canned-responses/search',
  create: '/canned-responses',
  update: (id: string) => `/canned-responses/${id}`,
  delete: (id: string) => `/canned-responses/${id}`,
} as const;

export const REPORT_ENDPOINTS = {
  overview: '/reports/overview',
} as const;
```

---

## ⚠️ GATE — chạy sau khi xong TASK-105:
```bash
pnpm typecheck   # toàn bộ monorepo — phải 0 errors
pnpm lint        # 0 errors
```
Nếu fail → fix trước khi chuyển sang PHASE 2.

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ — Ghi rõ `pnpm typecheck PASS`
Task tiếp theo: **TASK-201**
