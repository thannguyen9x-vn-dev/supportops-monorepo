"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const vitest_1 = require("vitest");
const import_requests_job_1 = require("./import-requests.job");
function buildCsv(rows) {
    const header = ['title', 'description', 'serviceTypeCode', 'priority', 'locationId', 'reporterEmail'];
    const lines = [header, ...rows].map((line) => line.join(',')).join('\n');
    return Buffer.from(lines, 'utf8');
}
function createRedisMock() {
    const store = new Map();
    return {
        store,
        redis: {
            get: vitest_1.vi.fn(async (key) => store.get(key) ?? null),
            set: vitest_1.vi.fn(async (key, value) => {
                store.set(key, value);
            }),
            del: vitest_1.vi.fn(async (key) => {
                store.delete(key);
            }),
            incr: vitest_1.vi.fn(async () => 1),
            expire: vitest_1.vi.fn(async () => { }),
        },
    };
}
function createPrismaMock() {
    const serviceRequestCreate = vitest_1.vi.fn(async () => ({}));
    const prismaLike = {
        serviceType: {
            findMany: vitest_1.vi.fn(async () => []),
        },
        user: {
            findMany: vitest_1.vi.fn(async () => []),
        },
        serviceRequest: {
            findMany: vitest_1.vi.fn(async () => []),
            create: serviceRequestCreate,
        },
        auditLog: {
            create: vitest_1.vi.fn(async () => ({})),
        },
        notification: {
            create: vitest_1.vi.fn(async () => ({})),
        },
        $transaction: vitest_1.vi.fn(async (arg) => {
            if (typeof arg === 'function') {
                return arg({ serviceRequest: { create: serviceRequestCreate } });
            }
            return Promise.all(arg);
        }),
    };
    return prismaLike;
}
function createMinioMock(buffer) {
    return {
        getObject: vitest_1.vi.fn(async () => buffer),
        removeObject: vitest_1.vi.fn(async () => undefined),
    };
}
function phase1Data(overrides = {}) {
    return {
        phase: 1,
        jobId: 'job-1',
        tenantId: 'tenant-1',
        userId: 'importer-1',
        fileKey: 'imports/tenant-1/job-1/original.csv',
        mimeType: 'text/csv',
        ...overrides,
    };
}
function phase2Data(overrides = {}) {
    return {
        phase: 2,
        jobId: 'job-1',
        tenantId: 'tenant-1',
        userId: 'importer-1',
        fileKey: 'imports/tenant-1/job-1/original.csv',
        mimeType: 'text/csv',
        skipRowIndices: [],
        ...overrides,
    };
}
(0, vitest_1.describe)('processImportRequestsJob', () => {
    let prisma;
    (0, vitest_1.beforeEach)(() => {
        prisma = createPrismaMock();
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)('Phase 1 parses valid CSV rows and stores preview with preview_ready status', async () => {
        const rows = [
            ['Issue A', 'Desc A', 'IT_HARDWARE', 'HIGH', 'LOC-1', 'user1@example.com'],
            ['Issue B', 'Desc B', 'IT_HARDWARE', 'MEDIUM', 'LOC-2', 'user2@example.com'],
            ['Issue C', '', 'IT_HARDWARE', 'LOW', 'LOC-3', ''],
            ['Issue D', '', 'IT_HARDWARE', 'URGENT', 'LOC-4', 'user1@example.com'],
            ['Issue E', 'Desc E', 'IT_HARDWARE', 'HIGH', 'LOC-5', ''],
        ];
        const { redis, store } = createRedisMock();
        const minioClient = createMinioMock(buildCsv(rows));
        prisma.serviceType.findMany.mockResolvedValue([
            { id: 'st-1', code: 'IT_HARDWARE' },
        ]);
        prisma.user.findMany.mockResolvedValue([
            { id: 'u-1', email: 'user1@example.com' },
            { id: 'u-2', email: 'user2@example.com' },
        ]);
        await (0, import_requests_job_1.processImportRequestsJob)(phase1Data(), { prisma, redis, minioClient });
        const previewRaw = store.get('import:preview:job-1');
        (0, vitest_1.expect)(previewRaw).toBeDefined();
        const previewPayload = JSON.parse(previewRaw ?? '{}');
        (0, vitest_1.expect)(previewPayload.preview.totalRows).toBe(5);
        (0, vitest_1.expect)(previewPayload.preview.validRows).toBe(5);
        (0, vitest_1.expect)(previewPayload.preview.errorRows).toHaveLength(0);
        (0, vitest_1.expect)(previewPayload.preview.warningRows).toHaveLength(0);
        (0, vitest_1.expect)(JSON.parse(store.get('import:status:job-1') ?? '{}')).toEqual(vitest_1.expect.objectContaining({ status: 'preview_ready' }));
    });
    (0, vitest_1.it)('Phase 1 marks invalid serviceTypeCode row as error', async () => {
        const { redis, store } = createRedisMock();
        const minioClient = createMinioMock(buildCsv([['Issue A', 'Desc', 'UNKNOWN_CODE', 'HIGH', 'LOC-1', 'user1@example.com']]));
        prisma.serviceType.findMany.mockResolvedValue([]);
        prisma.user.findMany.mockResolvedValue([{ id: 'u-1', email: 'user1@example.com' }]);
        await (0, import_requests_job_1.processImportRequestsJob)(phase1Data(), { prisma, redis, minioClient });
        const previewPayload = JSON.parse(store.get('import:preview:job-1') ?? '{}');
        (0, vitest_1.expect)(previewPayload.preview.errorRows).toEqual(vitest_1.expect.arrayContaining([vitest_1.expect.objectContaining({ field: 'serviceTypeCode' })]));
    });
    (0, vitest_1.it)('Phase 1 treats empty reporterEmail as valid fallback', async () => {
        const { redis, store } = createRedisMock();
        const minioClient = createMinioMock(buildCsv([['Issue A', 'Desc', 'IT_HARDWARE', 'HIGH', 'LOC-1', '']]));
        prisma.serviceType.findMany.mockResolvedValue([
            { id: 'st-1', code: 'IT_HARDWARE' },
        ]);
        prisma.user.findMany.mockResolvedValue([]);
        await (0, import_requests_job_1.processImportRequestsJob)(phase1Data(), { prisma, redis, minioClient });
        const previewPayload = JSON.parse(store.get('import:preview:job-1') ?? '{}');
        (0, vitest_1.expect)(previewPayload.preview.errorRows).toHaveLength(0);
    });
    (0, vitest_1.it)('Phase 1 marks non-member reporterEmail as error', async () => {
        const { redis, store } = createRedisMock();
        const minioClient = createMinioMock(buildCsv([['Issue A', 'Desc', 'IT_HARDWARE', 'HIGH', 'LOC-1', 'unknown@example.com']]));
        prisma.serviceType.findMany.mockResolvedValue([
            { id: 'st-1', code: 'IT_HARDWARE' },
        ]);
        prisma.user.findMany.mockResolvedValue([]);
        await (0, import_requests_job_1.processImportRequestsJob)(phase1Data(), { prisma, redis, minioClient });
        const previewPayload = JSON.parse(store.get('import:preview:job-1') ?? '{}');
        (0, vitest_1.expect)(previewPayload.preview.errorRows).toEqual(vitest_1.expect.arrayContaining([vitest_1.expect.objectContaining({ field: 'reporterEmail' })]));
    });
    (0, vitest_1.it)('Phase 1 flags second duplicate row in file as error', async () => {
        const { redis, store } = createRedisMock();
        const minioClient = createMinioMock(buildCsv([
            ['Issue A', 'Desc', 'IT_HARDWARE', 'HIGH', 'LOC-1', 'user1@example.com'],
            ['Issue A', 'Desc', 'IT_HARDWARE', 'HIGH', 'LOC-1', 'user1@example.com'],
        ]));
        prisma.serviceType.findMany.mockResolvedValue([
            { id: 'st-1', code: 'IT_HARDWARE' },
        ]);
        prisma.user.findMany.mockResolvedValue([{ id: 'u-1', email: 'user1@example.com' }]);
        await (0, import_requests_job_1.processImportRequestsJob)(phase1Data(), { prisma, redis, minioClient });
        const previewPayload = JSON.parse(store.get('import:preview:job-1') ?? '{}');
        (0, vitest_1.expect)(previewPayload.preview.errorRows).toEqual(vitest_1.expect.arrayContaining([
            vitest_1.expect.objectContaining({
                row: 1,
                message: 'Duplicate row within this file',
            }),
        ]));
    });
    (0, vitest_1.it)('Phase 1 marks cross-import duplicates as warnings', async () => {
        const { redis, store } = createRedisMock();
        const minioClient = createMinioMock(buildCsv([['Issue A', 'Desc', 'IT_HARDWARE', 'HIGH', 'LOC-1', 'user1@example.com']]));
        prisma.serviceType.findMany.mockResolvedValue([
            { id: 'st-1', code: 'IT_HARDWARE' },
        ]);
        prisma.user.findMany.mockResolvedValue([{ id: 'u-1', email: 'user1@example.com' }]);
        prisma.serviceRequest.findMany.mockResolvedValue([
            { title: 'Issue A', serviceTypeId: 'st-1', requesterId: 'u-1' },
        ]);
        await (0, import_requests_job_1.processImportRequestsJob)(phase1Data(), { prisma, redis, minioClient });
        const previewPayload = JSON.parse(store.get('import:preview:job-1') ?? '{}');
        (0, vitest_1.expect)(previewPayload.preview.warningRows).toEqual(vitest_1.expect.arrayContaining([vitest_1.expect.objectContaining({ type: 'duplicate_recent' })]));
    });
    (0, vitest_1.it)('Phase 1 sets failed status when CSV parse is malformed', async () => {
        const { redis, store } = createRedisMock();
        const minioClient = createMinioMock(Buffer.from('title,priority\n"broken', 'utf8'));
        await (0, vitest_1.expect)((0, import_requests_job_1.processImportRequestsJob)(phase1Data(), { prisma, redis, minioClient })).rejects.toThrow();
        (0, vitest_1.expect)(JSON.parse(store.get('import:status:job-1') ?? '{}')).toEqual(vitest_1.expect.objectContaining({ status: 'failed' }));
    });
    (0, vitest_1.it)('Phase 2 imports all valid rows when skipRowIndices is empty', async () => {
        const { redis, store } = createRedisMock();
        const minioClient = createMinioMock(Buffer.from(''));
        const rows = [
            {
                rowIndex: 0,
                title: 'Issue A',
                description: 'Desc A',
                serviceTypeCode: 'IT_HARDWARE',
                priority: client_1.RequestPriority.HIGH,
                locationId: 'LOC-1',
                reporterEmail: 'user1@example.com',
            },
            {
                rowIndex: 1,
                title: 'Issue B',
                description: 'Desc B',
                serviceTypeCode: 'IT_HARDWARE',
                priority: client_1.RequestPriority.MEDIUM,
                locationId: 'LOC-2',
            },
        ];
        store.set('import:preview:job-1', JSON.stringify({
            rows,
            preview: { totalRows: 2, validRows: 2, errorRows: [], warningRows: [] },
        }));
        prisma.serviceType.findMany.mockResolvedValue([
            { id: 'st-1', code: 'IT_HARDWARE' },
        ]);
        prisma.user.findMany.mockResolvedValue([{ id: 'u-1', email: 'user1@example.com' }]);
        await (0, import_requests_job_1.processImportRequestsJob)(phase2Data(), { prisma, redis, minioClient });
        (0, vitest_1.expect)(prisma.serviceRequest.create).toHaveBeenCalledTimes(2);
        (0, vitest_1.expect)(prisma.auditLog.create).toHaveBeenCalledTimes(1);
        (0, vitest_1.expect)(prisma.notification.create).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
            data: vitest_1.expect.objectContaining({
                type: client_1.NotificationEventType.BULK_IMPORT_COMPLETED,
                userId: 'importer-1',
                tenantId: 'tenant-1',
            }),
        }));
        (0, vitest_1.expect)(minioClient.removeObject).toHaveBeenCalledWith('imports/tenant-1/job-1/original.csv');
        (0, vitest_1.expect)(store.has('import:preview:job-1')).toBe(false);
    });
    (0, vitest_1.it)('Phase 2 skips rows listed in skipRowIndices', async () => {
        const { redis, store } = createRedisMock();
        const minioClient = createMinioMock(Buffer.from(''));
        const rows = Array.from({ length: 5 }).map((_, index) => ({
            rowIndex: index,
            title: `Issue ${index}`,
            description: `Desc ${index}`,
            serviceTypeCode: 'IT_HARDWARE',
            priority: client_1.RequestPriority.HIGH,
            locationId: `LOC-${index}`,
            reporterEmail: 'user1@example.com',
        }));
        store.set('import:preview:job-1', JSON.stringify({
            rows,
            preview: { totalRows: 5, validRows: 5, errorRows: [], warningRows: [] },
        }));
        prisma.serviceType.findMany.mockResolvedValue([
            { id: 'st-1', code: 'IT_HARDWARE' },
        ]);
        prisma.user.findMany.mockResolvedValue([{ id: 'u-1', email: 'user1@example.com' }]);
        await (0, import_requests_job_1.processImportRequestsJob)(phase2Data({ skipRowIndices: [2, 4] }), { prisma, redis, minioClient });
        (0, vitest_1.expect)(prisma.serviceRequest.create).toHaveBeenCalledTimes(3);
    });
    (0, vitest_1.it)('Phase 2 fails when preview key has expired in Redis', async () => {
        const { redis } = createRedisMock();
        const minioClient = createMinioMock(Buffer.from(''));
        await (0, vitest_1.expect)((0, import_requests_job_1.processImportRequestsJob)(phase2Data(), { prisma, redis, minioClient })).rejects.toThrow('Import preview has expired. Please upload the file again.');
    });
    (0, vitest_1.it)('Phase 2 creates completion notification with correct type', async () => {
        const { redis, store } = createRedisMock();
        const minioClient = createMinioMock(Buffer.from(''));
        store.set('import:preview:job-1', JSON.stringify({
            rows: [
                {
                    rowIndex: 0,
                    title: 'Issue A',
                    description: 'Desc A',
                    serviceTypeCode: 'IT_HARDWARE',
                    priority: client_1.RequestPriority.HIGH,
                    locationId: 'LOC-1',
                    reporterEmail: 'user1@example.com',
                },
            ],
            preview: { totalRows: 1, validRows: 1, errorRows: [], warningRows: [] },
        }));
        prisma.serviceType.findMany.mockResolvedValue([
            { id: 'st-1', code: 'IT_HARDWARE' },
        ]);
        prisma.user.findMany.mockResolvedValue([{ id: 'u-1', email: 'user1@example.com' }]);
        await (0, import_requests_job_1.processImportRequestsJob)(phase2Data(), { prisma, redis, minioClient });
        (0, vitest_1.expect)(prisma.notification.create).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
            data: vitest_1.expect.objectContaining({
                type: client_1.NotificationEventType.BULK_IMPORT_COMPLETED,
            }),
        }));
    });
    (0, vitest_1.it)('Phase 1 queries reporter lookup with ACTIVE users only', async () => {
        const { redis } = createRedisMock();
        const minioClient = createMinioMock(buildCsv([['Issue A', 'Desc', 'IT_HARDWARE', 'HIGH', 'LOC-1', 'user1@example.com']]));
        prisma.serviceType.findMany.mockResolvedValue([
            { id: 'st-1', code: 'IT_HARDWARE' },
        ]);
        prisma.user.findMany.mockResolvedValue([{ id: 'u-1', email: 'user1@example.com' }]);
        await (0, import_requests_job_1.processImportRequestsJob)(phase1Data(), { prisma, redis, minioClient });
        (0, vitest_1.expect)(prisma.user.findMany).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
            where: vitest_1.expect.objectContaining({
                tenantId: 'tenant-1',
                status: client_1.UserStatus.ACTIVE,
            }),
        }));
    });
    (0, vitest_1.it)('Phase 2 creates request rows with tenant-scoped data from job payload', async () => {
        const { redis, store } = createRedisMock();
        const minioClient = createMinioMock(Buffer.from(''));
        store.set('import:preview:job-1', JSON.stringify({
            rows: [
                {
                    rowIndex: 0,
                    title: 'Issue A',
                    description: 'Desc A',
                    serviceTypeCode: 'IT_HARDWARE',
                    priority: client_1.RequestPriority.HIGH,
                    locationId: 'LOC-1',
                },
            ],
            preview: { totalRows: 1, validRows: 1, errorRows: [], warningRows: [] },
        }));
        prisma.serviceType.findMany.mockResolvedValue([
            { id: 'st-1', code: 'IT_HARDWARE' },
        ]);
        prisma.user.findMany.mockResolvedValue([]);
        await (0, import_requests_job_1.processImportRequestsJob)(phase2Data(), { prisma, redis, minioClient });
        (0, vitest_1.expect)(prisma.serviceRequest.create).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
            data: vitest_1.expect.objectContaining({
                tenantId: 'tenant-1',
                status: client_1.RequestStatus.SUBMITTED,
                sourceChannel: client_1.SourceChannel.API,
                requesterId: 'importer-1',
            }),
        }));
    });
});
//# sourceMappingURL=import-requests.job.spec.js.map