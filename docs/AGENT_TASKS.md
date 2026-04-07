# SUPPORTOPS — BỘ TASK TỔNG THỂ CHO AGENT

> **Ngày tạo:** 2026-03-22
> **Dùng cho:** Claude Code / Codex / Agent AI
> **Source of truth:** file này + `AGENTS.md` trong repo

---

## PHẦN A — BỨC TRANH TỔNG THỂ

### Kiến trúc monorepo

```
supportops-monorepo/
├── apps/
│   ├── web/          ← Next.js 16 + React 19 + MUI (frontend)
│   ├── api/          ← NestJS + Prisma + PostgreSQL (backend)
│   └── worker/       ← Placeholder (chưa có code thật)
├── packages/
│   ├── ui/           ← @supportops/ui (headless hooks + components)
│   │   ├── form/     ← @supportops/ui-form
│   │   ├── theme/    ← @supportops/ui-theme
│   │   ├── avatar/   ← @supportops/ui-avatar
│   │   ├── file-upload/ ← @supportops/ui-file-upload
│   │   └── dialog/   ← @supportops/ui-dialog
│   ├── types/        ← @supportops/types (shared TypeScript types)
│   ├── tsconfig/     ← @supportops/tsconfig (shared TS configs)
│   └── eslint-config/ ← @supportops/eslint-config
└── docs/             ← Architecture + MVP plan + Runbooks
```

### Domain Map

| Domain | Module | Status |
|---|---|---|
| **Auth & RBAC** | register, login, logout, refresh, verify-email, forgot/reset-password, invite/accept-invite | ✅ Done |
| **User Profile** | get, update, avatar upload, change password, sessions | ✅ Done |
| **Team Management** | list members, invite, deactivate, reactivate, change role, change department | ✅ Done |
| **Requests List** | paginated list, status filter, tabs, SLA health badges | 🔶 In Progress |
| **Create Request** | intake form, draft/submit modes, file attachments | 🔶 In Progress |
| **Request Detail** | view, status transitions, comment, work log, timeline, assign/reassign | 🔶 In Progress |
| **Settings — Workflow** | CRUD workflow transitions | 🔶 In Progress |
| **Settings — SLA** | CRUD SLA policies | 🔶 In Progress |
| **Settings — Service Types** | CRUD service types | 🔶 In Progress |
| **Dashboard** | KPI cards, aggregated data | ❌ Template placeholder |
| **Worker** | SLA jobs, escalation, email | ❌ TODO placeholder |

### Legacy Modules (⛔ KHÔNG ĐƯỢC SỬA)

Các module sau **vẫn còn trong codebase** nhưng đang bị phase out. Agent **KHÔNG ĐƯỢC** sửa, extend, hoặc depend vào:

| Legacy Module | Prisma Models | Lý do |
|---|---|---|
| Product/Projects | `Product`, `ProductImage` | Template demo, không thuộc ServiceOps |
| Kanban/Board | `Board`, `BoardColumn`, `Task` | Template demo |
| Message | `Message` | Template demo |
| Billing/Subscription | `Plan`, `Subscription`, `BillingInfo`, `PaymentMethod` | Retire theo `serviceops-restructure.md` |
| Invoice | `Invoice`, `InvoiceItem` | Retire |

---

## PHẦN B — TRẠNG THÁI CHI TIẾT TỪNG MODULE (Cập nhật 2026-03-22)

### B1. Auth ✅ DONE — Không cần làm gì thêm

**Đã xong:**
- Login/Register/Logout (HttpOnly cookie refresh)
- Verify email (token-based)
- Forgot password → OTP 6 chữ số → Reset password
- Invite member → Accept invite (set password)
- Auth support page (contact info)
- RBAC: 4 roles (`EMPLOYEE`, `OPS_COORDINATOR`, `TECHNICIAN`, `TENANT_ADMIN`)
- Permission-based guards trên tất cả endpoints

**Quy tắc cho Agent:** Không sửa auth flow trừ khi được yêu cầu rõ ràng. Không thêm role mới.

### B2. User Profile & Settings ✅ DONE

**Đã xong:**
- Profile: get/update (firstName, lastName, phone, birthday, country, department...)
- Avatar upload (crop + MinIO)
- Change password (with validation: min 10 chars, upper, lower, number, special)
- Notification preferences (8 items, optimistic toggle)
- Active sessions (list, sign out others)
- Organization & Access card (role label, permission summary)
- 4 tabs: General / Notifications / Security / Sessions

**Technical debt đã biết:**
- Notification API fields dùng tên legacy (`companyNews`, `accountActivity`, `meetupsNearYou`, `newMessages`, `ratingReminders`, `itemUpdateNotif`, `itemCommentNotif`, `buyerReviewNotif`)
- UI labels đã rename về ServiceOps context nhưng API field names chưa đổi
- Mapper layer (`settings.mapper.ts`) xử lý rename giữa API ↔ UI

**Quy tắc cho Agent:** Nếu cần thêm notification type mới → phải thêm ở cả Prisma schema `UserPreference`, mapper, và i18n.

### B3. Team Management ✅ DONE

**Đã xong:**
- List tenant members (table with filters)
- Invite member (email + fullName + role)
- Change role (inline dropdown)
- Change department (inline edit)
- Deactivate / Reactivate member
- Role options: `EMPLOYEE`, `OPS_COORDINATOR`, `TECHNICIAN`, `TENANT_ADMIN`
- Department filter trong table

### B4. Requests List 🔶 IN PROGRESS

**Đã có:**
- Route: `/requests/list`
- RequestListView component (delegate từ page)
- Tabs: All / Submitted+Triage / Unassigned / SLA Risk / Escalated / Closed
- Filters: status, serviceType, assignee, location, slaHealth, updatedToday
- Columns: requestCode, title, serviceType, status, priority, assignee, location, updatedAt, slaHealth, slaDue, actions
- Row actions: view, edit, assign, cancel
- i18n keys đầy đủ (en + vi)
- Pagination
- Real API query đã hỗ trợ: search, status, serviceTypeCode, assigneeId, locationId, slaHealth, updatedToday, tab
- Tab counts lấy từ backend qua `GET /requests/tab-counts`

**Còn thiếu / Cần hoàn tất:**
- [ ] Verify data loading từ API thật với dữ liệu sống
- [ ] Loading / empty / error states kiểm tra lại
- [x] Confirm filter logic hoạt động end-to-end với backend
- [ ] `RequestListView` ~1000 lines → cần tách thành sub-components sau MVP

