import {
  NotificationEventType,
  PrismaClient,
  RequestPriority,
  RequestStatus,
  SourceChannel,
  UserStatus,
} from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ImportJobDependencies,
  ImportRequestsJobData,
  MinioClientLike,
  processImportRequestsJob,
} from './import-requests.job';

type MockPrisma = ImportJobDependencies['prisma'];

function buildCsv(rows: string[][]): Buffer {
  const header = ['title', 'description', 'serviceTypeCode', 'priority', 'locationId', 'reporterEmail'];
  const lines = [header, ...rows].map((line) => line.join(',')).join('\n');
  return Buffer.from(lines, 'utf8');
}

function createRedisMock() {
  const store = new Map<string, string>();
  return {
    store,
    redis: {
      get: vi.fn(async (key: string) => store.get(key) ?? null),
      set: vi.fn(async (key: string, value: string) => {
        store.set(key, value);
      }),
      del: vi.fn(async (key: string) => {
        store.delete(key);
      }),
      incr: vi.fn(async () => 1),
      expire: vi.fn(async () => {}),
    },
  };
}

function createPrismaMock(): MockPrisma {
  const serviceRequestCreate = vi.fn(async () => ({}));
  const prismaLike = {
    serviceType: {
      findMany: vi.fn(async () => []),
    },
    user: {
      findMany: vi.fn(async () => []),
    },
    serviceRequest: {
      findMany: vi.fn(async () => []),
      create: serviceRequestCreate,
    },
    auditLog: {
      create: vi.fn(async () => ({})),
    },
    notification: {
      create: vi.fn(async () => ({})),
    },
    $transaction: vi.fn(
      async (
        arg:
          | Promise<unknown>[]
          | ((tx: { serviceRequest: { create: typeof serviceRequestCreate } }) => Promise<unknown>),
      ) => {
        if (typeof arg === 'function') {
          return arg({ serviceRequest: { create: serviceRequestCreate } });
        }
        return Promise.all(arg);
      },
    ) as unknown as PrismaClient['$transaction'],
  };

  return prismaLike as unknown as MockPrisma;
}

function createMinioMock(buffer: Buffer): MinioClientLike {
  return {
    getObject: vi.fn(async () => buffer),
    removeObject: vi.fn(async () => undefined),
  };
}

function phase1Data(overrides: Partial<ImportRequestsJobData> = {}): ImportRequestsJobData {
  return {
    phase: 1,
    jobId: 'job-1',
    tenantId: 'tenant-1',
    userId: 'importer-1',
    fileKey: 'imports/tenant-1/job-1/original.csv',
    mimeType: 'text/csv',
    ...overrides,
  } as ImportRequestsJobData;
}

function phase2Data(overrides: Partial<ImportRequestsJobData> = {}): ImportRequestsJobData {
  return {
    phase: 2,
    jobId: 'job-1',
    tenantId: 'tenant-1',
    userId: 'importer-1',
    fileKey: 'imports/tenant-1/job-1/original.csv',
    mimeType: 'text/csv',
    skipRowIndices: [],
    ...overrides,
  } as ImportRequestsJobData;
}

