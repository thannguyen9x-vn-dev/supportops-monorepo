# TASK-502 — FE: ReportsView + ReportsHeader + ReportsFilterPanel + ReportsExportActions
> **Phase:** 4 — Frontend | **Prereq:** TASK-501 | **Status:** ⏳ Pending

## Mục tiêu
Tạo 4 components cho trang Reports. Mỗi component ≤ giới hạn kích thước quy định. `ReportsView` là client orchestrator, 3 component còn lại là presentational.

## Files cần tạo / sửa

```text
apps/web/src/features/reports/components/ReportsView.tsx         ← NEW (≤ 120 lines)
apps/web/src/features/reports/components/ReportsHeader.tsx       ← NEW (≤ 40 lines)
apps/web/src/features/reports/components/ReportsFilterPanel.tsx  ← NEW (≤ 100 lines)
apps/web/src/features/reports/components/ReportsExportActions.tsx ← NEW (≤ 80 lines)
```

## Spec chi tiết

### 1. `ReportsHeader.tsx` (presentational, ≤ 40 lines)

```tsx
// apps/web/src/features/reports/components/ReportsHeader.tsx
import { Box, Typography } from '@mui/material'
import { useTranslations } from 'next-intl'

export function ReportsHeader() {
  const t = useTranslations()
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" fontWeight={600}>
        {t('reports.pageTitle')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {t('reports.pageDescription')}
      </Typography>
    </Box>
  )
}
```

### 2. `ReportsFilterPanel.tsx` (≤ 100 lines)

```tsx
// apps/web/src/features/reports/components/ReportsFilterPanel.tsx
'use client'

import { Box, Typography, FormGroup, FormControlLabel, Checkbox, Alert } from '@mui/material'
import { useTranslations } from 'next-intl'
import { ALL_EXPORT_METRICS } from '@supportops/types'
import type { ExportMetric } from '@supportops/types'

interface Props {
  fromDate: string
  toDate: string
  selectedMetrics: ExportMetric[]
  isDateRangeInvalid: boolean
  onFromDateChange: (date: string) => void
  onToDateChange: (date: string) => void
  onMetricsChange: (metrics: ExportMetric[]) => void
}

export function ReportsFilterPanel({
  fromDate,
  toDate,
  selectedMetrics,
  isDateRangeInvalid,
  onFromDateChange,
  onToDateChange,
  onMetricsChange,
}: Props) {
  const t = useTranslations()

  const handleMetricToggle = (metric: ExportMetric) => {
    if (selectedMetrics.includes(metric)) {
      onMetricsChange(selectedMetrics.filter((m) => m !== metric))
    } else {
      onMetricsChange([...selectedMetrics, metric])
    }
  }

  return (
    <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {t('reports.filters.fromDate')}
          </Typography>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => onFromDateChange(e.target.value)}
            style={{ display: 'block', marginTop: 4 }}
          />
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {t('reports.filters.toDate')}
          </Typography>
          <input
            type="date"
            value={toDate}
            onChange={(e) => onToDateChange(e.target.value)}
            style={{ display: 'block', marginTop: 4 }}
          />
        </Box>
      </Box>

      {isDateRangeInvalid && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('reports.errors.invalidDateRange')}
        </Alert>
      )}

      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
        {t('reports.filters.metrics')}
      </Typography>
      <FormGroup row>
        {ALL_EXPORT_METRICS.map((metric) => (
          <FormControlLabel
            key={metric}
            control={
              <Checkbox
                checked={selectedMetrics.includes(metric)}
                onChange={() => handleMetricToggle(metric)}
                size="small"
              />
            }
            label={t(`reports.metrics.${metric}`)}
          />
        ))}
      </FormGroup>
    </Box>
  )
}
```

### 3. `ReportsExportActions.tsx` (≤ 80 lines)

```tsx
// apps/web/src/features/reports/components/ReportsExportActions.tsx
'use client'

import { Box, Button, Alert } from '@mui/material'
import { useTranslations } from 'next-intl'

interface Props {
  isExportingCsv: boolean
  isExportingExcel: boolean
  isExportingPdf: boolean
  exportError: string | null
  isDateRangeInvalid: boolean
  onExportCsv: () => void
  onExportExcel: () => void
  onExportPdf: () => void
}

export function ReportsExportActions({
  isExportingCsv,
  isExportingExcel,
  isExportingPdf,
  exportError,
  isDateRangeInvalid,
  onExportCsv,
  onExportExcel,
  onExportPdf,
}: Props) {
  const t = useTranslations()
  const isAnyExporting = isExportingCsv || isExportingExcel || isExportingPdf

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={onExportCsv}
          disabled={isAnyExporting || isDateRangeInvalid}
          loading={isExportingCsv}
        >
          {isExportingCsv ? t('reports.actions.exporting') : t('reports.actions.exportCsv')}
        </Button>
        <Button
          variant="outlined"
          onClick={onExportExcel}
          disabled={isAnyExporting || isDateRangeInvalid}
          loading={isExportingExcel}
        >
          {isExportingExcel ? t('reports.actions.exporting') : t('reports.actions.exportExcel')}
        </Button>
        <Button
          variant="contained"
          onClick={onExportPdf}
          disabled={isAnyExporting || isDateRangeInvalid}
          loading={isExportingPdf}
        >
          {isExportingPdf ? t('reports.actions.exporting') : t('reports.actions.exportPdf')}
        </Button>
      </Box>
      {exportError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {t(exportError)}
        </Alert>
      )}
    </Box>
  )
}
```

> **Lưu ý:** MUI `Button` v6+ có prop `loading`. Nếu version đang dùng chưa hỗ trợ → thay bằng `CircularProgress` + disabled combo. Kiểm tra version trong `package.json`.

### 4. `ReportsView.tsx` (orchestrator, ≤ 120 lines)

```tsx
// apps/web/src/features/reports/components/ReportsView.tsx
'use client'

import { Box } from '@mui/material'
import { useReports } from '../hooks/useReports'
import { ReportsHeader } from './ReportsHeader'
import { ReportsFilterPanel } from './ReportsFilterPanel'
import { ReportsExportActions } from './ReportsExportActions'

export function ReportsView() {
  const {
    fromDate,
    toDate,
    selectedMetrics,
    isExportingCsv,
    isExportingExcel,
    isExportingPdf,
    exportError,
    isDateRangeInvalid,
    handleFromDateChange,
    handleToDateChange,
    handleMetricsChange,
    handleExportCsv,
    handleExportExcel,
    handleExportPdf,
  } = useReports()

  return (
    <Box sx={{ p: 3, maxWidth: 800 }}>
      <ReportsHeader />
      <ReportsFilterPanel
        fromDate={fromDate}
        toDate={toDate}
        selectedMetrics={selectedMetrics}
        isDateRangeInvalid={isDateRangeInvalid}
        onFromDateChange={handleFromDateChange}
        onToDateChange={handleToDateChange}
        onMetricsChange={handleMetricsChange}
      />
      <ReportsExportActions
        isExportingCsv={isExportingCsv}
        isExportingExcel={isExportingExcel}
        isExportingPdf={isExportingPdf}
        exportError={exportError}
        isDateRangeInvalid={isDateRangeInvalid}
        onExportCsv={handleExportCsv}
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
      />
    </Box>
  )
}
```

## Quality gate

```bash
cd apps/web

pnpm typecheck
pnpm lint
# Cả 2 phải pass, không có lỗi TypeScript hay ESLint
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-503**