### B5. Create Request 🔶 IN PROGRESS

**Đã có:**
- Route: `/requests/create`
- Form fields: serviceType, title, description, location, priority (required) + assetId, attachments, impactLevel, urgency, preferredContact (optional)
- Draft + Submit modes
- Summary panel (serviceType, priority, location, expected SLA)
- File upload integration
- i18n keys đầy đủ
- Validation: required fields + title required to submit

**Còn thiếu / Cần hoàn tất:**
- [ ] Verify end-to-end: form submit → API create → redirect to detail
- [ ] Verify file attachment upload → link to request
- [x] Service type dropdown populate từ API
- [ ] Location dropdown populate từ API hoặc config

### B6. Request Detail 🔶 UI DONE, BACKEND PARTIAL

**Đã có (UI):**
- Route: `/requests/[id]`
- `useRequestDetail` hook — rất đầy đủ: load detail workflow, status transition, comment, work log, assign/reassign, assign to me
- Header: status badge, priority badge, requester info, last updated
- Overview panel: serviceType, category, location, asset, createdAt, description
- Timeline: activity events mapped từ `RequestWorkflowActivity`
- Comments: add comment (PUBLIC / INTERNAL visibility)
- Work log: add work log (content + minutesSpent)
- Assignment: assign dialog, reassign, assign to me
- SLA indicators: assignment SLA + resolution SLA (ON_TRACK / AT_RISK / BREACHED)
- Metadata sidebar: tenantName, sourceChannel, impactLevel, urgency, tags
- Access denied handling (403/404 → redirect)
- 10 request statuses: DRAFT → SUBMITTED → TRIAGE → ASSIGNED → IN_PROGRESS → WAITING_EXTERNAL_VENDOR → RESOLVED → CLOSED → REOPENED → CANCELLED

**Backend đã có:**
- `requestService.detailWorkflow(id)` → returns full `RequestWorkflowDetail`
- `requestService.updateStatus(id, { status })`
- `requestService.assign(id, { assigneeId })`
- `requestService.addComment(id, { body, visibility })`
- `requestService.addWorkLog(id, { content, minutesSpent })`
- `requestService.listAssignees()`
- Transition rules đã siết theo role active trong membership

**Còn thiếu / Cần hoàn tất:**
- [x] Verify backend `detailWorkflow` endpoint trả đủ data
- [x] Verify status transition business rules (ai được chuyển status nào)
- [ ] Escalation trigger endpoint
- [ ] Attachment download từ detail page
- [ ] SLA countdown realtime (hiện tính 1 lần khi load)

### B7. Settings — Workflow, SLA, Service Types 🔸 UI SCAFFOLD

**Đã có:**
- 3 routes: `/settings/workflow`, `/settings/sla`, `/settings/service-types`
- i18n keys đầy đủ cho cả 3 pages (form labels, validation messages, feedback, states)
- CRUD form structure (create/edit title, field labels, validation rules)
- Table structure (column headers)
- States: loading, empty, permissionDenied
- Feedback: loadError, saveSuccess, saveError, deleteSuccess, deleteError

**Còn thiếu / Cần hoàn tất:**
- [x] Backend CRUD endpoints cho workflow transitions
- [x] Backend CRUD endpoints cho SLA policies
- [x] Backend CRUD endpoints cho service types
- [x] Frontend wiring: form → service → API
- [x] Validation: serviceTypeCode uniqueness, minutes > 0, etc.

### B8. Dashboard ❌ TEMPLATE PLACEHOLDER

**Hiện trạng:**
- i18n keys vẫn dùng ecommerce: `todaySales`, `todayVisitors`, `weekVisitors`, `latestCustomers`, `transactions`
- **PHẢI viết lại hoàn toàn**, không refactor trên template cũ

### B9. Worker ❌ TODO PLACEHOLDER

**Hiện trạng:**
- `apps/worker/package.json` có build = `echo "TODO: implement worker build"`
- `apps/worker/README.md` = "placeholder for background jobs"
- `docs/worker-roadmap.md` có planned scope (nhưng lẫn legacy billing scope)

---

## PHẦN C — GIAI ĐOẠN 1: KHÓA MVP

> **Mục tiêu:** Hoàn tất Requests vertical end-to-end + Settings backend + Docs sync
> **Ước lượng:** 3–4 tuần

### TASK 1.1 — Hoàn tất Create Request end-to-end

**Mô tả:** Đảm bảo Create Request form hoạt động end-to-end: user điền form → submit → API tạo request → redirect về detail page.

**Scope:**

| Layer | Package/Module | Ghi chú |
|---|---|---|
| Frontend | `apps/web` — feature `service-ops/requests` | Wire form → service → API |
| Backend | `apps/api` — module `service-ops/request` | Verify create endpoint |
| Types | `packages/types` — `CreateServiceRequestInput` | Đã có, verify contract |

**Acceptance Criteria:**
- [x] Chọn service type từ dropdown (data từ API)
- [x] Điền title, description, location, priority → Submit → API trả success
- [x] File attachments upload → link vào request
- [ ] Draft mode: save draft → có thể quay lại edit
- [~] Submit mode: request status = SUBMITTED, redirect to `/requests/[id]`
- [ ] Validation errors hiện inline
- [ ] Loading state khi submitting
- [ ] i18n: en + vi
- [x] `pnpm typecheck` pass
- [ ] `pnpm lint` pass

---

### TASK 1.2 — Hoàn tất Request Detail backend

**Mô tả:** Verify và hoàn thiện backend cho tất cả actions trên Request Detail page.

**Scope:**

| Layer | Package/Module | Ghi chú |
|---|---|---|
| Backend | `apps/api` — module `service-ops/request` | Tất cả endpoints |
| Types | `packages/types` — service-ops types | Verify contracts |

**Sub-tasks:**
- [x] `GET /api/v1/requests/:id/workflow` — trả đủ `RequestWorkflowDetail`
- [x] `PATCH /api/v1/requests/:id/status` — validate transition rules theo role
- [x] `POST /api/v1/requests/:id/assign` — assign/reassign, tạo `AssignmentHistory`
- [x] `POST /api/v1/requests/:id/comments` — PUBLIC + INTERNAL visibility
- [x] `POST /api/v1/requests/:id/work-logs` — content + minutesSpent
- [x] `GET /api/v1/requests/assignees` — list active users for assign dialog
- [x] SLA record tự tạo khi request submitted (từ SlaPolicy config)
- [x] Activity log tự ghi khi có status change, assign, comment

