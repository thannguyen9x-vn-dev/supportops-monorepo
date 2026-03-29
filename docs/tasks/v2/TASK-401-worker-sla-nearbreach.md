# TASK-401 — Worker: SLA Near-breach Job
> **Phase:** 4 — Worker
> **Prereq:** TASK-000 (worker bootstrap) + TASK-308 (sla.isNearBreach) done

---

## Mục tiêu
Job chạy mỗi 1 phút, quét tất cả SlaRecord sắp breach → emit notification,
đồng thời đánh dấu record đã breach nếu quá deadline.

---

## Files cần tạo / sửa

```text
apps/worker/src/jobs/
└── sla-check.job.ts     ← SỬA (đã có) hoặc TẠO MỚI nếu chưa tồn tại
```

---

## Spec chi tiết

### Full job logic
```typescript
import { Worker, Queue } from 'bullmq';
import { PrismaClient }  from '@prisma/client';
import { QUEUE_NAMES, redisConfig } from '../config';

const prisma = new PrismaClient();
const notificationQueue = new Queue(QUEUE_NAMES.NOTIFICATION_FANOUT, { connection: redisConfig });

export async function runSlaCheckJob(): Promise<void> {
  // 1. Query candidates — chỉ lấy records cần kiểm tra
  const records = await prisma.slaRecord.findMany({
    where: {
      isBreached: false,
      nearBreachNotifiedAt: null,       // chưa notify
      pausedAt: null,                    // không đang pause
      request: {
        status: {
          notIn: ['RESOLVED', 'CLOSED', 'CANCELLED', 'WAITING_FOR_CUSTOMER'],
        },
      },
    },
    include: {
      request: {
        select: {
          id: true,
          code: true,
          tenantId: true,
          assigneeId: true,
          creatorId: true,
          slaPolicy: { select: { nearBreachThresholdMinutes: true } },
        },
      },
    },
  });

  for (const record of records) {
    const threshold = record.request.slaPolicy?.nearBreachThresholdMinutes ?? 30;
    const adjustedTarget = new Date(
      record.targetAt.getTime() + record.totalPausedSeconds * 1000
    );
    const minutesRemaining = (adjustedTarget.getTime() - Date.now()) / 60000;

    // ── Near-breach notification ──────────────────────────────────
    if (minutesRemaining > 0 && minutesRemaining <= threshold) {
      await notificationQueue.add('sla.near-breach', {
        type:       record.slaType,   // ASSIGNMENT | RESOLUTION
        requestId:  record.requestId,
        tenantId:   record.request.tenantId,
        assigneeId: record.request.assigneeId,
        minutesRemaining: Math.round(minutesRemaining),
      });

      // Idempotency guard — không notify lần 2
      await prisma.slaRecord.update({
        where: { id: record.id },
        data:  { nearBreachNotifiedAt: new Date() },
      });
    }

    // ── SLA Breached ──────────────────────────────────────────────
    if (minutesRemaining <= 0) {
      await prisma.slaRecord.update({
        where: { id: record.id },
        data:  { isBreached: true, health: 'BREACHED' },
      });

      await notificationQueue.add('sla.breached', {
        type:       record.slaType,
        requestId:  record.requestId,
        tenantId:   record.request.tenantId,
        assigneeId: record.request.assigneeId,
      });
    }
  }
}
```

### Đăng ký vào worker runtime (`worker-runtime.ts`)
```typescript
// Thêm scheduler chạy mỗi 1 phút
import { QueueScheduler, Queue } from 'bullmq';

const slaQueue = new Queue(QUEUE_NAMES.SLA_MONITOR, { connection: redisConfig });

// Repeat job mỗi 60 giây
await slaQueue.add(
  'sla-check',
  {},
  { repeat: { every: 60_000 }, jobId: 'sla-check-recurring' }
);

// Worker processor
new Worker(QUEUE_NAMES.SLA_MONITOR, async (job) => {
  if (job.name === 'sla-check') {
    await runSlaCheckJob();
  }
}, { connection: redisConfig });
```

---

## Test cases bắt buộc (`sla-check.job.test.ts`)
```text
✓ Records đang pause (pausedAt != null) → bị skip
✓ Records đã nearBreachNotifiedAt → bị skip (idempotent)
✓ minutesRemaining ≤ threshold → enqueue notification job
✓ minutesRemaining ≤ 0 → update isBreached=true + enqueue breached
✓ RESOLVED/CLOSED request → bị skip
✓ totalPausedSeconds được cộng vào khi tính adjustedTarget
```

## Quality gate
```bash
pnpm --filter @supportops/worker test sla-check
pnpm typecheck && pnpm lint
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-402**
