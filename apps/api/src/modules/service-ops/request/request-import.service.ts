import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { Queue } from 'bullmq';
import ExcelJS from 'exceljs';
import Redis from 'ioredis';
import { randomUUID } from 'node:crypto';
import type {
  BulkImportJobEnqueuedResponse,
  BulkImportResult,
  ImportJobStatusResponse,
  ImportPreviewResult,
} from '@supportops/types';
import { AppException } from '../../../common/exceptions/app.exception';
import { ObjectStorageService } from '../../../common/storage/object-storage.service';
import type { UploadedBinaryFile } from '../../../common/types/uploaded-file.type';
import { PrismaService } from '../../../prisma/prisma.service';
import { ImportConfirmDto } from './dto/import-confirm.dto';
import { IMPORT_ALLOWED_MIMETYPES, IMPORT_MAX_FILE_SIZE } from './dto/import-upload.dto';

const IMPORT_QUEUE_NAME = 'import-requests';
const PREVIEW_KEY_PREFIX = 'import:preview:';
const STATUS_KEY_PREFIX = 'import:status:';
const META_KEY_PREFIX = 'import:meta:';
const RATE_LIMIT_KEY_PREFIX = 'import:upload-rate:';
const STATUS_TTL_SECONDS = 60 * 60;

interface ImportJobMeta {
  tenantId: string;
  userId: string;
  fileKey: string;
  mimeType: string;
  confirmed: boolean;
  originalFileName: string;
}

type ImportJobStatusValue = 'queued' | 'preview_ready' | 'processing' | 'completed' | 'failed';

@Injectable()
export class RequestImportService {
  private readonly queue: Queue;
  private readonly redis: Redis;

  constructor(
    private readonly prisma: PrismaService,
    private readonly objectStorageService: ObjectStorageService,
    private readonly configService: ConfigService,
  ) {
    const { host, port, password } = this.resolveRedisConnection();
    this.queue = new Queue(IMPORT_QUEUE_NAME, { connection: { host, port, password } });
    this.redis = new Redis({ host, port, password, lazyConnect: true, maxRetriesPerRequest: 1 });
  }

