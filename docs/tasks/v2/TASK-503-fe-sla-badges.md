# TASK-503 — FE: SLA Badges trong Request UI
> **Phase:** 5 — Frontend
> **Prereq:** TASK-308 done (BE trả về totalPausedSeconds + isBreached)

---

## Files cần sửa / tạo

```text
apps/web/src/features/service-ops/requests/components/
├── cards/
│   └── SlaCard.tsx                    ← SỬA: 2 timers + near-breach + paused state
├── list/
│   └── RequestTableColumns.tsx        ← SỬA: thêm SLA indicator column
└── shared/
    └── SlaStateChip.tsx               ← SỬA: thêm NEAR_BREACH + PAUSED state

apps/web/src/features/service-ops/requests/hooks/
└── useSlaCountdown.ts                 ← TẠO MỚI (≤ 60 lines)
```

---

## Spec chi tiết

### `SlaStateChip.tsx` — thêm states mới
```typescript
// Các states hiện có (giữ nguyên) + thêm:
type SlaState = 'ON_TRACK' | 'AT_RISK' | 'BREACHED' | 'NEAR_BREACH' | 'PAUSED';

// NEAR_BREACH: màu vàng/warning + icon warning
// PAUSED:      màu grey + icon pause
// BREACHED:    màu đỏ + icon error (đã có, confirm styling)
```

### `useSlaCountdown.ts`
```typescript
// Hook tính countdown real-time từ targetAt + totalPausedSeconds
export function useSlaCountdown(targetAt: string, totalPausedSeconds: number, isPaused: boolean) {
  const [minutesRemaining, setMinutesRemaining] = useState<number>(0);

  useEffect(() => {
    if (isPaused) return;  // không đếm khi đang pause

    function tick() {
      const adjustedTarget = new Date(targetAt).getTime() + totalPausedSeconds * 1000;
      const remaining = (adjustedTarget - Date.now()) / 60000;
      setMinutesRemaining(Math.max(0, remaining));
    }

    tick();
    const interval = setInterval(tick, 30_000);  // update mỗi 30 giây
    return () => clearInterval(interval);
  }, [targetAt, totalPausedSeconds, isPaused]);

  return minutesRemaining;
}
```

### `SlaCard.tsx` — layout mới
```text
┌─────────────────────────────────────────┐
│ SLA Status                              │
├──────────────────┬──────────────────────┤
│ ASSIGNMENT       │ RESOLUTION           │
│ ⏱ 2h 30m left   │ ⚠️ 45m left (NEAR)  │
│ Due: 14:00       │ Due: 18:00           │
│ [ON_TRACK chip]  │ [NEAR_BREACH chip]   │
├──────────────────┴──────────────────────┤
│ [PAUSED] SLA paused — Waiting for cust. │  ← chỉ hiện khi status = WAITING
└─────────────────────────────────────────┘
```

### `RequestTableColumns.tsx` — thêm SLA column
```typescript
// Thêm column "SLA" vào table (sau Priority column)
// Hiển thị: SlaStateChip với state của SLA resolution (nếu có)
// Nếu isBreached → icon đỏ
// Nếu NEAR_BREACH → icon vàng
// Nếu ON_TRACK → icon xanh
// Nếu không có SLA policy → "-"
```

### i18n keys
```json
"sla": {
  "title": "SLA",
  "assignment": "Assignment SLA",
  "resolution": "Resolution SLA",
  "breached": "SLA Breached",
  "nearBreach": "Near Breach",
  "paused": "SLA Paused",
  "minutesLeft": "{minutes}m remaining",
  "hoursLeft": "{hours}h {minutes}m remaining",
  "pausedReason": "Waiting for customer response"
}
```

---

## Test cases bắt buộc
```text
✓ SlaStateChip: render đúng màu/icon cho mỗi state
✓ useSlaCountdown: tính đúng minutesRemaining
✓ useSlaCountdown: không đếm khi isPaused=true
✓ SlaCard: hiển thị 2 timers (ASSIGNMENT + RESOLUTION)
✓ SlaCard: hiển thị PAUSED banner khi status = WAITING_FOR_CUSTOMER
✓ SlaCard: NEAR_BREACH state khi còn ≤ threshold
```

## Quality gate
```bash
pnpm --filter @supportops/web test SlaCard
pnpm --filter @supportops/web test SlaStateChip
pnpm typecheck && pnpm lint
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-504**
