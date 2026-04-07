import { Response } from 'express';
import type { ExportMetric } from '@supportops/types';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { ExportReportDto } from './dto/export-report.dto';

describe('ExportController', () => {
  const mockExportService: Pick<ExportService, 'proxyExport'> = {
    proxyExport: jest.fn(),
  };

  const controller = new ExportController(mockExportService as ExportService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const dto: ExportReportDto = {
    from_date: '2026-01-01',
    to_date: '2026-03-31',
    metrics: ['request_volume' as ExportMetric],
  };
  const tenantId = 'tenant-1';
  const res = {} as Response;

  it('calls proxyExport for csv', async () => {
    await controller.exportCsv(tenantId, dto, res);
    expect(mockExportService.proxyExport).toHaveBeenCalledWith(tenantId, dto, 'csv', res);
  });

  it('calls proxyExport for excel', async () => {
    await controller.exportExcel(tenantId, dto, res);
    expect(mockExportService.proxyExport).toHaveBeenCalledWith(tenantId, dto, 'excel', res);
  });

  it('calls proxyExport for pdf', async () => {
    await controller.exportPdf(tenantId, dto, res);
    expect(mockExportService.proxyExport).toHaveBeenCalledWith(tenantId, dto, 'pdf', res);
  });
});
