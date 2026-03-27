import { PrismaClient, RequestStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { runEscalationCheck } from './escalation-check.job';

const { logMock } = vi.hoisted(() => ({
  logMock: vi.fn(),
}));

vi.mock('../logger', () => ({
  log: logMock,
}));

type CandidateRequest = {
  id: string;
  tenantId: string;
  status: RequestStatus;
};

type PrismaMock = {
  serviceRequest: {
    findMany: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  auditLog: {
    findFirst: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  requestActivity: {
    create: ReturnType<typeof vi.fn>;
  };
  $transaction: ReturnType<typeof vi.fn>;
};

function createPrismaMock(candidates: CandidateRequest[]): PrismaMock {
  return {
    serviceRequest: {
      findMany: vi.fn().mockResolvedValue(candidates),
      update: vi.fn().mockResolvedValue({}),
    },
    auditLog: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({}),
    },
    requestActivity: {
      create: vi.fn().mockResolvedValue({}),
    },
    $transaction: vi.fn().mockResolvedValue([]),
  };
}

describe('runEscalationCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('escalates candidate requests and records activity/audit logs', async () => {
    const prisma = createPrismaMock([
      {
        id: 'req-1',
        tenantId: 'tenant-1',
        status: RequestStatus.IN_PROGRESS,
      },
    ]);

    const result = await runEscalationCheck(prisma as unknown as PrismaClient);

    expect(result).toEqual({
      candidates: 1,
      escalated: 1,
      skippedAlreadyEscalated: 0,
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.serviceRequest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'req-1' },
        data: { status: RequestStatus.WAITING_EXTERNAL_VENDOR },
      }),
    );
    expect(logMock).toHaveBeenCalledWith('INFO', 'Escalation check completed', result);
  });

  it('skips requests already auto-escalated (edge case idempotency)', async () => {
    const prisma = createPrismaMock([
      {
        id: 'req-2',
        tenantId: 'tenant-1',
        status: RequestStatus.ASSIGNED,
      },
    ]);
    prisma.auditLog.findFirst.mockResolvedValueOnce({ id: 'audit-1' });

    const result = await runEscalationCheck(prisma as unknown as PrismaClient);

    expect(result).toEqual({
      candidates: 1,
      escalated: 0,
      skippedAlreadyEscalated: 1,
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('handles empty candidate set', async () => {
    const prisma = createPrismaMock([]);

    const result = await runEscalationCheck(prisma as unknown as PrismaClient);

    expect(result).toEqual({
      candidates: 0,
      escalated: 0,
      skippedAlreadyEscalated: 0,
    });
  });

  it('propagates prisma errors', async () => {
    const prisma = createPrismaMock([]);
    prisma.serviceRequest.findMany.mockRejectedValueOnce(new Error('query failed'));

    await expect(runEscalationCheck(prisma as unknown as PrismaClient)).rejects.toThrow('query failed');
  });
});
