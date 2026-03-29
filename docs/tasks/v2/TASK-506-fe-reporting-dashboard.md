# TASK-506 — FE: Reporting Dashboard
> **Phase:** 5 — Frontend
> **Prereq:** TASK-307 done (API)
> ⚠️ Kiểm tra trước: chart library đã có chưa?
>   `grep -r "recharts\|@mui/x-charts\|chart.js" apps/web/package.json`
>   Nếu chưa có → ghi note + propose thêm (recharts recommend vì nhẹ)

---

## Files cần tạo / sửa

```text
apps/web/src/app/[locale]/(authenticated)/reports/overview/
└── page.tsx                          ← SỬA (đang placeholder → implement thật)

apps/web/src/features/reports/
├── components/
│   ├── ReportView.tsx                ← SỬA/TẠO MỚI (≤ 150 lines)
│   ├── ReportSummaryCards.tsx        ← TẠO MỚI (≤ 100 lines)
│   ├── ReportVolumeChart.tsx         ← TẠO MỚI (≤ 100 lines)
│   ├── ReportTrendChart.tsx          ← TẠO MỚI (≤ 100 lines)
│   ├── ReportServiceTypeChart.tsx    ← TẠO MỚI (≤ 80 lines)
│   └── ReportFilters.tsx             ← TẠO MỚI (≤ 80 lines)
├── hooks/
│   └── useReportData.ts              ← TẠO MỚI (≤ 120 lines)
└── services/
    └── report.service.ts             ← TẠO MỚI (≤ 80 lines)
```

---

## Spec chi tiết

### `report.service.ts`
```typescript
export const reportService = {
  getOverview: (query: ReportOverviewQuery) =>
    apiClient.get<ReportOverview>(REPORT_ENDPOINTS.overview, { params: query }),
};
```

### `useReportData.ts`
```typescript
export function useReportData(filters: ReportOverviewQuery) {
  return useQuery({
    queryKey: ['report-overview', filters],
    queryFn:  () => reportService.getOverview(filters),
    staleTime: 5 * 60 * 1000,   // cache 5 phút
    enabled: !!filters.from && !!filters.to,
  });
}
```

### `ReportFilters.tsx`
```text
UI:
- Date range picker: From [____] To [____]
  → Default: 30 ngày gần nhất
  → Max range: 90 ngày
- Assignee select (optional, chỉ OPS_COORDINATOR+)
- Apply button
```

### `ReportSummaryCards.tsx` — 7 KPI cards
```text
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Total       │ │ Open        │ │ Resolved    │ │ SLA         │
│ Requests    │ │ Requests    │ │ Requests    │ │ Compliance  │
│    142      │ │     38      │ │     89      │ │   87.3%     │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ SLA Breached│ │ Avg 1st     │ │ Avg         │
│ (active)    │ │ Response    │ │ Resolution  │
│      5      │ │   2h 15m    │ │   1.2 days  │
└─────────────┘ └─────────────┘ └─────────────┘
```

### `ReportVolumeChart.tsx` — Bar chart
```text
- X axis: status values
- Y axis: count
- Stacked bars: byPriority (optional toggle)
- Dùng Recharts: <BarChart> + <Bar> + <XAxis> + <YAxis> + <Tooltip>
- Nếu dùng @mui/x-charts → <BarChart> từ MUI
```

### `ReportTrendChart.tsx` — Line chart
```text
- X axis: date (từ volumeTrend)
- Y axis: count
- 2 lines: "Created" vs "Resolved"
- Dùng Recharts: <LineChart> + <Line> × 2
- Tooltip hiện cả 2 values khi hover
```

### `ReportServiceTypeChart.tsx` — Horizontal bar / Donut
```text
- Hiển thị byServiceType data
- Chọn 1 trong 2:
  Option A: Horizontal BarChart (dễ đọc tên dài)
  Option B: Donut PieChart (đẹp hơn nhưng tên khó đọc)
- Ghi note lý do chọn
```

### `ReportView.tsx` — layout tổng thể
```text
┌──────────────────────────────────────────────┐
│ Reports                    [Filters dropdown]│
├──────────────────────────────────────────────┤
│ [ReportSummaryCards — 7 KPIs]                │
├────────────────────┬─────────────────────────┤
│ Volume by Status   │ Trend (Created vs       │
│ [BarChart]         │  Resolved) [LineChart]  │
├────────────────────┴─────────────────────────┤
│ Requests by Service Type                     │
│ [ServiceTypeChart — full width]              │
└──────────────────────────────────────────────┘
```

```typescript
// Loading state: skeleton toàn bộ layout (không để blank)
// Error state: Alert "Failed to load report data" + Retry button
// Empty state (range không có data): "No requests in this period"
```

### Skeleton loading pattern
```typescript
// Khi isLoading=true → hiển thị Skeleton thay vì content
// KHÔNG để blank screen
<ReportSummaryCardsSkeleton />   // 7 skeleton cards
<Skeleton variant="rectangular" height={300} />  // chart skeleton
```

---

## i18n keys
```json
"reports": {
  "title": "Reports",
  "overview": "Overview",
  "filters": {
    "from": "From",
    "to": "To",
    "assignee": "Assignee",
    "apply": "Apply",
    "maxRangeHint": "Maximum range: 90 days"
  },
  "summary": {
    "totalRequests": "Total Requests",
    "openRequests": "Open",
    "resolvedRequests": "Resolved",
    "slaCompliance": "SLA Compliance",
    "slaBreached": "SLA Breached",
    "avgFirstResponse": "Avg First Response",
    "avgResolution": "Avg Resolution"
  },
  "charts": {
    "volumeByStatus": "Volume by Status",
    "trend": "Request Trend",
    "created": "Created",
    "resolved": "Resolved",
    "byServiceType": "By Service Type"
  },
  "empty": "No requests in this period",
  "error": "Failed to load report data"
}
```

---

## Test cases bắt buộc
```text
✓ EMPLOYEE nhận 403 / redirect khi navigate đến /reports/overview
✓ TECHNICIAN nhận 403
✓ OPS_COORDINATOR thấy dashboard
✓ useReportData: không call API khi from/to chưa có
✓ useReportData: cache 5 phút (không re-fetch khi navigate đi về)
✓ ReportFilters: max range 90 ngày (validate khi apply)
✓ Loading state: skeleton hiển thị
✓ Error state: alert + retry hiển thị
✓ ReportSummaryCards: format đúng số (slaComplianceRate: "87.3%")
✓ ReportTrendChart: render 2 lines
```

## Quality gate
```bash
pnpm --filter @supportops/web test Report
pnpm --filter @supportops/web build   # ← PHASE 5 GATE
pnpm typecheck && pnpm lint
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ — Ghi rõ `web build PASS`
Task tiếp theo: **TASK-FINAL**
