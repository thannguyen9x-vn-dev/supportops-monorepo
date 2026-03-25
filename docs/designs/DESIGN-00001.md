# DESIGN-00001 — Dashboard KPI & Overview

> **Ngày tạo:** 2026-03-25
> **Tạo bởi:** Tech Lead Agent
> **Status:** Approved
> **Requirement:** [REQ-00001.md](../requirements/REQ-00001.md)
> **Task tracking:** [AGENT_TASKS.md](../AGENT_TASKS.md) — Phase 2 (post-MVP)

---

## 1. Overview

Dashboard aggregates ServiceRequest + SlaRecord data server-side theo role của user. Một endpoint duy nhất trả toàn bộ KPI data để tránh N+1. Frontend rewrite hoàn toàn — xóa ecommerce template, tạo feature folder mới `features/dashboard/`.

---

## 2. API Design

### 2.1 New Endpoint — GET /api/v1/dashboard/summary

```
GET /api/v1/dashboard/summary?range=today|week|month
Auth: Bearer JWT (required)
Permission: Tất cả authenticated users (scope tự động theo role)
```

**Response 200:**
```json
{
  "data": {
    "kpis": {
      "openRequests": 12,
      "inProgress": 5,
      "resolvedInRange": 8,
      "slaAtRisk": 3,
      "slaBreached": 1
    },
    "byStatus": [
      { "status": "SUBMITTED", "count": 4 },
      { "status": "TRIAGE", "count": 3 },
      { "status": "ASSIGNED", "count": 2 },
      { "status": "IN_PROGRESS", "count": 5 },
      { "status": "RESOLVED", "count": 8 }
    ],
    "byServiceType": [
      { "serviceTypeCode": "IT_SUPPORT", "name": "IT Support", "count": 7 },
      { "serviceTypeCode": "FACILITIES", "name": "Facilities", "count": 5 }
    ],
    "recentRequests": [
      {
        "id": "uuid",
        "requestCode": "REQ-00042",
        "title": "Laptop không bật được",
        "status": "IN_PROGRESS",
        "priority": "HIGH",
        "serviceTypeName": "IT Support",
        "assigneeName": "Nguyễn Văn A",
        "slaHealth": "AT_RISK",
        "updatedAt": "2026-03-25T10:00:00Z"
      }
    ],
    "myWorkload": {
      "assigned": 3,
      "inProgress": 2
    }
  }
}
```

**RBAC scoping (server-side):**
- `EMPLOYEE` → filter `createdById = currentUserId`
- `TECHNICIAN` → filter `assigneeId = currentUserId`
- `OPS_COORDINATOR` + `TENANT_ADMIN` → filter `tenantId = currentTenantId` (no user filter)

**Query params:**
- `range`: `today` | `week` | `month` (default: `week`)
  - `today`: từ 00:00 UTC hôm nay
  - `week`: 7 ngày gần nhất
  - `month`: 30 ngày gần nhất

---

## 3. Database Changes

**No migration required** — aggregate từ `ServiceRequest` + `SlaRecord` hiện có.

### Prisma queries cần implement:

```typescript
// KPIs
const openCount = await prisma.serviceRequest.count({
  where: { tenantId, status: { in: ['SUBMITTED', 'TRIAGE', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_EXTERNAL_VENDOR'] }, ...scope }
})

const resolvedInRange = await prisma.serviceRequest.count({
  where: { tenantId, status: 'RESOLVED', updatedAt: { gte: rangeStart }, ...scope }
})

const slaAtRisk = await prisma.slaRecord.count({
  where: { tenantId, health: 'AT_RISK', request: { ...scope } }
})

// By status
const byStatus = await prisma.serviceRequest.groupBy({
  by: ['status'],
  _count: { _all: true },
  where: { tenantId, ...scope }
})

// Recent requests (10 rows)
const recentRequests = await prisma.serviceRequest.findMany({
  take: 10,
  orderBy: { updatedAt: 'desc' },
  where: { tenantId, ...scope },
  include: {
    serviceType: { select: { name: true } },
    assignee: { select: { firstName: true, lastName: true } },
    slaRecords: { where: { type: 'RESOLUTION' }, select: { health: true } }
  }
})
```

---

## 4. Types Contract

Thêm vào `packages/types/src/service-ops/dashboard.types.ts`:

