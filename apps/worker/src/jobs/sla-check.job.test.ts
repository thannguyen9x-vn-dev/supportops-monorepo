import { SlaHealth, SlaType } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { runSlaCheckJob } from './sla-check.job';

type SlaRecordRow = {
  id: string;
  tenantId: string;
  requestId: string;
  type: SlaType;
  targetAt: Date;
  totalPausedSeconds: number;
  request: {
    tenantId: string;
    assigneeId: string | null;
    serviceType: { code: string };
  };
};

describe('runSlaCheckJob', () => {
  let prisma: any;
  let queue: { add: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-29T10:00:00.000Z'));

    prisma = {
      slaRecord: {
        findMany: vi.fn().mockResolvedValue([]),
        update: vi.fn().mockResolvedValue({}),
      },
      slaPolicy: {
        findMany: vi.fn().mockResolvedValue([]),
      },
    };

    queue = {
      add: vi.fn().mockResolvedValue({}),
    };
  });

  it('skips paused records via query filter (pausedAt != null)', async () => {
    await runSlaCheckJob(prisma, queue);

    expect(prisma.slaRecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          pausedAt: null,
        }),
      }),
    );
  });

  it('skips records that already have nearBreachNotifiedAt (idempotent)', async () => {
    await runSlaCheckJob(prisma, queue);

    expect(prisma.slaRecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          nearBreachNotifiedAt: null,
        }),
      }),
    );
    expect(prisma.slaRecord.update).not.toHaveBeenCalled();
    expect(queue.add).not.toHaveBeenCalled();
  });

  it('enqueues near-breach when minutesRemaining <= threshold', async () => {
    const record: SlaRecordRow = {
      id: 's1',
      tenantId: 't1',
      requestId: 'r1',
      type: SlaType.ASSIGNMENT,
      targetAt: new Date('2026-03-29T10:20:00.000Z'),
      totalPausedSeconds: 0,
      request: {
        tenantId: 't1',
        assigneeId: 'u1',
        serviceType: { code: 'IT' },
      },
    };

    prisma.slaRecord.findMany.mockResolvedValue([record]);
    prisma.slaPolicy.findMany.mockResolvedValue([
      { tenantId: 't1', serviceTypeCode: 'IT', nearBreachThresholdMinutes: 30 },
    ]);

    await runSlaCheckJob(prisma, queue);

    expect(queue.add).toHaveBeenCalledWith(
      'sla.near-breach',
      expect.objectContaining({ requestId: 'r1', tenantId: 't1', assigneeId: 'u1' }),
    );
    expect(prisma.slaRecord.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 's1' },
        data: expect.objectContaining({ nearBreachNotifiedAt: expect.any(Date) }),
      }),
    );
  });

  it('marks breached and enqueues breached job when minutesRemaining <= 0', async () => {
    const record: SlaRecordRow = {
      id: 's2',
      tenantId: 't1',
      requestId: 'r2',
      type: SlaType.RESOLUTION,
      targetAt: new Date('2026-03-29T09:30:00.000Z'),
      totalPausedSeconds: 0,
      request: {
        tenantId: 't1',
        assigneeId: 'u2',
        serviceType: { code: 'IT' },
      },
    };

    prisma.slaRecord.findMany.mockResolvedValue([record]);

    await runSlaCheckJob(prisma, queue);

    expect(prisma.slaRecord.update).toHaveBeenCalledWith({
      where: { id: 's2' },
      data: { isBreached: true, health: SlaHealth.BREACHED },
    });
    expect(queue.add).toHaveBeenCalledWith(
      'sla.breached',
      expect.objectContaining({ requestId: 'r2', tenantId: 't1', assigneeId: 'u2' }),
    );
  });

  it('skips RESOLVED/CLOSED/CANCELLED/WAITING_FOR_CUSTOMER requests by filter', async () => {
    await runSlaCheckJob(prisma, queue);

    expect(prisma.slaRecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          request: {
            status: {
              notIn: expect.arrayContaining(['RESOLVED', 'CLOSED', 'CANCELLED', 'WAITING_FOR_CUSTOMER']),
            },
          },
        }),
      }),
    );
  });

  it('uses totalPausedSeconds when computing adjustedTarget', async () => {
    const record: SlaRecordRow = {
      id: 's3',
      tenantId: 't1',
      requestId: 'r3',
      type: SlaType.ASSIGNMENT,
      targetAt: new Date('2026-03-29T09:59:40.000Z'),
      totalPausedSeconds: 30,
      request: {
        tenantId: 't1',
        assigneeId: 'u3',
        serviceType: { code: 'IT' },
      },
    };

    prisma.slaRecord.findMany.mockResolvedValue([record]);
    prisma.slaPolicy.findMany.mockResolvedValue([
      { tenantId: 't1', serviceTypeCode: 'IT', nearBreachThresholdMinutes: 5 },
    ]);

    await runSlaCheckJob(prisma, queue);

    expect(queue.add).toHaveBeenCalledWith(
      'sla.near-breach',
      expect.objectContaining({ requestId: 'r3' }),
    );
    expect(prisma.slaRecord.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 's3' } }),
    );
  });
});