**Status Transition Rules (cần implement):**

| From → To | Allowed Roles |
|---|---|
| DRAFT → SUBMITTED | EMPLOYEE, TENANT_ADMIN |
| SUBMITTED → TRIAGE | OPS_COORDINATOR, TENANT_ADMIN |
| TRIAGE → ASSIGNED | OPS_COORDINATOR, TENANT_ADMIN |
| ASSIGNED → IN_PROGRESS | TECHNICIAN, TENANT_ADMIN |
| IN_PROGRESS → RESOLVED | TECHNICIAN, TENANT_ADMIN |
| RESOLVED → CLOSED | OPS_COORDINATOR, EMPLOYEE, TENANT_ADMIN |
| Any → CANCELLED | EMPLOYEE (own request), TENANT_ADMIN |
| CLOSED → REOPENED | EMPLOYEE, OPS_COORDINATOR, TENANT_ADMIN |
| Any → WAITING_EXTERNAL_VENDOR | OPS_COORDINATOR, TENANT_ADMIN |

**Acceptance Criteria:**
- [x] Tất cả endpoints trả response đúng contract trong `@supportops/types`
- [x] Transition rules reject nếu role không đủ quyền → 403
- [ ] Activity log ghi đầy đủ mọi action
- [ ] `tenantId` filter trên mọi query
- [ ] `pnpm --filter @supportops/api build` pass

---

### TASK 1.3 — Polish Request List

**Mô tả:** Verify Request List hoạt động end-to-end với real API data.

**Scope:** `apps/web` — feature `service-ops/requests`

**Sub-tasks:**
- [ ] Verify API integration: list endpoint trả đúng data shape
- [ ] Tabs filter đúng: "Submitted/Triage" = `status IN (SUBMITTED, TRIAGE)`, "Unassigned" = `assigneeId IS NULL`, etc.
- [ ] Pagination hoạt động (page, pageSize, total)
- [ ] Search by title/requestCode
- [ ] Click row → navigate to `/requests/[id]`
- [ ] "New Request" button → navigate to `/requests/create`
- [ ] Loading / empty / error states đều hiện đúng
- [ ] SLA health badges hiện đúng màu (green/yellow/red)

---

### TASK 1.4 — Settings Backend CRUD

**Mô tả:** Implement backend CRUD cho 3 settings pages và wire frontend.

**Scope:**

