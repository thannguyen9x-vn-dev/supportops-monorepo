# TASK-307 — BE: Reporting Module
> **Phase:** 3 — Backend
> **Prereq:** TASK-201 done
> ⚠️ Kiểm tra trước: `apps/api/src/modules/service-ops/dashboard/` đã có gì chưa
>   → Nếu dashboard module đã có aggregation logic → extend thay vì tạo mới

---

## Files cần tạo

```text
apps/api/src/modules/service-ops/reporting/
├── reporting.module.ts
├── reporting.controller.ts
├── reporting.controller.spec.ts
├── reporting.service.ts
├── reporting.service.spec.ts
└── dto/
    ├── report-overview-query.dto.ts
    └── report-overview-response.dto.ts
```

---

## Spec chi tiết

### Endpoints
| Method | Path | Guard |
|---|---|---|
| GET | `/reports/overview` | Auth + `report.read` |

### RBAC
```text
report.read → OPS_COORDINATOR, TENANT_ADMIN
EMPLOYEE    → 403 Forbidden
TECHNICIAN  → 403 Forbidden
```

### `report-overview-query.dto.ts`
```typescript
export class ReportOverviewQueryDto {
  @IsDateString()
  from: string;   // ISO date: '2024-01-01'

  @IsDateString()
  to: string;     // ISO date: '2024-01-31'

  @IsOptional() @IsUUID()
  assigneeId?: string;
}
```

### `reporting.service.ts` — `getOverview()`
```typescript
async getOverview(tenantId: string, query: ReportOverviewQueryDto): Promise<ReportOverview> {
  const { from, to, assigneeId } = query;
  const dateFilter = {
    createdAt: { gte: new Date(from), lte: new Date(to) }
  };
  const baseWhere = {
    tenantId,
    ...dateFilter,
    ...(assigneeId ? { assigneeId } : {}),
  };

  // Chạy song song để tối ưu performance
  const [
    totalRequests,
    byStatus,
    byPriority,
    byServiceType,
    slaBreachData,
    volumeTrend,
    avgResponseData,
  ] = await Promise.all([
    prisma.serviceRequest.count({ where: baseWhere }),
    prisma.serviceRequest.groupBy({ by: ['status'],      where: baseWhere, _count: true }),
    prisma.serviceRequest.groupBy({ by: ['priority'],    where: baseWhere, _count: true }),
    prisma.serviceRequest.groupBy({ by: ['serviceTypeId'], where: baseWhere, _count: true }),
    prisma.slaRecord.findMany({
      where: { tenantId, request: { createdAt: { gte: new Date(from), lte: new Date(to) } } },
      select: { isBreached: true, health: true },
    }),
    this.buildVolumeTrend(tenantId, from, to, assigneeId),
    this.calcAvgResponseTimes(tenantId, from, to, assigneeId),
  ]);

  return this.mapToResponse({ totalRequests, byStatus, byPriority, byServiceType, slaBreachData, volumeTrend, avgResponseData });
}
```

### `buildVolumeTrend()` — group by date
```typescript
// Dùng Prisma $queryRaw để group by DATE(createdAt)
private async buildVolumeTrend(tenantId, from, to, assigneeId?): Promise<ReportVolumeTrendPoint[]> {
  // Raw SQL: SELECT DATE(created_at) as date, COUNT(*) as created FROM ...
  // Tương tự cho resolved (status IN (RESOLVED, CLOSED))
}
```

### Performance note
- Dùng `Promise.all` (không dùng `$transaction`) vì đây là read-only aggregations
- Nếu date range > 90 ngày → cache result 5 phút trong Redis (optional, note lý do nếu implement)

---

## Test cases bắt buộc
```text
✓ EMPLOYEE nhận 403
✓ TECHNICIAN nhận 403
✓ OPS_COORDINATOR nhận data
✓ byStatus: đủ tất cả statuses có trong range
✓ byServiceType: đúng serviceTypeName (join với ServiceType table)
✓ slaComplianceRate: tính đúng = (total - breached) / total * 100
✓ volumeTrend: mỗi ngày trong range có 1 data point (kể cả ngày count=0)
✓ assigneeId filter hoạt động
✓ tenantId isolation
```

## Quality gate
```bash
pnpm --filter @supportops/api test reporting
pnpm typecheck && pnpm lint
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-308**
