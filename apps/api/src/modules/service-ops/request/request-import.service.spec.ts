import { RequestImportService } from './request-import.service';

const queueAddMock = jest.fn();
const queueGetJobMock = jest.fn();
const redisConnectMock = jest.fn();
const redisGetMock = jest.fn();
const redisSetMock = jest.fn();
const redisIncrMock = jest.fn();
const redisExpireMock = jest.fn();

jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    add: queueAddMock,
    getJob: queueGetJobMock,
  })),
}));

jest.mock('ioredis', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      connect: redisConnectMock,
      get: redisGetMock,
      set: redisSetMock,
      incr: redisIncrMock,
      expire: redisExpireMock,
    })),
  };
});

describe('RequestImportService', () => {
  const prisma = {
    serviceType: { findMany: jest.fn() },
    auditLog: { findFirst: jest.fn() },
  };
  const storage = {
    uploadPublicObject: jest.fn(),
  };
  const config = {
    get: jest.fn((key: string, fallback: string) => {
      if (key === 'app.redisUrl') {
        return '';
      }
      return fallback;
    }),
  };

  let service: RequestImportService;

  beforeEach(() => {
    jest.clearAllMocks();
    redisConnectMock.mockResolvedValue(undefined);
    redisSetMock.mockResolvedValue('OK');
    redisGetMock.mockResolvedValue(null);
    redisIncrMock.mockResolvedValue(1);
    redisExpireMock.mockResolvedValue(1);
    queueAddMock.mockResolvedValue({});
    queueGetJobMock.mockResolvedValue({ id: 'j1' });
    prisma.serviceType.findMany.mockResolvedValue([]);
    prisma.auditLog.findFirst.mockResolvedValue(null);
    storage.uploadPublicObject.mockResolvedValue('http://localhost/storage/file.csv');

    service = new RequestImportService(prisma as any, storage as any, config as any);
  });

  it('uploadAndEnqueue validates file and enqueues phase 1 job', async () => {
    const result = await service.uploadAndEnqueue('t1', 'u1', {
      originalname: 'requests.csv',
      mimetype: 'text/csv',
      size: 200,
      buffer: Buffer.from('title,serviceTypeCode,priority,locationId\nx,IT,HIGH,LOC'),
    } as any);

    expect(result.status).toBe('queued');
    expect(storage.uploadPublicObject).toHaveBeenCalled();
    expect(queueAddMock).toHaveBeenCalledWith(
      'import-requests',
      expect.objectContaining({ phase: 1, tenantId: 't1', userId: 'u1' }),
      expect.objectContaining({ jobId: expect.stringContaining(':phase1') }),
    );
  });

  it('getJobStatus returns preview when status is preview_ready', async () => {
    redisGetMock
      .mockResolvedValueOnce(JSON.stringify({ tenantId: 't1', userId: 'u1', fileKey: 'k', mimeType: 'text/csv', confirmed: false, originalFileName: 'x.csv' }))
      .mockResolvedValueOnce(JSON.stringify({ status: 'preview_ready' }))
      .mockResolvedValueOnce(JSON.stringify({ preview: { totalRows: 1, validRows: 1, errorRows: [], warningRows: [] } }));

    const result = await service.getJobStatus('t1', 'f9f2114a-6e49-4e41-8cb0-1496f85f4a39');

    expect(result.status).toBe('preview_ready');
    expect(result.preview).toEqual({ totalRows: 1, validRows: 1, errorRows: [], warningRows: [] });
  });

  it('confirmJob marks metadata confirmed and enqueues phase 2 job', async () => {
    redisGetMock
      .mockResolvedValueOnce(JSON.stringify({ tenantId: 't1', userId: 'u1', fileKey: 'imports/t1/j1/original.csv', mimeType: 'text/csv', confirmed: false, originalFileName: 'x.csv' }))
      .mockResolvedValueOnce(JSON.stringify({ status: 'preview_ready' }));

    const result = await service.confirmJob(
      't1',
      'u1',
      'f9f2114a-6e49-4e41-8cb0-1496f85f4a39',
      { skipRowIndices: [1, 2] } as any,
    );

    expect(result).toEqual({ jobId: 'f9f2114a-6e49-4e41-8cb0-1496f85f4a39', status: 'queued' });
    expect(queueAddMock).toHaveBeenCalledWith(
      'import-requests',
      expect.objectContaining({ phase: 2, skipRowIndices: [1, 2] }),
      expect.objectContaining({ jobId: 'f9f2114a-6e49-4e41-8cb0-1496f85f4a39:phase2' }),
    );
  });
});
