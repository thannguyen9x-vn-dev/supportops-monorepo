# TASK-104 — Types: Reporting
> **Phase:** 1 — Types | **Prereq:** TASK-103 done

---

## Files cần tạo / sửa

```text
packages/types/src/
├── types/
│   └── reporting.types.ts    ← TẠO MỚI
└── index.ts                   ← SỬA: append exports
```

---

## Spec chi tiết

### `types/reporting.types.ts`
```typescript
export interface ReportByStatus {
  status: string;
  count:  number;
}

export interface ReportByPriority {
  priority: string;
  count:    number;
}

export interface ReportByServiceType {
  serviceTypeCode: string;
  serviceTypeName: string;
  count:           number;
}

export interface ReportVolumeTrendPoint {
  date:     string;   // YYYY-MM-DD
  created:  number;
  resolved: number;
}

export interface ReportOverviewSummary {
  totalRequests:          number;
  openRequests:           number;
  resolvedRequests:       number;
  closedRequests:         number;
  slaComplianceRate:      number;   // 0–100 (%)
  slaBreachCount:         number;
  slaBreachActiveCount:   number;
  avgFirstResponseMinutes: number;
  avgResolutionMinutes:    number;
}

export interface ReportOverview {
  summary:      ReportOverviewSummary;
  byStatus:     ReportByStatus[];
  byPriority:   ReportByPriority[];
  byServiceType: ReportByServiceType[];   // ← Gap 5 fix
  volumeTrend:  ReportVolumeTrendPoint[];
}

export interface ReportOverviewQuery {
  from:        string;   // ISO date string
  to:          string;   // ISO date string
  assigneeId?: string;
}
```

---

## Quality gate
```bash
cd packages/types && pnpm typecheck
pnpm lint
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-105**
