import { RequestPriority, RequestStatus, SourceChannel } from '@prisma/client';
import { AppException } from '../../../common/exceptions/app.exception';
import { RequestBulkService } from './request-bulk.service';

describe('RequestBulkService', () => {
  const prisma = {
    serviceType: { findMany: jest.fn() },
    user: { findMany: jest.fn() },
    serviceRequest: { create: jest.fn() },
    auditLog: { create: jest.fn() },
    $transaction: jest.fn(),
  };

  let service: RequestBulkService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation((queries: unknown[]) => Promise.all(queries as Promise<unknown>[]));
    prisma.auditLog.create.mockResolvedValue({});
    prisma.serviceRequest.create.mockResolvedValue({});
    service = new RequestBulkService(prisma as any);
  });

  it('throws when items exceed 100', async () => {
    await expect(
      service.bulkCreate('t1', 'u1', {
        items: Array.from({ length: 101 }).map((_, index) => ({
          title: `Title ${index}`,
          description: 'Desc',
          serviceTypeCode: 'IT',
          priority: RequestPriority.MEDIUM,
          locationId: 'LOC',
        })),
      } as any),
    ).rejects.toBeInstanceOf(AppException);
  });

  it('creates valid rows and uses caller user fallback when reporterEmail is empty', async () => {
    prisma.serviceType.findMany.mockResolvedValue([{ id: 'st1', code: 'IT' }]);
    prisma.user.findMany.mockResolvedValue([]);

    const result = await service.bulkCreate('t1', 'u1', {
      items: [
        {
          title: 'Need support',
          description: 'Desc',
          serviceTypeCode: 'IT',
          priority: RequestPriority.HIGH,
          locationId: 'LOC-1',
        },
      ],
    } as any);

    expect(result).toEqual({ created: 1, failed: 0, errors: [] });
    expect(prisma.serviceRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 't1',
          requesterId: 'u1',
          status: RequestStatus.SUBMITTED,
          sourceChannel: SourceChannel.API,
        }),
      }),
    );
  });

  it('returns validation error for duplicate item in payload', async () => {
    prisma.serviceType.findMany.mockResolvedValue([{ id: 'st1', code: 'IT' }]);
    prisma.user.findMany.mockResolvedValue([]);

    const result = await service.bulkCreate('t1', 'u1', {
      items: [
        {
          title: 'Duplicate Title',
          description: 'Desc',
          serviceTypeCode: 'IT',
          priority: RequestPriority.HIGH,
          locationId: 'LOC-1',
        },
        {
          title: 'Duplicate Title',
          description: 'Desc 2',
          serviceTypeCode: 'IT',
          priority: RequestPriority.MEDIUM,
          locationId: 'LOC-2',
        },
      ],
    } as any);

    expect(result.created).toBe(1);
    expect(result.failed).toBe(1);
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ index: 1, field: 'title' })]),
    );
  });
});
