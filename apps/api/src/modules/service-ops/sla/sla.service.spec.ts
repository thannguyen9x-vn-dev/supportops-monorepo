import { NotFoundException } from '../../../common/exceptions/not-found.exception';
import { PrismaService } from '../../../prisma/prisma.service';
import { SlaService } from './sla.service';

describe('SlaService', () => {
  let service: SlaService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      serviceType: { findMany: jest.fn(), findFirst: jest.fn() },
      slaRecord: { findMany: jest.fn(), count: jest.fn() },
      $transaction: jest.fn(),
    };
    prisma.$transaction.mockImplementation((queries: unknown[]) => Promise.all(queries as Promise<unknown>[]));

    service = new SlaService(prisma as unknown as PrismaService);
  });

  it('listPolicies returns GENERAL policy when no active service type', async () => {
    prisma.serviceType.findMany.mockResolvedValue([]);

    const result = await service.listPolicies('t1');

    expect(result).toHaveLength(1);
    expect(result[0]?.serviceTypeCode).toBe('GENERAL');
  });

  it('detailPolicy throws when service type code is invalid', async () => {
    await expect(service.detailPolicy('t1', 'policy-')).rejects.toThrow(NotFoundException);
  });

  it('listViolations returns mapped paginated data', async () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    prisma.slaRecord.findMany.mockResolvedValue([
      {
        id: 's1',
        tenantId: 't1',
        requestId: 'r1',
        type: 'ASSIGNMENT',
        targetAt: now,
        breachedAt: now,
        isBreached: true,
        health: 'BREACHED',
        updatedAt: now,
        createdAt: now,
        request: {
          requestCode: 'REQ-1',
          title: 'Issue',
          status: 'SUBMITTED',
        },
      },
    ]);
    prisma.slaRecord.count.mockResolvedValue(1);

    const result = await service.listViolations('t1', { page: 1, size: 20 } as any);

    expect(prisma.slaRecord.findMany).toHaveBeenCalled();
    expect(result.meta.total).toBe(1);
    expect(result.data[0]?.id).toBe('s1');
  });
});
