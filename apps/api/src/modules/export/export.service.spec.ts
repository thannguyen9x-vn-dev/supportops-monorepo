import { BadRequestException, GatewayTimeoutException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosError } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import type { ExportMetric } from '@supportops/types';
import { ExportService } from './export.service';
import { ExportReportDto } from './dto/export-report.dto';

describe('ExportService', () => {
  let service: ExportService;

  const mockHttpService = {
    axiosRef: {
      post: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('http://localhost:8000'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<ExportService>(ExportService);
  });

  const dto: ExportReportDto = {
    from_date: '2026-01-01',
    to_date: '2026-03-31',
    metrics: ['request_volume' as ExportMetric],
  };

  it('throws on invalid date range', async () => {
    let caught: unknown;
    try {
      await service.proxyExport(
        'tenant-1',
        { ...dto, from_date: '2026-03-31', to_date: '2026-01-01' },
        'csv',
        {} as never,
      );
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(BadRequestException);
    const badRequest = caught as BadRequestException;
    expect(badRequest.getResponse()).toEqual({
      error: { code: 'INVALID_DATE_RANGE', message: 'to_date must be >= from_date' },
    });
  });

  it('throws GatewayTimeoutException on upstream timeout', async () => {
    const timeoutError = new AxiosError('timeout');
    timeoutError.code = 'ECONNABORTED';
    mockHttpService.axiosRef.post.mockRejectedValueOnce(timeoutError);

    await expect(service.proxyExport('tenant-1', dto, 'csv', {} as never)).rejects.toThrow(
      GatewayTimeoutException,
    );
  });

  it('forwards headers and pipes stream', async () => {
    const pipe = jest.fn();
    const setHeader = jest.fn();
    const res = { setHeader } as never;

    mockHttpService.axiosRef.post.mockResolvedValueOnce({
      headers: {
        'content-type': 'text/csv',
        'content-disposition': 'attachment; filename="report.csv"',
      },
      data: { pipe },
    });

    await service.proxyExport('tenant-1', dto, 'csv', res);

    expect(setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
    expect(setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="report.csv"');
    expect(pipe).toHaveBeenCalledWith(res);
  });
});