| Layer | Package/Module | Ghi chú |
|---|---|---|
| Backend | `apps/api` — module `service-ops/settings` hoặc dedicated modules | 3 CRUD sets |
| Frontend | `apps/web` — routes settings/* | Wire form → API |
| Types | `packages/types` | Add DTOs if missing |

#### 1.4a — Service Types CRUD
- [ ] `GET /api/v1/service-types` — list (tenantId filter)
- [ ] `POST /api/v1/service-types` — create (code, name, description, isActive)
- [ ] `PATCH /api/v1/service-types/:id` — update
- [ ] `DELETE /api/v1/service-types/:id` — delete (check no linked requests)
- [ ] Validate: `code` unique per tenant
- [ ] Frontend: form submit → reload table

#### 1.4b — SLA Policies CRUD
- [ ] `GET /api/v1/sla-policies` — list
- [ ] `POST /api/v1/sla-policies` — create (serviceTypeCode, responseMinutes, resolutionMinutes, escalationAfterMinutes)
- [ ] `PATCH /api/v1/sla-policies/:id` — update
- [ ] `DELETE /api/v1/sla-policies/:id` — delete
- [ ] Validate: minutes > 0
- [ ] Frontend: form submit → reload table

#### 1.4c — Workflow Transitions CRUD
- [ ] `GET /api/v1/workflow-transitions` — list
- [ ] `POST /api/v1/workflow-transitions` — create (serviceTypeCode, fromStatus, toStatus, allowedRoles[])
- [ ] `PATCH /api/v1/workflow-transitions/:id` — update
- [ ] `DELETE /api/v1/workflow-transitions/:id` — delete
- [ ] Frontend: form submit → reload table

**Acceptance Criteria chung:**
- [ ] Permission: chỉ `TENANT_ADMIN` access settings pages
- [ ] Empty state hiện đúng khi chưa có data
- [ ] Form validation errors hiện inline
- [ ] Save/delete feedback toast
- [ ] `pnpm typecheck` pass
- [ ] `pnpm lint` pass

---

### TASK 1.5 — Sync Docs với Code

**Mô tả:** Cập nhật docs để khớp trạng thái thật của repo.

**Files cần update:**

| File | Cần làm |
|---|---|
| `docs/admin-mvp.md` | Update status column cho từng module |
| `AGENTS.md` (root) | Thêm section "DO NOT MODIFY — Legacy Modules" |
| `AGENTS.md` (root) | Update Implementation Status |
| `docs/worker-roadmap.md` | Loại legacy scope (billing/subscription), chỉ giữ email + SLA + escalation |

**Thêm mới:**
- [ ] `docs/mvp-status.md` — bảng trạng thái realtime (Done / In Progress / TODO)
- [ ] `docs/routes.md` — full route map với status

**Acceptance Criteria:**
- [ ] Mỗi module trong docs có status khớp với code thật
- [ ] Legacy modules được ghi rõ "DO NOT MODIFY"
- [ ] Agent mới đọc docs hiểu được ngay cái gì xong, cái gì chưa

---

### TASK 1.6 — Quality Gate trước khi đóng MVP

**Mô tả:** Sau khi xong Task 1.1–1.5, chạy checklist chất lượng.

**Checklist:**
- [ ] Mọi route có đủ 5 states: loading / empty / error / success / permissionDenied
- [ ] i18n: tất cả user-facing text có trong `en.json` + `vi.json`, không còn hardcode
- [ ] `pnpm lint` — 0 errors
- [ ] `pnpm typecheck` — 0 errors
- [ ] `pnpm --filter @supportops/web test` — pass
- [ ] `pnpm --filter @supportops/ui build` — pass
- [ ] Không có page nào "UI xong nhưng backend trả mock"
- [ ] Không có `console.log` còn sót
- [ ] Không có `any` type mới

---

## PHẦN D — GIAI ĐOẠN 2: LÀM HỆ THỐNG "SỐNG"

> **Bắt đầu sau khi Giai đoạn 1 xong hoàn toàn**
> **Mục tiêu:** Từ MVP CRUD → hệ thống vận hành thật
> **Ước lượng:** 4–5 tuần

### TASK 2.1 — Dashboard ServiceOps (Viết mới hoàn toàn)

**Mô tả:** Xóa bỏ toàn bộ dashboard placeholder (ecommerce template) và viết dashboard ServiceOps từ đầu.

**⛔ QUAN TRỌNG:** i18n keys hiện tại (`todaySales`, `todayVisitors`, `weekVisitors`, `latestCustomers`, `transactions`) là **template ecommerce**. Agent **PHẢI XÓA** toàn bộ và viết mới, **KHÔNG refactor trên nền cũ**.

**Scope:**

| Layer | Package/Module | Ghi chú |
|---|---|---|
| Backend | `apps/api` — module `service-ops/dashboard` | Tạo mới |
| Frontend | `apps/web` — route `dashboard` | Viết lại từ đầu |
| Types | `packages/types` — `DashboardData` | Tạo mới |

**KPI Cards cần có (v1):**
- Open requests (count)
- Unassigned requests (count)
- Overdue / SLA breached (count)
- Resolved today (count)
- Average resolution time (hours)
- My assigned work (count) — theo current user

**Sections bổ sung:**
- Requests by status (bar chart hoặc table)
- Requests by priority (color-coded counts)
- Recent activity (last 10 events: assign, status change, comment)
- SLA health overview (ON_TRACK / AT_RISK / BREACHED counts)

**Backend endpoints:**
- [x] `GET /api/v1/dashboard/summary` — trả KPI aggregates (tenantId filter)
- [x] `GET /api/v1/dashboard/recent-activity` — trả last N events

**i18n keys mới (tạo mới hoàn toàn):**
```
dashboard.kpi.openRequests
dashboard.kpi.unassigned
dashboard.kpi.slaBreached
dashboard.kpi.resolvedToday
dashboard.kpi.avgResolutionTime
dashboard.kpi.myAssigned
dashboard.sections.byStatus
dashboard.sections.byPriority
dashboard.sections.recentActivity
dashboard.sections.slaOverview
```

**Acceptance Criteria:**
- [x] Toàn bộ i18n ecommerce cũ đã bị xóa
- [x] Dashboard load data từ API thật, không mock
- [x] Loading / error / empty states
- [x] Permission: tất cả authenticated users xem được dashboard cơ bản
- [x] TENANT_ADMIN / OPS_COORDINATOR xem thêm team-wide metrics
- [x] `pnpm typecheck` pass, `pnpm lint` pass

---

### TASK 2.2 — Rename Notification API Fields

**Mô tả:** Xóa legacy naming từ notification system. API fields phải khớp với ServiceOps domain.

**Hiện trạng (legacy → target):**

| API Field (hiện tại) | UI Label | API Field (target) |
|---|---|---|
| `companyNews` | Cảnh báo phân công | `assignmentAlerts` |
| `accountActivity` | Cập nhật trạng thái | `statusUpdateAlerts` |
| `meetupsNearYou` | Cảnh báo rủi ro SLA | `slaRiskAlerts` |
| `newMessages` | Cảnh báo leo thang | `escalationAlerts` |
| `ratingReminders` | Nhắc xác nhận xử lý | `resolutionReminders` |
| `itemUpdateNotif` | Tổng hợp cập nhật yêu cầu | `requestUpdateDigest` |
| `itemCommentNotif` | Thông báo bình luận | `commentNotifications` |
| `buyerReviewNotif` | Thông báo nhắc tên | `mentionNotifications` |

**Scope:**

| Layer | Ghi chú |
|---|---|
| Prisma schema | Rename `UserPreference` columns |
| Backend DTOs | Update `user-preference.dto.ts` |
| `@supportops/types` | Update `UserPreferences` interface |
| Frontend mapper | `settings.mapper.ts` — simplify (bỏ rename logic) |
| Frontend tests | Update `settings.mapper.test.ts`, `useNotificationPreferences.test.tsx` |
| i18n keys | Update keys trong `en.json` + `vi.json` |
| Migration | Prisma migration rename columns |

**Acceptance Criteria:**
- [ ] Prisma migration chạy thành công
- [ ] `settings.mapper.ts` không còn rename logic (direct mapping)
- [ ] Tất cả tests pass với field names mới
- [ ] i18n keys cập nhật khớp
- [ ] Round-trip test `toUserPreferences(toNotificationPreferences(prefs))` vẫn pass

---

### TASK 2.3 — Worker App thật (Phase 1: SLA Monitor)

**Mô tả:** Chuyển `apps/worker` từ TODO placeholder sang app thật. Phase 1 chỉ làm SLA monitoring.

**⚠️ Lưu ý:** `docs/worker-roadmap.md` hiện có scope lẫn legacy (billing/subscription). Agent **PHẢI BỎ QUA** legacy scope. Chỉ implement theo danh sách dưới đây.

**Scope Worker Phase 1:**
- [x] Setup BullMQ + Redis connection
- [x] Job: `sla-check` — chạy mỗi 5 phút
  - Query requests WHERE status IN (SUBMITTED, TRIAGE, ASSIGNED, IN_PROGRESS)
  - Tính SLA elapsed time
  - Update `slaHealth` → `AT_RISK` nếu elapsed > 80% threshold
  - Update `slaHealth` → `BREACHED` nếu elapsed > 100%
- [x] Job: `escalation-check` — chạy mỗi 15 phút
  - Query requests WHERE `slaHealth` = BREACHED AND `escalated` = false
  - Mark as escalated
  - (Log activity event, chưa cần gửi email)

**Tech:**
- BullMQ cho job scheduling
- Redis cho queue
- Prisma client dùng chung với `apps/api`

**Package setup:**
```json
{
  "name": "@supportops/worker",
  "scripts": {
    "build": "tsc --project tsconfig.json",
    "dev": "ts-node src/main.ts",
    "typecheck": "tsc --noEmit"
  }
}
```

**Acceptance Criteria:**
- [x] `pnpm --filter @supportops/worker build` pass (không còn echo TODO)
- [x] `pnpm --filter @supportops/worker typecheck` pass
- [x] SLA check job runs trên schedule
- [x] SLA health cập nhật đúng trong DB
- [x] Activity log ghi event khi SLA status change

---

### TASK 2.4 — Tách nhỏ RequestListView

**Mô tả:** Refactor `RequestListView` (~1000 lines) thành các sub-components nhỏ gọn hơn.

**Tách thành:**

| Component | Chức năng |
|---|---|
| `RequestListPage.tsx` | Page shell: tabs + filters panel toggle + table |
| `RequestFiltersBar.tsx` | Filter fields + apply/clear |
| `RequestTabBar.tsx` | 6 tabs logic + counts |
| `RequestTableColumns.tsx` | Column definitions + badges (status, priority, SLA) |
| `RequestRowActions.tsx` | View / Edit / Assign / Cancel actions |
| `useRequestListQuery.ts` | Data fetching hook: API call + pagination + filters |
| `useRequestListFilters.ts` | Filter state management |
| `requestList.mapper.ts` | API response → table row shape |

**Quy tắc:**
- **KHÔNG thay đổi behavior hiện tại** — chỉ tách file, giữ nguyên logic
- Mỗi file mới < 200 lines
- Import path nội bộ: `./components/RequestFiltersBar`
- `RequestListView.tsx` sau refactor < 100 lines (chỉ compose sub-components)

**Acceptance Criteria:**
- [ ] Behavior giống 100% trước refactor
- [ ] `RequestListView.tsx` < 100 lines
- [ ] Mỗi sub-component < 200 lines
- [ ] `pnpm typecheck` pass
- [ ] `pnpm lint` pass
- [ ] Không có circular imports

---

### TASK 2.5 — Audit / Activity Log Consistency

**Mô tả:** Chuẩn hóa event naming và structure cho toàn bộ activity log.

**Event Naming Convention:**

| Event | Actor | Visibility |
|---|---|---|
| `REQUEST_CREATED` | USER | PUBLIC |
| `REQUEST_SUBMITTED` | USER | PUBLIC |
| `STATUS_CHANGED` | USER | PUBLIC |
| `REQUEST_ASSIGNED` | USER / SYSTEM | PUBLIC |
| `REQUEST_REASSIGNED` | USER | PUBLIC |
| `COMMENT_ADDED` | USER | PUBLIC / INTERNAL |
| `WORK_LOG_ADDED` | USER | INTERNAL |
| `SLA_AT_RISK` | SYSTEM | INTERNAL |
| `SLA_BREACHED` | SYSTEM | INTERNAL |
| `REQUEST_ESCALATED` | SYSTEM | PUBLIC |
| `REQUEST_RESOLVED` | USER | PUBLIC |
| `REQUEST_CLOSED` | USER | PUBLIC |
| `REQUEST_REOPENED` | USER | PUBLIC |
| `REQUEST_CANCELLED` | USER | PUBLIC |

**Schema mẫu cho `RequestActivity`:**
```typescript
interface RequestActivity {
  id: string;
  requestId: string;
  eventType: string;      // enum values trên
  actorType: 'USER' | 'SYSTEM';
  actorId: string | null; // null cho SYSTEM
  visibility: 'PUBLIC' | 'INTERNAL';
  metadata: Record<string, unknown>; // { fromStatus, toStatus } cho STATUS_CHANGED, etc.
  createdAt: Date;
}
```

**Acceptance Criteria:**
- [ ] Tất cả actions trong request flow tạo activity log
- [ ] Timeline trên Request Detail hiện đúng events
- [ ] INTERNAL events chỉ hiện cho OPS_COORDINATOR + TENANT_ADMIN
- [ ] PUBLIC events hiện cho tất cả users có access

---

## PHẦN E — GIAI ĐOẠN 3: NÂNG CHẤT KIẾN TRÚC

> **Bắt đầu sau Giai đoạn 2**
> **Mục tiêu:** Codebase sạch, scalable, agent-friendly
> **Ước lượng:** 3–4 tuần

### TASK 3.1 — Ổn định `@supportops/types`

**Mô tả:** Tổ chức lại types package thành 3 layers rõ ràng.

**Cấu trúc target:**
```
packages/types/src/
├── domain/           ← Business entities (ServiceRequest, SlaPolicy, etc.)
├── dto/              ← API request/response shapes
├── ui/               ← UI-only types (form values, table row, etc.)
├── enums/            ← Status, Priority, Role, SlaHealth
├── endpoints.ts      ← API endpoint constants
└── index.ts          ← Barrel export
```

**Quy tắc:**
- `domain/` types không import từ `dto/` hay `ui/`
- `dto/` types có thể reference `domain/` enums
- `ui/` types có thể reference `domain/` enums
- **KHÔNG thêm runtime logic** vào types package (giữ nó pure types)

**Acceptance Criteria:**
- [x] Mỗi layer có barrel export riêng
- [x] Không có circular imports giữa layers
- [x] `pnpm --filter @supportops/types typecheck` pass
- [x] Consumers (`apps/web`, `apps/api`) vẫn import thành công

---

### TASK 3.2 — Chốt Package Boundaries

**Mô tả:** Tạo file `docs/package-boundaries.md` ghi rõ mỗi package.

| Package | Status | Ownership | Có thể tách thêm? |
|---|---|---|---|
| `@supportops/types` | STABLE | Shared | Không |
| `@supportops/ui` | STABLE | Frontend | Không |
| `@supportops/ui-form` | STABLE | Frontend | Không |
| `@supportops/ui-theme` | STABLE | Frontend | Không |
| `@supportops/ui-avatar` | STABLE | Frontend | Không |
| `@supportops/ui-file-upload` | STABLE | Frontend | Không |
| `@supportops/ui-dialog` | STABLE | Frontend | Không |
| `@supportops/eslint-config` | STABLE | Tooling | Không |
| `@supportops/tsconfig` | STABLE | Tooling | Không |

**Quy tắc đóng băng:** Không tạo package mới trừ khi có **ít nhất 2 consumers** và được approve rõ ràng.

---

### TASK 3.3 — Event-driven Side Effects (Internal)

**Mô tả:** Thêm internal event system trong NestJS backend cho side effects.

**Events:**
```typescript
class RequestCreatedEvent { requestId: string; tenantId: string; createdBy: string; }
class RequestAssignedEvent { requestId: string; assigneeId: string; assignedBy: string; }
class RequestStatusChangedEvent { requestId: string; fromStatus: string; toStatus: string; changedBy: string; }
class SlaBreachedEvent { requestId: string; slaType: 'ASSIGNMENT' | 'RESOLUTION'; }
class RequestEscalatedEvent { requestId: string; escalatedAt: Date; }
```

**Listeners (side effects):**
- `RequestCreatedEvent` → tạo SLA record, log activity
- `RequestAssignedEvent` → log activity, (future: send notification)
- `RequestStatusChangedEvent` → log activity, check SLA impact
- `SlaBreachedEvent` → log activity, mark request

**Pattern:** Dùng NestJS `EventEmitter2` — đủ cho internal monolith, chưa cần message queue.

**Acceptance Criteria:**
- [x] Service methods emit events sau mutation thành công
- [x] Listeners handle side effects
- [x] Activity log tạo qua event listener, không inline trong service
- [x] `pnpm --filter @supportops/api build` pass

---

### TASK 3.4 — Dọn Legacy Modules

**Mô tả:** Gỡ hoặc cách ly legacy modules khỏi codebase chính.

**Modules cần xử lý:**

| Module | Action | Ghi chú |
|---|---|---|
| Product / ProductImage | Xóa | Không thuộc ServiceOps |
| Kanban / Board / Task | Xóa | Template demo |
| Message | Xóa | Template demo |
| Billing / Subscription | Xóa | Retire theo `serviceops-restructure.md` |
| Invoice | Xóa | Retire |

**Scope xóa:**
- [x] Backend: xóa modules, controllers, services, DTOs
- [x] Frontend: xóa `productService.ts`, product pages, kanban pages
- [x] Prisma: tạo migration drop tables (hoặc comment models)
- [x] `packages/types`: xóa `Product`, `ProductImage`, `CreateProductRequest`, `UpdateProductRequest`, etc.
- [x] i18n: xóa keys liên quan (`projects.*`, etc.)
- [x] AGENTS.md: bỏ "DO NOT MODIFY" section → thay bằng "Legacy modules removed"
- [x] `docs/api-spec.md`: xóa legacy endpoints section

**⚠️ Rủi ro:** Frontend `productService.ts` hiện vẫn import từ `@supportops/types` (`CreateProductRequest`, `Product`, etc.). Agent phải xóa cả service lẫn types.

**Acceptance Criteria:**
- [x] Không còn file nào reference legacy modules
- [x] `pnpm typecheck` pass
- [x] `pnpm lint` pass
- [x] `pnpm --filter @supportops/api build` pass
- [x] `pnpm --filter @supportops/web build` pass
- [x] Prisma migration pass

---

## PHẦN F — GIAI ĐOẠN 4: PORTFOLIO & DEMO READY

> **Bắt đầu sau Giai đoạn 3**
> **Mục tiêu:** Project sẵn sàng demo, phỏng vấn, portfolio
> **Ước lượng:** 2–3 tuần

### TASK 4.1 — Seed Data / Demo Accounts

**Mô tả:** Tạo seed script với demo data đầy đủ.

**Demo accounts:**

| Email | Role | Password |
|---|---|---|
| admin@supportops-demo.com | TENANT_ADMIN | DemoPass123! |
| coordinator@supportops-demo.com | OPS_COORDINATOR | DemoPass123! |
| technician@supportops-demo.com | TECHNICIAN | DemoPass123! |
| employee@supportops-demo.com | EMPLOYEE | DemoPass123! |

**Demo requests (15–20 requests):**
- 3 SUBMITTED (mới tạo)
- 2 TRIAGE (đang phân loại)
- 3 ASSIGNED (đã phân công, chưa bắt đầu)
- 4 IN_PROGRESS (đang xử lý, có comments + work logs)
- 1 WAITING_EXTERNAL_VENDOR
- 2 RESOLVED (chờ đóng)
- 2 CLOSED (đã xong)
- 1 CANCELLED
- 1 REOPENED

**Demo service types:** `HVAC`, `ELECTRICAL`, `PLUMBING`, `IT_SUPPORT`, `GENERAL_MAINTENANCE`

**Demo SLA policies:** Mỗi service type có 1 SLA policy

**File:** `apps/api/prisma/seed.ts`

**Acceptance Criteria:**
- [x] `pnpm --filter @supportops/api exec prisma db seed` chạy thành công
- [x] Login với mỗi account đều vào được dashboard
- [x] Request list hiện đủ requests ở các trạng thái
- [x] Request detail hiện comments, work logs, timeline

---

### TASK 4.2 — Technical Docs cho Portfolio

**Mô tả:** Tạo docs ngắn gọn, sắc, đủ để người ngoài hiểu project.

**Files cần tạo:**

| File | Nội dung | Độ dài |
|---|---|---|
| `docs/product-overview.md` | App làm gì, actors, use cases | 1 page |
| `docs/request-flow.md` | Status machine diagram + role permissions | 1 page |
| `docs/auth-and-roles.md` | Auth flow + 4 roles + permissions | 1 page |
| `docs/monorepo-guide.md` | Package map + dependency flow + build order | 1 page |

---

### TASK 4.3 — Nâng cấp README

**Mô tả:** README hiện tại quá mỏng. Nâng lên thành entry point cho mọi người / agent mới.

**Structure:**
```markdown
# SupportOps Platform

## What is this?
(1 paragraph: internal ops platform, multi-tenant, request management)

## Tech Stack
(table: FE, BE, DB, Cache, Storage, CI/CD)

## Monorepo Structure
(tree diagram)

## Quick Start
(pnpm install → dev → login)

## Demo Accounts
(table 4 accounts)

## Key Features
(bullet list: Auth, Requests, Team, Settings, Dashboard, SLA)

## Architecture Docs
(links to docs/)

## Contributing
(link to CONTRIBUTING.md)
```

---

## PHẦN G — QUY TẮC CHO AGENT

> Agent (Claude Code / Codex) **PHẢI** tuân theo các quy tắc này khi làm bất kỳ task nào.

### G1. Source of Truth

| Câu hỏi | Xem ở đâu |
|---|---|
| Project overview, domain modules | `AGENTS.md` (root) |
| Frontend coding rules | `apps/web/AGENTS.md` |
| Backend coding rules | `apps/api/AGENTS.md` |
| UI package rules | `packages/ui/AGENTS.md` |
| File upload package rules | `packages/ui/file-upload/AGENTS.md` |
| Avatar package rules | `packages/ui/avatar/AGENTS.md` |
| Types package rules | `packages/types/AGENTS.md` |
| MVP status & roadmap | `docs/admin-mvp.md` |
| API spec | `docs/api-spec.md` |
| CI/CD | `docs/cicd-nest-next-runbook.md` |

### G2. Pre-commit Quality Gate (BẮT BUỘC)

Trước mỗi commit, agent **PHẢI** chạy:
```bash
pnpm lint
pnpm typecheck
pnpm --filter @supportops/web test          # nếu sửa frontend
pnpm --filter @supportops/ui build          # nếu sửa shared UI
pnpm --filter @supportops/web build         # nếu sửa routes/pages
pnpm --filter @supportops/api build         # nếu sửa backend
```

### G3. Coding Conventions

**Frontend:**
- Strict TypeScript, no `any`
- `interface` cho object shapes, `type` cho unions
- Components: `PascalCase.tsx`
- Services: `kebab-case.service.ts`
- Hooks: `use*.ts`
- i18n: KHÔNG hardcode text, dùng `useTranslations()`

**Backend:**
- DTO classes với `class-validator`
- Controllers thin → logic trong services
- **LUÔN** filter theo `tenantId`
- Module-first: `modules/<feature>/`

**Git:**
- Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- Scope: `feat(requests): add status transition endpoint`

### G4. KHÔNG ĐƯỢC LÀM

| Hành động | Lý do |
|---|---|
| Sửa/extend legacy modules (Product, Kanban, Message, Billing, Invoice) | Đang retire |
| Thêm package mới vào `packages/` | Đóng băng structure |
| Thêm role mới ngoài 4 roles hiện tại | Chưa có requirement |
| Sửa auth flow | Đã stable |
| Dùng `any` type | Coding standard |
| Hardcode user-facing text | Phải dùng i18n |
| Import từ `apps/web/*` trong packages | Circular dependency |
| Publish packages ra ngoài monorepo | Internal only |

### G5. Thứ tự ưu tiên khi conflict

1. **AGENTS.md** > docs khác
2. **Code hiện tại** > docs nếu docs stale
3. **Acceptance Criteria** của task > convention chung
4. **Business logic** > code beauty

---

## PHẦN H — MASTER CHECKLIST THEO GIAI ĐOẠN

### Giai đoạn 1 — Khóa MVP

| # | Task | Status |
|---|---|---|
| 1.1 | Create Request end-to-end | ✅ |
| 1.2 | Request Detail backend | ✅ |
| 1.3 | Polish Request List | ✅ |
| 1.4a | Service Types CRUD | ✅ |
| 1.4b | SLA Policies CRUD | ✅ |
| 1.4c | Workflow Transitions CRUD | ✅ |
| 1.5 | Sync Docs với Code | ✅ |
| 1.6 | Quality Gate MVP | ✅ |

### Giai đoạn 2 — Hệ thống "sống"

| # | Task | Status |
|---|---|---|
| 2.1 | Dashboard ServiceOps (viết mới) | ✅ |
| 2.2 | Rename Notification API Fields | ✅ |
| 2.3 | Worker App Phase 1 (SLA Monitor) | ✅ |
| 2.4 | Tách nhỏ RequestListView | ⬜ |
| 2.5 | Audit / Activity Log Consistency | ⬜ |

### Giai đoạn 3 — Nâng chất kiến trúc

| # | Task | Status |
|---|---|---|
| 3.1 | Ổn định @supportops/types | ✅ |
| 3.2 | Chốt Package Boundaries | ✅ |
| 3.3 | Event-driven Side Effects | ✅ |
| 3.4 | Dọn Legacy Modules | ✅ |

### Giai đoạn 4 — Portfolio & Demo Ready

| # | Task | Status |
|---|---|---|
| 4.1 | Seed Data / Demo Accounts | ✅ |
| 4.2 | Technical Docs | ✅ |
| 4.3 | Nâng cấp README | ✅ |

---

**Tổng cộng: 16 tasks chính, chia 4 giai đoạn, ước lượng 12–16 tuần.**

---

## PHẦN I — V2 ACCEPTANCE CHECKLIST (REQ-00002)

### AC-E1 — Notification
- [x] AC-E1.1: User nhận in-app notification khi request được assign cho họ
- [x] AC-E1.2: User nhận in-app notification khi request họ tạo có comment mới
- [x] AC-E1.3: User nhận notification khi được @mention trong comment
- [x] AC-E1.4: OPS nhận notification khi request mới tạo vào queue của họ (fallback: all OPS_COORDINATOR)
- [x] AC-E1.5: User có thể mark notification là đã đọc (single + all)
- [x] AC-E1.6: Unread count hiển thị trên bell icon, update realtime qua SSE
- [x] AC-E1.7: User có thể tắt/bật từng loại notification (in-app + email)

### AC-E2 — Email Notification
- [x] AC-E2.1: Email gửi ngay cho REQUEST_ASSIGNED, REQUEST_MENTIONED, SLA_NEAR_BREACH_*
- [x] AC-E2.2: Email digest gom events trong 5 phút cho REQUEST_CREATED, STATUS_CHANGED, COMMENTED
- [x] AC-E2.3: Rate limit: max 5 emails/user/request/giờ
- [x] AC-E2.4: Không gửi email nếu user tắt email preference cho event đó

### AC-E3 — SLA Near-breach
- [x] AC-E3.1: Notification gửi khi SLA còn ≤ nearBreachThresholdMinutes (default 30m)
- [x] AC-E3.2: Không gửi duplicate near-breach notification (idempotency guard)
- [x] AC-E3.3: SLA tự động pause khi request → WAITING_FOR_CUSTOMER
- [x] AC-E3.4: SLA tự động resume khi request rời WAITING_FOR_CUSTOMER
- [x] AC-E3.5: SLA badge trong UI hiển thị đúng state: ON_TRACK / NEAR_BREACH / PAUSED / BREACHED
- [x] AC-E3.6: Countdown timer trong RequestDetail cập nhật real-time (mỗi 30 giây)

### AC-E4 — Request Watcher
- [x] AC-E4.1: User có thể watch/unwatch request
- [x] AC-E4.2: Creator auto-watch khi tạo request
- [x] AC-E4.3: Assignee auto-watch khi được assign
- [x] AC-E4.4: Watcher nhận notification giống assignee

### AC-E5 — Knowledge Base
- [x] AC-E5.1: TECHNICIAN+ có thể tạo/edit/delete bài viết
- [x] AC-E5.2: EMPLOYEE chỉ xem PUBLISHED articles
- [x] AC-E5.3: Full-text search hoạt động (title + body)
- [x] AC-E5.4: KB Picker trong CommentComposer — chèn article link
- [x] AC-E5.5: Soft delete — không xóa vĩnh viễn

### AC-E6 — Canned Response
- [x] AC-E6.1: OPS_COORDINATOR+ có thể tạo/edit/delete canned response
- [x] AC-E6.2: TECHNICIAN có thể dùng (read) nhưng không edit
- [x] AC-E6.3: Gõ "/" trong CommentComposer → picker dropdown hiện ra
- [x] AC-E6.4: Chọn response → text được chèn với {{variables}} đã resolved
- [x] AC-E6.5: Shortcut unique per tenant

### AC-E7 — Reporting
- [x] AC-E7.1: OPS_COORDINATOR+ xem được dashboard
- [x] AC-E7.2: Filter theo date range (max 90 ngày)
- [x] AC-E7.3: 7 KPI summary cards hiển thị đúng
- [x] AC-E7.4: Volume by Status chart
- [x] AC-E7.5: Trend (Created vs Resolved) line chart
- [x] AC-E7.6: Volume by Service Type chart (Gap 5 fix)
- [x] AC-E7.7: Filter theo assignee (OPS_COORDINATOR+)

### AC-TQ — Technical Quality
- [x] AC-TQ.1: pnpm typecheck → 0 errors
- [x] AC-TQ.2: pnpm lint → 0 errors
- [x] AC-TQ.3: api test coverage ≥ 80% cho code mới
- [x] AC-TQ.4: web test cho tất cả new components
- [x] AC-TQ.5: Tất cả endpoints mới có security checklist pass
- [x] AC-TQ.6: Không có tenantId isolation gap
- [x] AC-TQ.7: Worker start không crash

### AC-EXP — Export Reports (REQ-00004)
- [ ] AC-001: TENANT_ADMIN gọi POST /api/v1/export/csv nhận file .csv với Content-Disposition attachment (đã implement, chưa verify e2e do thiếu runtime env đồng bộ)
- [ ] AC-002: TENANT_ADMIN gọi POST /api/v1/export/excel nhận file .xlsx có các sheet yêu cầu (đã implement, chưa verify e2e)
- [ ] AC-003: TENANT_ADMIN gọi POST /api/v1/export/pdf nhận file .pdf có section title + bảng dữ liệu (đã implement, chưa verify e2e)
- [x] AC-004: to_date < from_date trả HTTP 400 message "to_date must be >= from_date" (đã implement ở Python + Nest validation path)
- [x] AC-005: metrics không hợp lệ trả 422 (Pydantic validator đã implement ở Python router)
- [x] AC-006: user không có permission report.export bị 403 (Nest controller đã gắn @Permissions + guard)
- [ ] AC-007: Tenant isolation A/B verify bằng JWT thực tế (đã giữ thiết kế x-tenant-id từ proxy + query theo tenant, chưa chạy test tích hợp A/B)
- [x] AC-008: Filename đúng format report_{from_date}_{to_date}.{ext} (đã implement ở Python router)
- [x] AC-009: 0 records vẫn trả file hợp lệ (exporters xử lý fallback no-data, không crash trong smoke unit)

### AC-IMP — Bulk Import Service Requests (REQ-00005)
- [x] AC-001: EMPLOYEE không thể gọi import API (guard + permission `request.import` được áp dụng cho import endpoints)
- [x] AC-002: OPS_COORDINATOR và TENANT_ADMIN thấy nút "Import" trên Requests List (đã verify qua `ImportRequestButton.test.tsx`)
- [x] AC-003: Download template CSV có đúng columns + 1 row ví dụ (đã verify trong `RequestImportService.downloadTemplate`)
- [x] AC-004: Upload CSV hợp lệ hiển thị preview table (đã verify qua hook/component tests cho trạng thái `preview_ready`)
- [x] AC-005: Row serviceTypeCode không hợp lệ được highlight đỏ trong preview (đã verify qua worker + preview table tests)
- [x] AC-006: Confirm import tạo rows hợp lệ với đúng tenantId từ JWT/job payload (đã verify qua worker + import service tests)
- [x] AC-007: Import result modal hiển thị số thành công/thất bại (đã verify qua `ImportResultStep.test.tsx`)
- [x] AC-008: File > 5MB bị reject trước upload (đã verify qua `ImportUploadStep.test.tsx`)
- [x] AC-009: `POST /requests/bulk` với items hợp lệ trả `created > 0, failed = 0` (đã verify qua `request-bulk.service.spec.ts`)
- [x] AC-010: Bulk item thiếu dữ liệu bị fail, item khác vẫn được tạo (đã verify qua `request-bulk.service.spec.ts`)
- [x] AC-011: Upload file trả `{ jobId, status: "queued" }` ngay (đã verify qua `request-import.service.spec.ts`)
- [x] AC-011b: Worker xử lý async và ghi notification completion (đã verify qua `import-requests.job.spec.ts`)
- [x] AC-011c: Import audit log ghi nhận userId, tenantId, timestamp, counts (đã verify qua service/worker tests)
- [x] AC-012: `pnpm typecheck` pass toàn monorepo
- [x] AC-013: `pnpm lint` pass toàn monorepo
- [x] AC-014: i18n import text có trong `en.json` và `vi.json`

### AC-PYTEST — Python Test Suite AI Service (REQ-00006)
- [x] AC-001: Chạy `pytest` từ `apps/ai-service/` -> 0 failures, 0 errors (`38 passed`)
- [x] AC-002: Coverage >= 80% với `pytest --cov --cov-fail-under=80` (`80.42%`)
- [x] AC-003: Không có test nào thực hiện external HTTP call (network bị chặn trong `tests/conftest.py`)
- [x] AC-004: Không có test nào kết nối PostgreSQL thật (chặn `asyncpg.create_pool`, chỉ dùng mocked pool/connection)
- [x] AC-005: Toàn bộ test suite chạy < 10 giây (local runtime ~0.72s cho `pytest -v`)
- [x] AC-006: `pytest.ini` có `asyncio_mode = auto`
- [x] AC-007: `requirements.txt` có đủ test dependencies: `pytest`, `pytest-asyncio`, `pytest-mock`, `httpx`, `pytest-cov`
- [x] AC-008: `tests/conftest.py` có reusable fixtures cho mock DB pool, mock adapters, async client
- [x] AC-009: Adapter tests verify `MAX_ITERATIONS = 5` cho Anthropic và OpenAI
- [x] AC-010: Router tests verify tenant isolation từ header `x-tenant-id` vào query layer
- [x] AC-011: Startup/shutdown tests cho `main.py` đã cover các nhánh success/failure bắt buộc
- [x] AC-012: GitHub Actions đã thêm job `ai-service-tests` chạy pytest + coverage gate 80%
- [x] AC-013: Hardening adapter mocks bằng shared factories trong `tests/_sdk_fakes/*`
