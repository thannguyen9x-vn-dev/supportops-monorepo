# TASK-FINAL — Cleanup + AGENT_TASKS.md update
> **Phase:** FINAL
> **Prereq:** TẤT CẢ tasks TASK-000 → TASK-506 đã PASS

---

## Mục tiêu
Đánh dấu tất cả Acceptance Criteria đã hoàn thành, chạy full regression,
và cập nhật trạng thái dự án.

---

## Checklist trước khi bắt đầu

```text
[ ] pnpm typecheck        → 0 errors
[ ] pnpm lint             → 0 errors
[ ] api test              → 0 failures
[ ] web test              → 0 failures
[ ] worker test           → 0 failures
[ ] api build             → SUCCESS
[ ] web build             → SUCCESS
[ ] worker start          → không crash
```

---

## Files cần sửa

```text
docs/
├── AGENT_TASKS.md         ← SỬA: đổi [ ] → [x] cho AC đã pass
└── tasks/v2/_STATUS.md    ← SỬA: update bảng progress + log
```

---

## Spec chi tiết

### `docs/AGENT_TASKS.md` — cập nhật AC checklist

Đổi tất cả `[ ]` → `[x]` cho các AC sau (theo REQ-00002):

#### AC-E1 — Notification (TASK-301 → TASK-304 → TASK-501 → TASK-502)
```markdown
[x] AC-E1.1: User nhận in-app notification khi request được assign cho họ
[x] AC-E1.2: User nhận in-app notification khi request họ tạo có comment mới
[x] AC-E1.3: User nhận notification khi được @mention trong comment
[x] AC-E1.4: OPS nhận notification khi request mới tạo vào queue của họ (fallback: all OPS_COORDINATOR)
[x] AC-E1.5: User có thể mark notification là đã đọc (single + all)
[x] AC-E1.6: Unread count hiển thị trên bell icon, update realtime qua SSE
[x] AC-E1.7: User có thể tắt/bật từng loại notification (in-app + email)
```

#### AC-E2 — Email Notification (TASK-402)
```markdown
[x] AC-E2.1: Email gửi ngay cho REQUEST_ASSIGNED, REQUEST_MENTIONED, SLA_NEAR_BREACH_*
[x] AC-E2.2: Email digest gom events trong 5 phút cho REQUEST_CREATED, STATUS_CHANGED, COMMENTED
[x] AC-E2.3: Rate limit: max 5 emails/user/request/giờ
[x] AC-E2.4: Không gửi email nếu user tắt email preference cho event đó
```

#### AC-E3 — SLA Near-breach (TASK-308 → TASK-401 → TASK-503)
```markdown
[x] AC-E3.1: Notification gửi khi SLA còn ≤ nearBreachThresholdMinutes (default 30m)
[x] AC-E3.2: Không gửi duplicate near-breach notification (idempotency guard)
[x] AC-E3.3: SLA tự động pause khi request → WAITING_FOR_CUSTOMER
[x] AC-E3.4: SLA tự động resume khi request rời WAITING_FOR_CUSTOMER
[x] AC-E3.5: SLA badge trong UI hiển thị đúng state: ON_TRACK / NEAR_BREACH / PAUSED / BREACHED
[x] AC-E3.6: Countdown timer trong RequestDetail cập nhật real-time (mỗi 30 giây)
```

#### AC-E4 — Request Watcher (TASK-303)
```markdown
[x] AC-E4.1: User có thể watch/unwatch request
[x] AC-E4.2: Creator auto-watch khi tạo request
[x] AC-E4.3: Assignee auto-watch khi được assign
[x] AC-E4.4: Watcher nhận notification giống assignee
```

#### AC-E5 — Knowledge Base (TASK-305 → TASK-504)
```markdown
[x] AC-E5.1: TECHNICIAN+ có thể tạo/edit/delete bài viết
[x] AC-E5.2: EMPLOYEE chỉ xem PUBLISHED articles
[x] AC-E5.3: Full-text search hoạt động (title + body)
[x] AC-E5.4: KB Picker trong CommentComposer — chèn article link
[x] AC-E5.5: Soft delete — không xóa vĩnh viễn
```

