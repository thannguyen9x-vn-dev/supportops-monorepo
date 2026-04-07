import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { ExportReportDto } from './dto/export-report.dto';
import { ExportService } from './export.service';

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
    return this.exportService.proxyExport(tenantId, dto, 'csv', res);
  }

  @Post('excel')
  @Permissions({ all: ['report.export'] })
  @ApiOperation({ summary: 'Export report as Excel' })
  async exportExcel(
    @CurrentTenant() tenantId: string,
    @Body() dto: ExportReportDto,
    @Res() res: Response,
  ): Promise<void> {
    return this.exportService.proxyExport(tenantId, dto, 'excel', res);
  }

  @Post('pdf')
  @Permissions({ all: ['report.export'] })
  @ApiOperation({ summary: 'Export report as PDF' })
  async exportPdf(
    @CurrentTenant() tenantId: string,
    @Body() dto: ExportReportDto,
    @Res() res: Response,
  ): Promise<void> {
    return this.exportService.proxyExport(tenantId, dto, 'pdf', res);
  }
}
