# TASK-302 — NestJS: Export Module (dto + controller + service + module)
> **Phase:** 3 — NestJS Backend | **Prereq:** TASK-101, TASK-301 | **Status:** ⏳ Pending

## Mục tiêu
Tạo `ExportModule` trong NestJS: proxy 3 endpoints `/export/csv|excel|pdf` — verify JWT, inject `x-tenant-id`, stream response từ Python service. Bypass `ResponseTransformInterceptor` bằng `@Res()`.

## Files cần tạo / sửa

```text
apps/api/src/modules/export/export.module.ts        ← NEW
apps/api/src/modules/export/export.controller.ts    ← NEW
apps/api/src/modules/export/export.service.ts       ← NEW
apps/api/src/modules/export/dto/export-report.dto.ts ← NEW
apps/api/src/app.module.ts                          ← MODIFIED (import ExportModule)
apps/api/package.json                              ← MODIFIED nếu @nestjs/axios chưa có
```

## Spec chi tiết

### 0. Kiểm tra `@nestjs/axios`

```bash
cd apps/api
cat package.json | grep axios
# Nếu KHÔNG thấy @nestjs/axios → cài thêm:
pnpm add @nestjs/axios axios
```

### 1. `dto/export-report.dto.ts`

```typescript
import { IsArray, IsDateString, IsEnum, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

enum ExportMetric {
  REQUEST_VOLUME        = 'request_volume',
  STATUS_BREAKDOWN      = 'status_breakdown',
  SLA_HEALTH            = 'sla_health',
  TEAM_PERFORMANCE      = 'team_performance',
  SERVICE_TYPE_BREAKDOWN = 'service_type_breakdown',
}

export class ExportReportDto {
  @ApiProperty({ example: '2026-01-01', description: 'Start date ISO format' })
  @IsDateString()
  from_date: string

  @ApiProperty({ example: '2026-03-31', description: 'End date ISO format' })
  @IsDateString()
  to_date: string

  @ApiPropertyOptional({ enum: ExportMetric, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(ExportMetric, { each: true })
  metrics?: ExportMetric[]
}
```

### 2. `export.service.ts`

```typescript
import { BadRequestException, Injectable, GatewayTimeoutException } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { Response } from 'express'
import { ExportReportDto } from './dto/export-report.dto'

const ALL_METRICS = [
  'request_volume',
  'status_breakdown',
  'sla_health',
  'team_performance',
  'service_type_breakdown',
]

@Injectable()
export class ExportService {
  private readonly pythonBaseUrl: string

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.pythonBaseUrl = this.configService.get<string>('AI_SERVICE_URL', 'http://localhost:8000')
  }

  async proxyExport(
    tenantId: string,
    dto: ExportReportDto,
    format: 'csv' | 'excel' | 'pdf',
    res: Response,
  ): Promise<void> {
    if (dto.to_date < dto.from_date) {
      throw new BadRequestException({
        error: { code: 'INVALID_DATE_RANGE', message: 'to_date must be >= from_date' },
      })
    }

    const metrics = dto.metrics ?? ALL_METRICS

    let pythonResponse: Awaited<ReturnType<typeof this.httpService.axiosRef.post>>
    try {
      pythonResponse = await this.httpService.axiosRef.post(
        `${this.pythonBaseUrl}/export/${format}`,
        { from_date: dto.from_date, to_date: dto.to_date, metrics },
        {
          headers: { 'x-tenant-id': tenantId },
          responseType: 'stream',
          timeout: 30_000,
        },
      )
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException)?.code === 'ECONNABORTED') {
        throw new GatewayTimeoutException({
          error: { code: 'UPSTREAM_TIMEOUT', message: 'Export service timed out' },
        })
      }
      throw err
    }

    res.setHeader('Content-Type', pythonResponse.headers['content-type'])
    res.setHeader('Content-Disposition', pythonResponse.headers['content-disposition'])
    pythonResponse.data.pipe(res)
  }
}
```

### 3. `export.controller.ts`

```typescript
import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { Response } from 'express'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { PermissionsGuard } from '../../common/guards/permissions.guard'
import { Permissions } from '../../common/decorators/permissions.decorator'
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator'
import { ExportService } from './export.service'
import { ExportReportDto } from './dto/export-report.dto'

@ApiTags('Export')
@ApiBearerAuth()
@Controller('export')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post('csv')
  @Permissions({ all: ['report.export'] })
  @ApiOperation({ summary: 'Export report as CSV' })
  async exportCsv(
    @CurrentTenant() tenantId: string,
    @Body() dto: ExportReportDto,
    @Res() res: Response,
  ): Promise<void> {
    return this.exportService.proxyExport(tenantId, dto, 'csv', res)
  }

  @Post('excel')
  @Permissions({ all: ['report.export'] })
  @ApiOperation({ summary: 'Export report as Excel' })
  async exportExcel(
    @CurrentTenant() tenantId: string,
    @Body() dto: ExportReportDto,
    @Res() res: Response,
  ): Promise<void> {
    return this.exportService.proxyExport(tenantId, dto, 'excel', res)
  }

  @Post('pdf')
  @Permissions({ all: ['report.export'] })
  @ApiOperation({ summary: 'Export report as PDF' })
  async exportPdf(
    @CurrentTenant() tenantId: string,
    @Body() dto: ExportReportDto,
    @Res() res: Response,
  ): Promise<void> {
    return this.exportService.proxyExport(tenantId, dto, 'pdf', res)
  }
}
```

### 4. `export.module.ts`

```typescript
import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ExportController } from './export.controller'
import { ExportService } from './export.service'

@Module({
  imports: [HttpModule],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}
```

### 5. `app.module.ts` — thêm import ExportModule

```typescript
// Tìm mảng imports trong @Module decorator của AppModule và thêm:
import { ExportModule } from './modules/export/export.module'

// Trong @Module({ imports: [...] }):
ExportModule,
```

### 6. Kiểm tra `AI_SERVICE_URL` env var

Thêm vào `apps/api/.env` (nếu chưa có):
```
AI_SERVICE_URL=http://localhost:8000
```

Và đảm bảo `ConfigModule` đã load env file trong `app.module.ts`.

## Quality gate

```bash
cd apps/api

# Build check — phải pass:
pnpm build

# TypeScript check:
pnpm typecheck

# Lint:
pnpm lint

# Test (nếu có spec file):
pnpm test

# Manual integration test (Python service phải đang chạy):
# Lấy JWT của TENANT_ADMIN từ login endpoint, sau đó:
curl -X POST http://localhost:8081/api/v1/export/csv \
  -H "Authorization: Bearer <TENANT_ADMIN_JWT>" \
  -H "Content-Type: application/json" \
  -d '{"from_date": "2026-01-01", "to_date": "2026-03-31"}' \
  --output /tmp/test_output.csv
# Expected: file CSV được download, Content-Disposition header đúng format

# Test 403:
curl -X POST http://localhost:8081/api/v1/export/csv \
  -H "Authorization: Bearer <NON_ADMIN_JWT>" \
  -H "Content-Type: application/json" \
  -d '{"from_date": "2026-01-01", "to_date": "2026-03-31"}' \
  -w "%{http_code}"
# Expected: 403
```

## Báo cáo xong
Cập nhật `_STATUS.md` ✅ | Task tiếp theo: **TASK-501**