  async downloadTemplate(tenantId: string, format: 'csv' | 'xlsx'): Promise<Buffer> {
    const serviceTypes = await this.prisma.serviceType.findMany({
      where: { tenantId, isActive: true },
      select: { code: true, name: true },
      orderBy: { code: 'asc' },
    });

    const defaultServiceTypeCode = serviceTypes[0]?.code ?? 'IT_SUPPORT';
    const rows = [
      ['title', 'description', 'serviceTypeCode', 'priority', 'locationId', 'reporterEmail'],
      ['Laptop screen issue', 'Screen has horizontal lines', defaultServiceTypeCode, 'HIGH', 'HN-FLOOR-3', ''],
    ];

    if (format === 'csv') {
      const csv = rows.map((row) => row.map((value) => this.escapeCsv(value)).join(',')).join('\n');
      return Buffer.from(csv, 'utf8');
    }

    const workbook = new ExcelJS.Workbook();
    const dataSheet = workbook.addWorksheet('Data');
    rows.forEach((row) => dataSheet.addRow(row));

    const guideSheet = workbook.addWorksheet('Hướng dẫn');
    guideSheet.addRow(['Column', 'Required', 'Description']);
    guideSheet.addRow(['title', 'Yes', 'Request title']);
    guideSheet.addRow(['description', 'No', 'Request description']);
    guideSheet.addRow(['serviceTypeCode', 'Yes', 'Service type code in current tenant']);
    guideSheet.addRow(['priority', 'Yes', 'LOW | MEDIUM | HIGH | URGENT']);
    guideSheet.addRow(['locationId', 'Yes', 'Location identifier']);
    guideSheet.addRow(['reporterEmail', 'No', 'Empty = importer, non-empty = active member in tenant']);
    guideSheet.addRow([]);
    guideSheet.addRow(['ServiceTypeCode', 'ServiceTypeName']);
    serviceTypes.forEach((serviceType) => {
      guideSheet.addRow([serviceType.code, serviceType.name]);
    });
    guideSheet.addRow([]);
    guideSheet.addRow(['Examples']);
    guideSheet.addRow(['Printer jam at 2F', 'Printer keeps jamming', defaultServiceTypeCode, 'MEDIUM', 'HCM-2F', '']);
    guideSheet.addRow([
      'VPN unavailable',
      'Cannot connect after password reset',
      defaultServiceTypeCode,
      'HIGH',
      'REMOTE',
      'ops@example.com',
    ]);
    guideSheet.addRow([
      'Meeting room AC noisy',
      'Loud vibration noise from unit',
      defaultServiceTypeCode,
      'LOW',
      'HN-ROOM-12A',
      '',
    ]);

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  async uploadAndEnqueue(
    tenantId: string,
    userId: string,
    file: UploadedBinaryFile | undefined,
  ): Promise<BulkImportJobEnqueuedResponse> {
    await this.enforceUploadRateLimit(tenantId);

    if (!file) {
      throw new AppException(400, 'IMPORT_FILE_REQUIRED', 'Import file is required');
    }

    if (!IMPORT_ALLOWED_MIMETYPES.includes(file.mimetype as (typeof IMPORT_ALLOWED_MIMETYPES)[number])) {
      throw new AppException(400, 'IMPORT_INVALID_FORMAT', 'Only .csv and .xlsx files are accepted');
    }

    if (file.size > IMPORT_MAX_FILE_SIZE) {
      throw new AppException(400, 'IMPORT_FILE_TOO_LARGE', 'File exceeds 5MB limit');
    }

    const ext = file.mimetype.includes('spreadsheetml') ? 'xlsx' : 'csv';
    const jobId = randomUUID();
    const fileKey = `imports/${tenantId}/${jobId}/original.${ext}`;

    await this.objectStorageService.uploadPublicObject(fileKey, file.buffer);

    const meta: ImportJobMeta = {
      tenantId,
      userId,
      fileKey,
      mimeType: file.mimetype,
      confirmed: false,
      originalFileName: file.originalname,
    };
    await this.redis.set(this.metaKey(jobId), JSON.stringify(meta), 'EX', STATUS_TTL_SECONDS);
    await this.redis.set(
      this.statusKey(jobId),
      JSON.stringify({ status: 'queued', updatedAt: new Date().toISOString() }),
      'EX',
      STATUS_TTL_SECONDS,
    );

    await this.queue.add(
      IMPORT_QUEUE_NAME,
      {
        phase: 1,
        jobId,
        tenantId,
        userId,
        fileKey,
        mimeType: file.mimetype,
      },
      { jobId: `${jobId}:phase1` },
    );

    return {
      jobId,
      status: 'queued',
      fileName: file.originalname,
      uploadedAt: new Date().toISOString(),
    };
  }

  async getJobStatus(tenantId: string, jobId: string): Promise<ImportJobStatusResponse> {
    await this.readAndValidateMeta(tenantId, jobId);
    const rawStatus = await this.redis.get(this.statusKey(jobId));
    const parsedStatus = rawStatus ? (JSON.parse(rawStatus) as { status?: ImportJobStatusValue; error?: string }) : null;
    const status = parsedStatus?.status ?? 'queued';

    const response: ImportJobStatusResponse = { jobId, status };

    if (status === 'preview_ready') {
      const rawPreview = await this.redis.get(this.previewKey(jobId));
      if (rawPreview) {
        const parsed = JSON.parse(rawPreview) as { preview?: ImportPreviewResult };
        if (parsed.preview) {
          response.preview = parsed.preview;
        }
      }
    }

    if (status === 'completed') {
      const audit = await this.prisma.auditLog.findFirst({
        where: {
          tenantId,
          entityType: 'BulkImportJob',
          entityId: jobId,
          action: 'BULK_IMPORT_COMPLETED',
        },
        orderBy: { createdAt: 'desc' },
        select: { afterData: true },
      });

      if (audit?.afterData && typeof audit.afterData === 'object') {
        response.result = audit.afterData as unknown as BulkImportResult;
      }
    }

    if (status === 'failed' && parsedStatus?.error) {
      response.error = parsedStatus.error;
    }

    // Touch queue entries for observability and backward compatibility.
    await this.queue.getJob(`${jobId}:phase1`);
    await this.queue.getJob(`${jobId}:phase2`);

    return response;
  }

  async confirmJob(
    tenantId: string,
    userId: string,
    jobId: string,
    dto: ImportConfirmDto,
  ): Promise<{ jobId: string; status: 'queued' }> {
    const meta = await this.readAndValidateMeta(tenantId, jobId);
    if (meta.confirmed) {
      throw new AppException(409, 'IMPORT_JOB_ALREADY_CONFIRMED', 'Job already confirmed');
    }

    const rawStatus = await this.redis.get(this.statusKey(jobId));
    const parsedStatus = rawStatus ? (JSON.parse(rawStatus) as { status?: ImportJobStatusValue }) : null;
    if (parsedStatus?.status !== 'preview_ready') {
      throw new AppException(409, 'IMPORT_JOB_NOT_READY', 'Import job is not ready for confirmation');
    }

    await this.queue.add(
      IMPORT_QUEUE_NAME,
      {
        phase: 2,
        jobId,
        tenantId,
        userId,
        fileKey: meta.fileKey,
        mimeType: meta.mimeType,
        skipRowIndices: dto.skipRowIndices ?? [],
      },
      { jobId: `${jobId}:phase2` },
    );

    const nextMeta: ImportJobMeta = { ...meta, confirmed: true };
    await this.redis.set(this.metaKey(jobId), JSON.stringify(nextMeta), 'EX', STATUS_TTL_SECONDS);
    await this.redis.set(
      this.statusKey(jobId),
      JSON.stringify({ status: 'queued', updatedAt: new Date().toISOString() }),
      'EX',
      STATUS_TTL_SECONDS,
    );

    return { jobId, status: 'queued' };
  }

  private async enforceUploadRateLimit(tenantId: string): Promise<void> {
    await this.redis.connect().catch(() => undefined);

    const key = `${RATE_LIMIT_KEY_PREFIX}${tenantId}`;
    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, 60);
    }
    if (count > 10) {
      throw new AppException(429, 'RATE_LIMIT_EXCEEDED', 'Rate limit exceeded for import uploads');
    }
  }

  private async readAndValidateMeta(tenantId: string, jobId: string): Promise<ImportJobMeta> {
    await this.redis.connect().catch(() => undefined);

    const rawMeta = await this.redis.get(this.metaKey(jobId));
    if (!rawMeta) {
      throw new AppException(404, 'IMPORT_JOB_NOT_FOUND', 'Import job not found');
    }

    const meta = JSON.parse(rawMeta) as ImportJobMeta;
    if (meta.tenantId !== tenantId) {
      throw new AppException(403, 'IMPORT_JOB_FORBIDDEN', 'Job belongs to another tenant');
    }

    return meta;
  }

  private resolveRedisConnection(): { host: string; port: number; password?: string } {
    const redisUrl = this.configService.get<string>('app.redisUrl', '');
    if (!redisUrl) {
      return { host: 'localhost', port: 6379 };
    }

    const parsed = new URL(redisUrl);
    const host = parsed.hostname;
    const port = parsed.port ? Number(parsed.port) : 6379;
    const password = parsed.password || undefined;
    return { host, port, password };
  }

  private escapeCsv(value: string): string {
    const escaped = value.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  private metaKey(jobId: string): string {
    return `${META_KEY_PREFIX}${jobId}`;
  }

  private statusKey(jobId: string): string {
    return `${STATUS_KEY_PREFIX}${jobId}`;
  }

  private previewKey(jobId: string): string {
    return `${PREVIEW_KEY_PREFIX}${jobId}`;
  }
}
