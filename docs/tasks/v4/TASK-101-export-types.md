# TASK-101 — Types: ExportReportRequest, ExportMetric, endpoints constant
> **Phase:** 1 — Types Contract | **Prereq:** none | **Status:** ⏳ Pending

## Mục tiêu
Thêm toàn bộ type definitions và endpoint constants cho feature Export vào `packages/types` để BE và FE có thể import dùng chung, đảm bảo single source of truth.

## Files cần tạo / sửa

```text
packages/types/src/types/export.types.ts          ← NEW
packages/types/src/core/endpoints.ts              ← MODIFIED (thêm EXPORT block)
packages/types/src/index.ts                       ← MODIFIED (thêm barrel export)
packages/types/src/rbac.ts                        ← MODIFIED nếu file tồn tại (thêm 'report.export')
```

## Spec chi tiết

### 1. Tạo `packages/types/src/types/export.types.ts`

```typescript
export type ExportMetric =
  | 'request_volume'
  | 'status_breakdown'
  | 'sla_health'
  | 'team_performance'
  | 'service_type_breakdown'

export interface ExportReportRequest {
  from_date: string  // ISO date "YYYY-MM-DD"
  to_date: string    // ISO date "YYYY-MM-DD"
  metrics?: ExportMetric[]  // default: tất cả 5 nếu không truyền
}

export const ALL_EXPORT_METRICS: ExportMetric[] = [
  'request_volume',
  'status_breakdown',
  'sla_health',
  'team_performance',
  'service_type_breakdown',
]
```

### 2. Sửa `packages/types/src/core/endpoints.ts`

Tìm object `CORE_ENDPOINTS` (hoặc `ENDPOINTS`) và thêm block `EXPORT`:

```typescript
EXPORT: {
  CSV:   '/export/csv',
  EXCEL: '/export/excel',
  PDF:   '/export/pdf',
},
```

> Lưu ý: Xem cấu trúc hiện tại của file để thêm đúng vị trí (không được làm thay đổi cấu trúc khác).

### 3. Sửa `packages/types/src/index.ts`

Thêm vào barrel export:

```typescript
export type { ExportReportRequest, ExportMetric } from './types/export.types'
export { ALL_EXPORT_METRICS } from './types/export.types'
```

### 4. Sửa `packages/types/src/rbac.ts` (nếu tồn tại)

Tìm danh sách permissions (có thể là array hoặc union type) và thêm:
```typescript
'report.export'
```

Nếu file không tồn tại → bỏ qua bước này, ghi chú trong báo cáo.

## Quality gate

```bash
cd packages/types && pnpm typecheck
# Phải không có lỗi TypeScript
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-401** và **TASK-301** (có thể làm song song)
