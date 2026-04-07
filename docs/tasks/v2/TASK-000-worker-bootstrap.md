# TASK-000 — Worker Bootstrap (BullMQ)
> **Phase:** 0 — Bootstrap
> **Priority:** 🔴 CRITICAL — blocks TASK-401 + TASK-402
> **Prereq:** Đọc `_CONTEXT.md` trước

---

## Mục tiêu
Bootstrap `apps/worker` để BullMQ Worker có thể khởi động, connect Redis và đăng ký jobs. Đây là nền tảng cho toàn bộ async processing của V2.

---

## Files cần tạo / sửa

```text
apps/worker/
├── src/
│   ├── config.ts              ← THÊM: REDIS_URL, queue name constants
│   ├── worker-runtime.ts      ← TẠO MỚI: khởi tạo BullMQ Worker instances
│   └── main.ts                ← SỬA: import + start worker-runtime
└── package.json               ← THÊM dependency: bullmq (nếu chưa có)
```

---

## Spec chi tiết

### `apps/worker/src/config.ts` — thêm:
```typescript
export const QUEUE_NAMES = {
  NOTIFICATION_FANOUT: 'notification-fanout',
  EMAIL_IMMEDIATE:     'email-immediate',
  EMAIL_DIGEST:        'email-digest',
  SLA_MONITOR:         'sla-monitor',
} as const;

export const redisConfig = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT ?? 6379),
  password: process.env.REDIS_PASSWORD,
};
```

### `apps/worker/src/worker-runtime.ts` — tạo mới:
```typescript
import { Worker } from 'bullmq';
import { QUEUE_NAMES, redisConfig } from './config';

export function startWorkers(): Worker[] {
  const connection = redisConfig;
  const workers: Worker[] = [];

  // Placeholder processors — sẽ được implement ở TASK-401 + TASK-402
  workers.push(new Worker(QUEUE_NAMES.SLA_MONITOR, async (job) => {
    // TASK-401 sẽ implement
  }, { connection }));

  workers.push(new Worker(QUEUE_NAMES.EMAIL_IMMEDIATE, async (job) => {
    // TASK-402 sẽ implement
  }, { connection }));

  workers.push(new Worker(QUEUE_NAMES.EMAIL_DIGEST, async (job) => {
    // TASK-402 sẽ implement
  }, { connection }));

  return workers;
}
```

---

## Acceptance criteria
- [ ] `apps/worker` start không crash khi Redis available
- [ ] Log hiển thị "Worker connected to Redis"
- [ ] `QUEUE_NAMES` constants exported, import được từ job files

## Quality gate
```bash
pnpm --filter @supportops/worker build   # 0 errors
pnpm typecheck                            # 0 errors
pnpm lint                                 # 0 errors
```

## Báo cáo xong
Cập nhật `_STATUS.md`: đánh dấu TASK-000 ✅
Task tiếp theo: **TASK-101**