#### AC-E6 — Canned Response (TASK-306 → TASK-505)
```markdown
[x] AC-E6.1: OPS_COORDINATOR+ có thể tạo/edit/delete canned response
[x] AC-E6.2: TECHNICIAN có thể dùng (read) nhưng không edit
[x] AC-E6.3: Gõ "/" trong CommentComposer → picker dropdown hiện ra
[x] AC-E6.4: Chọn response → text được chèn với {{variables}} đã resolved
[x] AC-E6.5: Shortcut unique per tenant
```

#### AC-E7 — Reporting (TASK-307 → TASK-506)
```markdown
[x] AC-E7.1: OPS_COORDINATOR+ xem được dashboard
[x] AC-E7.2: Filter theo date range (max 90 ngày)
[x] AC-E7.3: 7 KPI summary cards hiển thị đúng
[x] AC-E7.4: Volume by Status chart
[x] AC-E7.5: Trend (Created vs Resolved) line chart
[x] AC-E7.6: Volume by Service Type chart (Gap 5 fix)
[x] AC-E7.7: Filter theo assignee (OPS_COORDINATOR+)
```

#### AC-TQ — Technical Quality
```markdown
[x] AC-TQ.1: pnpm typecheck → 0 errors
[x] AC-TQ.2: pnpm lint → 0 errors
[x] AC-TQ.3: api test coverage ≥ 80% cho code mới
[x] AC-TQ.4: web test cho tất cả new components
[x] AC-TQ.5: Tất cả endpoints mới có security checklist pass
[x] AC-TQ.6: Không có tenantId isolation gap
[x] AC-TQ.7: Worker start không crash
```

---

### `_STATUS.md` — update final

```markdown
## Progress Overview (FINAL)

| Phase | Tasks | Done | Status |
|---|---|---|---|
| PHASE 0 — Bootstrap | 1 | 1 | ✅ Done |
| PHASE 1 — Types | 5 | 5 | ✅ Done |
| PHASE 2 — Database | 2 | 2 | ✅ Done |
| PHASE 3 — Backend | 8 | 8 | ✅ Done |
| PHASE 4 — Worker | 2 | 2 | ✅ Done |
| PHASE 5 — Frontend | 6 | 6 | ✅ Done |
| **TOTAL** | **24** | **24** | ✅ COMPLETE |
```

---

## Full regression commands (chạy theo thứ tự)

```bash
# 1. Types
pnpm typecheck

# 2. Lint
pnpm lint

# 3. Unit tests
pnpm --filter @supportops/api    test --passWithNoTests
pnpm --filter @supportops/web    test --passWithNoTests
pnpm --filter @supportops/worker test --passWithNoTests
pnpm --filter @supportops/types  test --passWithNoTests

# 4. Build
pnpm --filter @supportops/api    build
pnpm --filter @supportops/web    build

# 5. DB integrity
pnpm --filter @supportops/api prisma validate
pnpm --filter @supportops/api prisma migrate status

# 6. Worker start check
pnpm --filter @supportops/worker start &
sleep 5 && curl -f http://localhost:3001/health || echo "Worker health check failed"
```

---

## Báo cáo xong (template)

```text
✅ V2 IMPLEMENTATION COMPLETE

PHASE 0 — Bootstrap:   TASK-000 ✅
PHASE 1 — Types:       TASK-101 ✅ TASK-102 ✅ TASK-103 ✅ TASK-104 ✅ TASK-105 ✅
PHASE 2 — Database:    TASK-201 ✅ TASK-202 ✅
PHASE 3 — Backend:     TASK-301 ✅ TASK-302 ✅ TASK-303 ✅ TASK-304 ✅
                       TASK-305 ✅ TASK-306 ✅ TASK-307 ✅ TASK-308 ✅
PHASE 4 — Worker:      TASK-401 ✅ TASK-402 ✅
PHASE 5 — Frontend:    TASK-501 ✅ TASK-502 ✅ TASK-503 ✅
                       TASK-504 ✅ TASK-505 ✅ TASK-506 ✅

typecheck:  PASS
lint:       PASS
api test:   PASS
web test:   PASS
api build:  PASS
web build:  PASS
worker:     PASS

AC-E1 → AC-E7 + AC-TQ: tất cả [x]
docs/AGENT_TASKS.md: updated
```