```typescript
export type DashboardRange = 'today' | 'week' | 'month'

export interface DashboardKpis {
  openRequests: number
  inProgress: number
  resolvedInRange: number
  slaAtRisk: number
  slaBreached: number
}

export interface DashboardByStatus {
  status: string
  count: number
}

export interface DashboardByServiceType {
  serviceTypeCode: string
  name: string
  count: number
}

export interface DashboardRecentRequest {
  id: string
  requestCode: string
  title: string
  status: string
  priority: string
  serviceTypeName: string
  assigneeName: string | null
  slaHealth: 'ON_TRACK' | 'AT_RISK' | 'BREACHED' | null
  updatedAt: string
}

export interface DashboardMyWorkload {
  assigned: number
  inProgress: number
}

export interface DashboardSummaryResponse {
  kpis: DashboardKpis
  byStatus: DashboardByStatus[]
  byServiceType: DashboardByServiceType[]
  recentRequests: DashboardRecentRequest[]
  myWorkload: DashboardMyWorkload
}
```

Thêm endpoint vào `packages/types/src/endpoints.ts`:

```typescript
DASHBOARD: {
  SUMMARY: '/dashboard/summary',
}
```

---

## 5. Frontend Architecture

### 5.1 File Structure

```
apps/web/src/features/dashboard/
  ├── hooks/
  │   └── useDashboardSummary.ts    ← fetch + state management
  ├── services/
  │   └── dashboard.service.ts      ← API call wrapper
  └── components/
      ├── DashboardView.tsx          ← Main container (client component)
      ├── KpiCard.tsx                ← Reusable KPI number card
      ├── KpiCardSkeleton.tsx        ← Loading state
      ├── RecentRequestsTable.tsx    ← 10-row table, click → detail
      ├── StatusBreakdown.tsx        ← Bar/donut chart hoặc simple list
      └── ServiceTypeBreakdown.tsx   ← Top 5 list

apps/web/src/app/[locale]/(dashboard)/
  └── page.tsx                       ← Rewrite, delegate đến DashboardView
```

### 5.2 Hook Pattern

```typescript
// useDashboardSummary.ts
export function useDashboardSummary(range: DashboardRange) {
  const [data, setData] = useState<DashboardSummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    dashboardService.getSummary(range)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [range])

  return { data, loading, error }
}
```

### 5.3 i18n Keys

Xóa toàn bộ namespace `dashboard` cũ, thêm mới:

```json
// en.json — namespace "dashboard"
{
  "title": "Dashboard",
  "kpis": {
    "openRequests": "Open Requests",
    "inProgress": "In Progress",
    "resolvedInRange": "Resolved",
    "slaAtRisk": "SLA At Risk",
    "slaBreached": "SLA Breached"
  },
  "sections": {
    "recentRequests": "Recent Requests",
    "byStatus": "By Status",
    "byServiceType": "By Service Type",
    "myWorkload": "My Workload"
  },
  "range": {
    "today": "Today",
    "week": "This Week",
    "month": "This Month"
  },
  "empty": "No requests found for this period",
  "error": "Failed to load dashboard data"
}
```

---

## 6. Implementation Order

1. [ ] **Step 1:** Thêm types vào `packages/types/src/service-ops/dashboard.types.ts` + update `endpoints.ts`
2. [ ] **Step 2:** Backend — tạo `apps/api/src/modules/service-ops/dashboard/` module (service + controller + module)
3. [ ] **Step 3:** Backend — implement `GET /dashboard/summary` với RBAC scoping
4. [ ] **Step 4:** Backend — register module trong `app.module.ts`
5. [ ] **Step 5:** Frontend — tạo `dashboard.service.ts` + `useDashboardSummary.ts`
6. [ ] **Step 6:** Frontend — build components (KpiCard, RecentRequestsTable, v.v.)
7. [ ] **Step 7:** Frontend — rewrite `page.tsx`, xóa ecommerce i18n keys, thêm ServiceOps keys
8. [ ] **Step 8:** Chạy `pnpm typecheck && pnpm lint && pnpm --filter @supportops/web test`

---

## 7. Risks & Constraints

| Risk | Mức độ | Mitigation |
|---|---|---|
| `groupBy` + multiple `count` = nhiều queries → chậm | Med | Chạy parallel với `Promise.all([...])` thay vì sequential await |
| RBAC scope logic bị lặp ở nhiều service | Low | Tạo helper `buildRequestScope(user)` trả về Prisma `where` clause |
| MUI Charts chưa được install | Low | Kiểm tra `package.json` trước — nếu chưa có, dùng dạng number list thay chart |
| i18n keys ecommerce còn sót trong codebase | Low | Grep `todaySales\|todayVisitors\|weekVisitors\|latestCustomers\|transactions` trước khi commit |

---

## 8. Forbidden Actions

- [x] KHÔNG tạo Prisma migration — không thêm table/column mới
- [x] KHÔNG sửa legacy modules (`Product`, `Kanban`, `Billing`, v.v.)
- [x] KHÔNG thêm npm dependency mới mà không confirm — dùng MUI Charts nếu đã có, fallback sang plain list
- [x] KHÔNG bỏ `tenantId` filter trên bất kỳ Prisma query nào
- [x] KHÔNG refactor code hiện tại ngoài scope dashboard
