import { BadRequestException, GatewayTimeoutException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosError, AxiosResponse } from 'axios';
import { Response } from 'express';
import { ExportReportDto } from './dto/export-report.dto';

const ALL_METRICS = [
  'request_volume',
  'status_breakdown',
  'sla_health',
  'team_performance',
  'service_type_breakdown',
] as const;

@Injectable()
export class ExportService {
  private readonly pythonBaseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.pythonBaseUrl = this.configService.get<string>('AI_SERVICE_URL', 'http://localhost:8000');
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
      });
    }

    const metrics = dto.metrics ?? [...ALL_METRICS];

    let pythonResponse: AxiosResponse<NodeJS.ReadableStream>;
    try {
      pythonResponse = await this.httpService.axiosRef.post<NodeJS.ReadableStream>(
        `${this.pythonBaseUrl}/export/${format}`,
        { from_date: dto.from_date, to_date: dto.to_date, metrics },
        {
          headers: { 'x-tenant-id': tenantId },
          responseType: 'stream',
          timeout: 30_000,
        },
      );
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.code === 'ECONNABORTED') {
        throw new GatewayTimeoutException({
          error: { code: 'UPSTREAM_TIMEOUT', message: 'Export service timed out' },
        });
      }
      throw error;
    }

    const contentType = pythonResponse.headers['content-type'];
    const contentDisposition = pythonResponse.headers['content-disposition'];
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }
    if (contentDisposition) {
      res.setHeader('Content-Disposition', contentDisposition);
    }
    pythonResponse.data.pipe(res);
  }
}