describe('processImportRequestsJob', () => {
  let prisma: MockPrisma;

  beforeEach(() => {
    prisma = createPrismaMock();
    vi.clearAllMocks();
  });

  it('Phase 1 parses valid CSV rows and stores preview with preview_ready status', async () => {
    const rows = [
      ['Issue A', 'Desc A', 'IT_HARDWARE', 'HIGH', 'LOC-1', 'user1@example.com'],
      ['Issue B', 'Desc B', 'IT_HARDWARE', 'MEDIUM', 'LOC-2', 'user2@example.com'],
      ['Issue C', '', 'IT_HARDWARE', 'LOW', 'LOC-3', ''],
      ['Issue D', '', 'IT_HARDWARE', 'URGENT', 'LOC-4', 'user1@example.com'],
      ['Issue E', 'Desc E', 'IT_HARDWARE', 'HIGH', 'LOC-5', ''],
    ];
    const { redis, store } = createRedisMock();
    const minioClient = createMinioMock(buildCsv(rows));

    (prisma.serviceType.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'st-1', code: 'IT_HARDWARE' },
    ]);
    (prisma.user.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'u-1', email: 'user1@example.com' },
      { id: 'u-2', email: 'user2@example.com' },
    ]);

    await processImportRequestsJob(phase1Data(), { prisma, redis, minioClient });

    const previewRaw = store.get('import:preview:job-1');
    expect(previewRaw).toBeDefined();
    const previewPayload = JSON.parse(previewRaw ?? '{}') as {
      preview: {
        totalRows: number;
        validRows: number;
        errorRows: unknown[];
        warningRows: unknown[];
      };
    };
    expect(previewPayload.preview.totalRows).toBe(5);
    expect(previewPayload.preview.validRows).toBe(5);
    expect(previewPayload.preview.errorRows).toHaveLength(0);
    expect(previewPayload.preview.warningRows).toHaveLength(0);
    expect(JSON.parse(store.get('import:status:job-1') ?? '{}')).toEqual(
      expect.objectContaining({ status: 'preview_ready' }),
    );
  });

  it('Phase 1 marks invalid serviceTypeCode row as error', async () => {
    const { redis, store } = createRedisMock();
    const minioClient = createMinioMock(
      buildCsv([['Issue A', 'Desc', 'UNKNOWN_CODE', 'HIGH', 'LOC-1', 'user1@example.com']]),
    );

    (prisma.serviceType.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (prisma.user.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: 'u-1', email: 'user1@example.com' }]);

    await processImportRequestsJob(phase1Data(), { prisma, redis, minioClient });

    const previewPayload = JSON.parse(store.get('import:preview:job-1') ?? '{}') as {
      preview: { errorRows: Array<{ field?: string }> };
    };
    expect(previewPayload.preview.errorRows).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'serviceTypeCode' })]),
    );
  });

  it('Phase 1 treats empty reporterEmail as valid fallback', async () => {
    const { redis, store } = createRedisMock();
    const minioClient = createMinioMock(buildCsv([['Issue A', 'Desc', 'IT_HARDWARE', 'HIGH', 'LOC-1', '']]));
    (prisma.serviceType.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'st-1', code: 'IT_HARDWARE' },
    ]);
    (prisma.user.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    await processImportRequestsJob(phase1Data(), { prisma, redis, minioClient });

    const previewPayload = JSON.parse(store.get('import:preview:job-1') ?? '{}') as {
      preview: { errorRows: unknown[] };
    };
    expect(previewPayload.preview.errorRows).toHaveLength(0);
  });

  it('Phase 1 marks non-member reporterEmail as error', async () => {
    const { redis, store } = createRedisMock();
    const minioClient = createMinioMock(
      buildCsv([['Issue A', 'Desc', 'IT_HARDWARE', 'HIGH', 'LOC-1', 'unknown@example.com']]),
    );
    (prisma.serviceType.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'st-1', code: 'IT_HARDWARE' },
    ]);
    (prisma.user.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    await processImportRequestsJob(phase1Data(), { prisma, redis, minioClient });

    const previewPayload = JSON.parse(store.get('import:preview:job-1') ?? '{}') as {
      preview: { errorRows: Array<{ field?: string }> };
    };
    expect(previewPayload.preview.errorRows).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'reporterEmail' })]),
    );
  });

  it('Phase 1 flags second duplicate row in file as error', async () => {
    const { redis, store } = createRedisMock();
    const minioClient = createMinioMock(
      buildCsv([
        ['Issue A', 'Desc', 'IT_HARDWARE', 'HIGH', 'LOC-1', 'user1@example.com'],
        ['Issue A', 'Desc', 'IT_HARDWARE', 'HIGH', 'LOC-1', 'user1@example.com'],
      ]),
    );
    (prisma.serviceType.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'st-1', code: 'IT_HARDWARE' },
    ]);
    (prisma.user.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: 'u-1', email: 'user1@example.com' }]);

    await processImportRequestsJob(phase1Data(), { prisma, redis, minioClient });

    const previewPayload = JSON.parse(store.get('import:preview:job-1') ?? '{}') as {
      preview: { errorRows: Array<{ row: number; message: string }> };
    };
    expect(previewPayload.preview.errorRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          row: 1,
          message: 'Duplicate row within this file',
        }),
      ]),
    );
  });

  it('Phase 1 marks cross-import duplicates as warnings', async () => {
    const { redis, store } = createRedisMock();
    const minioClient = createMinioMock(
      buildCsv([['Issue A', 'Desc', 'IT_HARDWARE', 'HIGH', 'LOC-1', 'user1@example.com']]),
    );
    (prisma.serviceType.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'st-1', code: 'IT_HARDWARE' },
    ]);
    (prisma.user.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: 'u-1', email: 'user1@example.com' }]);
    (prisma.serviceRequest.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { title: 'Issue A', serviceTypeId: 'st-1', requesterId: 'u-1' },
    ]);

    await processImportRequestsJob(phase1Data(), { prisma, redis, minioClient });

    const previewPayload = JSON.parse(store.get('import:preview:job-1') ?? '{}') as {
      preview: { warningRows: Array<{ type: string }> };
    };
    expect(previewPayload.preview.warningRows).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: 'duplicate_recent' })]),
    );
  });

  it('Phase 1 sets failed status when CSV parse is malformed', async () => {
    const { redis, store } = createRedisMock();
    const minioClient = createMinioMock(Buffer.from('title,priority\n"broken', 'utf8'));

    await expect(processImportRequestsJob(phase1Data(), { prisma, redis, minioClient })).rejects.toThrow();
    expect(JSON.parse(store.get('import:status:job-1') ?? '{}')).toEqual(
      expect.objectContaining({ status: 'failed' }),
    );
  });

  it('Phase 2 imports all valid rows when skipRowIndices is empty', async () => {
    const { redis, store } = createRedisMock();
    const minioClient = createMinioMock(Buffer.from(''));
    const rows = [
      {
        rowIndex: 0,
        title: 'Issue A',
        description: 'Desc A',
        serviceTypeCode: 'IT_HARDWARE',
        priority: RequestPriority.HIGH,
        locationId: 'LOC-1',
        reporterEmail: 'user1@example.com',
      },
      {
        rowIndex: 1,
        title: 'Issue B',
        description: 'Desc B',
        serviceTypeCode: 'IT_HARDWARE',
        priority: RequestPriority.MEDIUM,
        locationId: 'LOC-2',
      },
    ];

    store.set(
      'import:preview:job-1',
      JSON.stringify({
        rows,
        preview: { totalRows: 2, validRows: 2, errorRows: [], warningRows: [] },
      }),
    );

    (prisma.serviceType.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'st-1', code: 'IT_HARDWARE' },
    ]);
    (prisma.user.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: 'u-1', email: 'user1@example.com' }]);

    await processImportRequestsJob(phase2Data(), { prisma, redis, minioClient });

    expect(prisma.serviceRequest.create).toHaveBeenCalledTimes(2);
    expect(prisma.auditLog.create).toHaveBeenCalledTimes(1);
    expect(prisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: NotificationEventType.BULK_IMPORT_COMPLETED,
          userId: 'importer-1',
          tenantId: 'tenant-1',
        }),
      }),
    );
    expect(minioClient.removeObject).toHaveBeenCalledWith('imports/tenant-1/job-1/original.csv');
    expect(store.has('import:preview:job-1')).toBe(false);
  });

  it('Phase 2 skips rows listed in skipRowIndices', async () => {
    const { redis, store } = createRedisMock();
    const minioClient = createMinioMock(Buffer.from(''));
    const rows = Array.from({ length: 5 }).map((_, index) => ({
      rowIndex: index,
      title: `Issue ${index}`,
      description: `Desc ${index}`,
      serviceTypeCode: 'IT_HARDWARE',
      priority: RequestPriority.HIGH,
      locationId: `LOC-${index}`,
      reporterEmail: 'user1@example.com',
    }));
    store.set(
      'import:preview:job-1',
      JSON.stringify({
        rows,
        preview: { totalRows: 5, validRows: 5, errorRows: [], warningRows: [] },
      }),
    );

    (prisma.serviceType.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'st-1', code: 'IT_HARDWARE' },
    ]);
    (prisma.user.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: 'u-1', email: 'user1@example.com' }]);

    await processImportRequestsJob(phase2Data({ skipRowIndices: [2, 4] }), { prisma, redis, minioClient });

    expect(prisma.serviceRequest.create).toHaveBeenCalledTimes(3);
  });

  it('Phase 2 fails when preview key has expired in Redis', async () => {
    const { redis } = createRedisMock();
    const minioClient = createMinioMock(Buffer.from(''));

    await expect(processImportRequestsJob(phase2Data(), { prisma, redis, minioClient })).rejects.toThrow(
      'Import preview has expired. Please upload the file again.',
    );
  });

  it('Phase 2 creates completion notification with correct type', async () => {
    const { redis, store } = createRedisMock();
    const minioClient = createMinioMock(Buffer.from(''));
    store.set(
      'import:preview:job-1',
      JSON.stringify({
        rows: [
          {
            rowIndex: 0,
            title: 'Issue A',
            description: 'Desc A',
            serviceTypeCode: 'IT_HARDWARE',
            priority: RequestPriority.HIGH,
            locationId: 'LOC-1',
            reporterEmail: 'user1@example.com',
          },
        ],
        preview: { totalRows: 1, validRows: 1, errorRows: [], warningRows: [] },
      }),
    );

    (prisma.serviceType.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'st-1', code: 'IT_HARDWARE' },
    ]);
    (prisma.user.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: 'u-1', email: 'user1@example.com' }]);

    await processImportRequestsJob(phase2Data(), { prisma, redis, minioClient });

    expect(prisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: NotificationEventType.BULK_IMPORT_COMPLETED,
        }),
      }),
    );
  });

  it('Phase 1 queries reporter lookup with ACTIVE users only', async () => {
    const { redis } = createRedisMock();
    const minioClient = createMinioMock(
      buildCsv([['Issue A', 'Desc', 'IT_HARDWARE', 'HIGH', 'LOC-1', 'user1@example.com']]),
    );

    (prisma.serviceType.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'st-1', code: 'IT_HARDWARE' },
    ]);
    (prisma.user.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: 'u-1', email: 'user1@example.com' }]);

    await processImportRequestsJob(phase1Data(), { prisma, redis, minioClient });

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: 'tenant-1',
          status: UserStatus.ACTIVE,
        }),
      }),
    );
  });

  it('Phase 2 creates request rows with tenant-scoped data from job payload', async () => {
    const { redis, store } = createRedisMock();
    const minioClient = createMinioMock(Buffer.from(''));
    store.set(
      'import:preview:job-1',
      JSON.stringify({
        rows: [
          {
            rowIndex: 0,
            title: 'Issue A',
            description: 'Desc A',
            serviceTypeCode: 'IT_HARDWARE',
            priority: RequestPriority.HIGH,
            locationId: 'LOC-1',
          },
        ],
        preview: { totalRows: 1, validRows: 1, errorRows: [], warningRows: [] },
      }),
    );
    (prisma.serviceType.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'st-1', code: 'IT_HARDWARE' },
    ]);
    (prisma.user.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    await processImportRequestsJob(phase2Data(), { prisma, redis, minioClient });

    expect(prisma.serviceRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          status: RequestStatus.SUBMITTED,
          sourceChannel: SourceChannel.API,
          requesterId: 'importer-1',
        }),
      }),
    );
  });
});
