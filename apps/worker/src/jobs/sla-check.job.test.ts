import { PrismaClient, RequestActivityType, SlaHealth } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { runSlaCheck } from './sla-check.job';

const { logMock } = vi.hoisted(() => ({
  logMock: vi.fn(),
}));

vi.mock('../logger', () => ({
  log: logMock,
}));

type SlaRecord = {
  id: string;
  tenantId: string;
  requestId: string;
  type: string;
  health: SlaHealth;
  createdAt: Date;
  targetAt: Date;
  breachedAt: Date | null;
  isBreached: boolean;
};

type PrismaMock = {
  slaRecord: {
    findMany: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  requestActivity: {
    create: ReturnType<typeof vi.fn>;
  };
  $transaction: ReturnType<typeof vi.fn>;
};

function createPrismaMock(records: SlaRecord[]): PrismaMock {
  return {
    slaRecord: {
      findMany: vi.fn().mockResolvedValue(records),
      update: vi.fn().mockResolvedValue({}),
    },
    requestActivity: {
      create: vi.fn().mockResolvedValue({}),
    },
    $transaction: vi.fn().mockResolvedValue([]),
  };
}

describe('runSlaCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:08:00.000Z'));
  });

  it('updates changed records and writes SLA warning activity on at-risk transition', async () => {
    const prisma = createPrismaMock([
      {
        id: 'sla-1',
        tenantId: 'tenant-1',
        requestId: 'req-1',
        type: 'ASSIGNMENT',
        health: SlaHealth.ON_TRACK,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        targetAt: new Date('2026-01-01T00:10:00.000Z'),
        breachedAt: null,
        isBreached: false,
      },
    ]);

    const result = await runSlaCheck(prisma as unknown as PrismaClient);

    expect(result).toEqual({
      total: 1,
      changed: 1,
      atRisk: 1,
      breached: 0,
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.requestActivity.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: RequestActivityType.SLA_WARNING,
          title: 'SLA at risk',
        }),
      }),
    );
    expect(logMock).toHaveBeenCalledWith('INFO', 'SLA check completed', result);
  });

  it('keeps breached records updated without creating duplicate activity when health does not change', async () => {
    const breachedAt = new Date('2026-01-01T00:04:00.000Z');
    const prisma = createPrismaMock([
      {
        id: 'sla-2',
        tenantId: 'tenant-1',
        requestId: 'req-2',
        type: 'RESOLUTION',
        health: SlaHealth.BREACHED,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        targetAt: new Date('2026-01-01T00:03:00.000Z'),
        breachedAt,
        isBreached: true,
      },
    ]);

    const result = await runSlaCheck(prisma as unknown as PrismaClient);

    expect(result).toEqual({
      total: 1,
      changed: 0,
      atRisk: 0,
      breached: 1,
    });
    expect(prisma.slaRecord.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'sla-2' },
        data: expect.objectContaining({
          isBreached: true,
          breachedAt,
        }),
      }),
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.requestActivity.create).not.toHaveBeenCalled();
  });

  it('marks SLA as breached when target window is invalid (edge case targetAt <= createdAt)', async () => {
    const prisma = createPrismaMock([
      {
        id: 'sla-3',
        tenantId: 'tenant-1',
        requestId: 'req-3',
        type: 'ASSIGNMENT',
        health: SlaHealth.ON_TRACK,
        createdAt: new Date('2026-01-01T00:08:00.000Z'),
        targetAt: new Date('2026-01-01T00:07:00.000Z'),
        breachedAt: null,
        isBreached: false,
      },
    ]);

    const result = await runSlaCheck(prisma as unknown as PrismaClient);

    expect(result.breached).toBe(1);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.requestActivity.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: RequestActivityType.SLA_BREACHED,
          title: 'SLA breached',
        }),
      }),
    );
  });

  it('propagates prisma errors', async () => {
    const prisma = createPrismaMock([]);
    prisma.slaRecord.findMany.mockRejectedValueOnce(new Error('db down'));

    await expect(runSlaCheck(prisma as unknown as PrismaClient)).rejects.toThrow('db down');
  });
});
