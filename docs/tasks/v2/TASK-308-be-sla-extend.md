# TASK-308 — BE: SLA Extend (pause/resume + near-breach)
> **Phase:** 3 — Backend
> **Prereq:** TASK-201 done (SlaRecord.totalPausedSeconds + nearBreachNotifiedAt đã có)

---

## Mục tiêu
Extend SLA service với pause/resume logic khi request vào/ra trạng thái `WAITING_FOR_CUSTOMER`,
và thêm helper `isNearBreach()` cho TASK-401 dùng.

---

## Files cần sửa

```text
apps/api/src/modules/service-ops/sla/
└── sla.service.ts           ← SỬA: thêm 5 methods

apps/api/src/modules/service-ops/request/
└── request.service.ts       ← SỬA: wire pause/resume vào status transition
```

---

## Spec chi tiết

### 5 methods mới trong `sla.service.ts`

#### 1. `pauseSla()`
```typescript
async pauseSla(tenantId: string, requestId: string): Promise<void> {
  // Set pausedAt = now() trên SlaRecord(s) của request
  // Chỉ pause nếu pausedAt IS NULL (idempotent)
  await prisma.slaRecord.updateMany({
    where: {
      tenantId,
      requestId,
      pausedAt: null,         // chưa pause
      isBreached: false,      // đã breach thì không cần pause nữa
    },
    data: { pausedAt: new Date() },
  });
}
```

#### 2. `resumeSla()`
```typescript
async resumeSla(tenantId: string, requestId: string): Promise<void> {
  // Với mỗi SlaRecord đang pause:
  //   pausedSeconds = now - pausedAt
  //   totalPausedSeconds += pausedSeconds
  //   pausedAt = null (clear)
  const records = await prisma.slaRecord.findMany({
    where: { tenantId, requestId, pausedAt: { not: null } },
  });

  const now = new Date();
  await prisma.$transaction(
    records.map(r => {
      const pausedSeconds = Math.floor((now.getTime() - r.pausedAt!.getTime()) / 1000);
      return prisma.slaRecord.update({
        where: { id: r.id },
        data: {
          totalPausedSeconds: r.totalPausedSeconds + pausedSeconds,
          pausedAt: null,
        },
      });
    })
  );
}
```

#### 3. `calculateDueAt()`
```typescript
// Tính lại targetAt sau khi resume (dịch deadline về tương lai)
calculateAdjustedTargetAt(originalTargetAt: Date, totalPausedSeconds: number): Date {
  return new Date(originalTargetAt.getTime() + totalPausedSeconds * 1000);
}
```

#### 4. `isNearBreach()`
```typescript
isNearBreach(record: SlaRecord, thresholdMinutes: number): boolean {
  if (record.isBreached || record.pausedAt !== null) return false;
  const adjustedTarget = this.calculateAdjustedTargetAt(record.targetAt, record.totalPausedSeconds);
  const minutesRemaining = (adjustedTarget.getTime() - Date.now()) / 60000;
  return minutesRemaining > 0 && minutesRemaining <= thresholdMinutes;
}
```

#### 5. `markNearBreachNotified()`
```typescript
async markNearBreachNotified(tenantId: string, recordId: string): Promise<void> {
  await prisma.slaRecord.update({
    where: { id: recordId, tenantId },
    data: { nearBreachNotifiedAt: new Date() },
  });
}
```

---

### Wire vào `request.service.ts` — status transition

```typescript
// Trong method xử lý status change (updateStatus / transitionStatus):
const prevStatus = request.status;
const newStatus  = dto.status;

// WAITING_FOR_CUSTOMER → pause SLA
if (newStatus === RequestStatus.WAITING_FOR_CUSTOMER) {
  await this.slaService.pauseSla(tenantId, requestId);
}

// Rời WAITING_FOR_CUSTOMER → resume SLA
if (prevStatus === RequestStatus.WAITING_FOR_CUSTOMER
    && newStatus !== RequestStatus.WAITING_FOR_CUSTOMER) {
  await this.slaService.resumeSla(tenantId, requestId);
}
```

---

## Test cases bắt buộc
```text
✓ pauseSla: set pausedAt = now
✓ pauseSla: idempotent (gọi 2 lần không lỗi, pausedAt không thay đổi)
✓ resumeSla: totalPausedSeconds tăng đúng
✓ resumeSla: pausedAt = null sau khi resume
✓ isNearBreach: true khi còn đúng threshold
✓ isNearBreach: false khi đang pause
✓ isNearBreach: false khi đã breach
✓ Status → WAITING_FOR_CUSTOMER: pauseSla được gọi
✓ Status ← WAITING_FOR_CUSTOMER: resumeSla được gọi
```

## Quality gate
```bash
pnpm --filter @supportops/api test sla
pnpm --filter @supportops/api build   # ← PHASE 3 GATE
pnpm typecheck && pnpm lint
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ — Ghi rõ `api build PASS`
Task tiếp theo: **TASK-401**
