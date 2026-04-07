# TASK-501 — FE: reports.service.ts + useReports.ts
> **Phase:** 4 — Frontend | **Prereq:** TASK-101 | **Status:** ⏳ Pending

## Mục tiêu
Tạo service layer và hook để components có thể trigger export CSV/Excel/PDF. Không dùng TanStack Query — đây là imperative action, dùng `useState` + async handler.

## Files cần tạo / sửa

```text
apps/web/src/features/reports/services/reports.service.ts    ← NEW
apps/web/src/features/reports/hooks/useReports.ts            ← NEW
```

## Spec chi tiết

### 1. `reports.service.ts` (≤ 80 lines)

```typescript
// apps/web/src/features/reports/services/reports.service.ts
import { apiClient } from '@/lib/api/apiClient'
import { ENDPOINTS } from '@supportops/types'
import type { ExportReportRequest } from '@supportops/types'

export const reportsService = {
  async exportCsv(payload: ExportReportRequest): Promise<Blob> {
    const response = await apiClient.post(
      ENDPOINTS.EXPORT.CSV,
      payload,
      { responseType: 'blob', timeout: 30_000 },
    )
    return response.data as Blob
  },

  async exportExcel(payload: ExportReportRequest): Promise<Blob> {
    const response = await apiClient.post(
      ENDPOINTS.EXPORT.EXCEL,
      payload,
      { responseType: 'blob', timeout: 30_000 },
    )
    return response.data as Blob
  },

  async exportPdf(payload: ExportReportRequest): Promise<Blob> {
    const response = await apiClient.post(
      ENDPOINTS.EXPORT.PDF,
      payload,
      { responseType: 'blob', timeout: 30_000 },
    )
    return response.data as Blob
  },
}
```

### 2. `useReports.ts` (≤ 120 lines)

```typescript
// apps/web/src/features/reports/hooks/useReports.ts
'use client'

import { useState } from 'react'
import { ALL_EXPORT_METRICS } from '@supportops/types'
import type { ExportMetric } from '@supportops/types'
import { reportsService } from '../services/reports.service'

interface ReportsState {
  fromDate: string
  toDate: string
  selectedMetrics: ExportMetric[]
  isExportingCsv: boolean
  isExportingExcel: boolean
  isExportingPdf: boolean
  exportError: string | null
}

function triggerDownload(blob: Blob, fromDate: string, toDate: string, ext: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `report_${fromDate}_${toDate}.${ext}`
  a.click()
  URL.revokeObjectURL(url)
}

export function useReports() {
  const today = new Date().toISOString().split('T')[0]
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  const [state, setState] = useState<ReportsState>({
    fromDate: oneMonthAgo,
    toDate: today,
    selectedMetrics: ALL_EXPORT_METRICS,
    isExportingCsv: false,
    isExportingExcel: false,
    isExportingPdf: false,
    exportError: null,
  })

  const handleFromDateChange = (date: string) =>
    setState((s) => ({ ...s, fromDate: date, exportError: null }))

  const handleToDateChange = (date: string) =>
    setState((s) => ({ ...s, toDate: date, exportError: null }))

  const handleMetricsChange = (metrics: ExportMetric[]) =>
    setState((s) => ({ ...s, selectedMetrics: metrics }))

  const buildPayload = () => ({
    from_date: state.fromDate,
    to_date: state.toDate,
    metrics: state.selectedMetrics,
  })

  const handleExportCsv = async () => {
    setState((s) => ({ ...s, isExportingCsv: true, exportError: null }))
    try {
      const blob = await reportsService.exportCsv(buildPayload())
      triggerDownload(blob, state.fromDate, state.toDate, 'csv')
    } catch {
      setState((s) => ({ ...s, exportError: 'reports.errors.exportFailed' }))
    } finally {
      setState((s) => ({ ...s, isExportingCsv: false }))
    }
  }

  const handleExportExcel = async () => {
    setState((s) => ({ ...s, isExportingExcel: true, exportError: null }))
    try {
      const blob = await reportsService.exportExcel(buildPayload())
      triggerDownload(blob, state.fromDate, state.toDate, 'xlsx')
    } catch {
      setState((s) => ({ ...s, exportError: 'reports.errors.exportFailed' }))
    } finally {
      setState((s) => ({ ...s, isExportingExcel: false }))
    }
  }

  const handleExportPdf = async () => {
    setState((s) => ({ ...s, isExportingPdf: true, exportError: null }))
    try {
      const blob = await reportsService.exportPdf(buildPayload())
      triggerDownload(blob, state.fromDate, state.toDate, 'pdf')
    } catch {
      setState((s) => ({ ...s, exportError: 'reports.errors.exportFailed' }))
    } finally {
      setState((s) => ({ ...s, isExportingPdf: false }))
    }
  }

  const isDateRangeInvalid = state.toDate < state.fromDate

  return {
    ...state,
    isDateRangeInvalid,
    handleFromDateChange,
    handleToDateChange,
    handleMetricsChange,
    handleExportCsv,
    handleExportExcel,
    handleExportPdf,
  }
}
```

## Quality gate

```bash
cd apps/web

# TypeScript — phải pass:
pnpm typecheck

# Lint:
pnpm lint
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-502**
