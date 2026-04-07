# TASK-503 — FE: Route page.tsx + navigation + i18n keys
> **Phase:** 4 — Frontend | **Prereq:** TASK-502 | **Status:** ⏳ Pending

## Mục tiêu
Tạo route `/reports` (Server Component entry + loading + error), thêm vào navigation sidebar chỉ cho TENANT_ADMIN, thêm i18n keys vào en.json và vi.json.

## Files cần tạo / sửa

```text
apps/web/src/app/[locale]/(dashboard)/reports/page.tsx      ← NEW (≤ 30 lines)
apps/web/src/app/[locale]/(dashboard)/reports/loading.tsx   ← NEW
apps/web/src/app/[locale]/(dashboard)/reports/error.tsx     ← NEW
apps/web/src/features/layout/config/navigation.tsx          ← MODIFIED
apps/web/src/i18n/messages/en.json                          ← MODIFIED
apps/web/src/i18n/messages/vi.json                          ← MODIFIED
```

## Spec chi tiết

### 1. `page.tsx` (Server Component, ≤ 30 lines)

```tsx
// apps/web/src/app/[locale]/(dashboard)/reports/page.tsx
import { ReportsView } from '@/features/reports/components/ReportsView'

export default function ReportsPage() {
  return <ReportsView />
}
```

> Xem cách các trang khác (dashboard, settings) tổ chức page.tsx để match pattern. Nếu cần `export const dynamic` hoặc metadata → thêm theo pattern của trang tương tự.

### 2. `loading.tsx`

```tsx
// apps/web/src/app/[locale]/(dashboard)/reports/loading.tsx
import { Box, Skeleton } from '@mui/material'

export default function ReportsLoading() {
  return (
    <Box sx={{ p: 3, maxWidth: 800 }}>
      <Skeleton variant="text" width={200} height={40} />
      <Skeleton variant="text" width={300} height={24} sx={{ mt: 1 }} />
      <Skeleton variant="rectangular" height={150} sx={{ mt: 3, borderRadius: 1 }} />
      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Skeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: 1 }} />
      </Box>
    </Box>
  )
}
```

### 3. `error.tsx` (Client Component — required)

```tsx
// apps/web/src/app/[locale]/(dashboard)/reports/error.tsx
'use client'

import { Box, Typography, Button } from '@mui/material'

interface Props {
  error: Error
  reset: () => void
}

export default function ReportsError({ error, reset }: Props) {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" color="error">
        Something went wrong
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {error.message}
      </Typography>
      <Button onClick={reset} sx={{ mt: 2 }}>
        Try again
      </Button>
    </Box>
  )
}
```

### 4. `navigation.tsx` — thêm route Reports

Mở `apps/web/src/features/layout/config/navigation.tsx`, tìm group chứa `"nav.dashboard"` (hoặc group main nav) và thêm entry sau nó:

```typescript
// Import icon:
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'

// Thêm entry vào nav group (sau entry dashboard):
{
  label: 'nav.reports',
  href: '/reports',
  icon: <BarChartOutlinedIcon fontSize="small" />,
  allowedRoles: ['TENANT_ADMIN'],
},
```

> Xem cấu trúc hiện tại của file — match đúng shape object (có thể có thêm field `icon`, `badge`, v.v.). Chỉ thêm entry, KHÔNG sửa các entry hiện có.

### 5. i18n — `en.json`

Tìm root object và thêm block `"reports"`:

```json
"reports": {
  "pageTitle": "Reports",
  "pageDescription": "Export operational data for your tenant",
  "filters": {
    "fromDate": "From Date",
    "toDate": "To Date",
    "metrics": "Metrics to Include",
    "allMetrics": "All Metrics"
  },
  "metrics": {
    "request_volume": "Request Volume",
    "status_breakdown": "Status Breakdown",
    "sla_health": "SLA Health",
    "team_performance": "Team Performance",
    "service_type_breakdown": "Service Type Breakdown"
  },
  "actions": {
    "exportCsv": "Export CSV",
    "exportExcel": "Export Excel",
    "exportPdf": "Export PDF",
    "exporting": "Exporting..."
  },
  "errors": {
    "invalidDateRange": "End date must be on or after start date",
    "exportFailed": "Export failed. Please try again."
  }
}
```

Thêm vào block `"nav"` (đã tồn tại):
```json
"nav": {
  "reports": "Reports"
}
```

### 6. i18n — `vi.json`

Tương tự en.json, thêm block `"reports"` với bản dịch tiếng Việt:

```json
"reports": {
  "pageTitle": "Báo cáo",
  "pageDescription": "Xuất dữ liệu vận hành của tenant bạn",
  "filters": {
    "fromDate": "Từ ngày",
    "toDate": "Đến ngày",
    "metrics": "Chỉ số cần xuất",
    "allMetrics": "Tất cả chỉ số"
  },
  "metrics": {
    "request_volume": "Lượng yêu cầu",
    "status_breakdown": "Phân tích trạng thái",
    "sla_health": "Sức khỏe SLA",
    "team_performance": "Hiệu suất nhóm",
    "service_type_breakdown": "Phân tích loại dịch vụ"
  },
  "actions": {
    "exportCsv": "Xuất CSV",
    "exportExcel": "Xuất Excel",
    "exportPdf": "Xuất PDF",
    "exporting": "Đang xuất..."
  },
  "errors": {
    "invalidDateRange": "Ngày kết thúc phải bằng hoặc sau ngày bắt đầu",
    "exportFailed": "Xuất thất bại. Vui lòng thử lại."
  }
}
```

Thêm vào block `"nav"` (đã tồn tại):
```json
"nav": {
  "reports": "Báo cáo"
}
```

## Quality gate

```bash
cd apps/web

# TypeScript:
pnpm typecheck

# Lint:
pnpm lint

# Build (kiểm tra route compile được):
pnpm build

# Manual: mở http://localhost:3000/reports với account TENANT_ADMIN
# Expected: trang Reports hiện ra với 3 nút export, Reports hiện trong sidebar
# Expected: trang /reports KHÔNG hiện trong sidebar với account role khác TENANT_ADMIN
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **Xác nhận all AC với PO (integration test)**
