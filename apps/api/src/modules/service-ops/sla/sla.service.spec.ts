import { NotFoundException } from '../../../common/exceptions/not-found.exception';
import { PrismaService } from '../../../prisma/prisma.service';
import { SlaService } from './sla.service';

describe('SlaService', () => {
  let service: SlaService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      serviceType: { findMany: jest.fn(), findFirst: jest.fn() },
      slaRecord: {
        findMany: jest.fn(),
        count: jest.fn(),
        updateMany: jest.fn(),
        update: jest.fn(),
      },
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

  it('pauseSla sets pausedAt and is idempotent on repeated calls', async () => {
    prisma.slaRecord.updateMany.mockResolvedValue({ count: 2 });

    await service.pauseSla('t1', 'r1');
    await service.pauseSla('t1', 'r1');

    expect(prisma.slaRecord.updateMany).toHaveBeenCalledTimes(2);
    expect(prisma.slaRecord.updateMany).toHaveBeenCalledWith({
      where: {
        tenantId: 't1',
        requestId: 'r1',
        pausedAt: null,
        isBreached: false,
      },
      data: {
        pausedAt: expect.any(Date),
      },
    });
  });

  it('resumeSla increases totalPausedSeconds and clears pausedAt', async () => {
    const pausedAt = new Date(Date.now() - 60_000);
    prisma.slaRecord.findMany.mockResolvedValue([
      { id: 's1', pausedAt, totalPausedSeconds: 5 },
    ]);
    prisma.slaRecord.update.mockResolvedValue({});
    prisma.$transaction.mockImplementation((queries: unknown[]) => Promise.all(queries as Promise<unknown>[]));

    await service.resumeSla('t1', 'r1');

    expect(prisma.slaRecord.update).toHaveBeenCalledWith({
      where: { id: 's1' },
      data: expect.objectContaining({
        totalPausedSeconds: expect.any(Number),
        pausedAt: null,
      }),
    });
    const updateArg = prisma.slaRecord.update.mock.calls[0]?.[0]?.data;
    expect(updateArg.totalPausedSeconds).toBeGreaterThanOrEqual(65);
  });

  it('isNearBreach returns true only within threshold and false for paused/breached', () => {
    const now = Date.now();
    const activeRecord = {
      id: 's1',
      tenantId: 't1',
      requestId: 'r1',
      type: 'ASSIGNMENT',
      targetAt: new Date(now + 10 * 60_000),
      totalPausedSeconds: 0,
      pausedAt: null,
      isBreached: false,
      breachedAt: null,
      health: 'AT_RISK',
      nearBreachNotifiedAt: null,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    } as any;

    expect(service.isNearBreach(activeRecord, 15)).toBe(true);

    const paused = { ...activeRecord, pausedAt: new Date() };
    expect(service.isNearBreach(paused, 15)).toBe(false);

    const breached = { ...activeRecord, isBreached: true };
    expect(service.isNearBreach(breached, 15)).toBe(false);
  });
});
