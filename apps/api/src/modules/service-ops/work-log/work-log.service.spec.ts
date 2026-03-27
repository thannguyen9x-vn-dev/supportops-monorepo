import { ForbiddenException } from '../../../common/exceptions/forbidden.exception';
import { NotFoundException } from '../../../common/exceptions/not-found.exception';
import { PrismaService } from '../../../prisma/prisma.service';
import { WorkLogService } from './work-log.service';

describe('WorkLogService', () => {
  let service: WorkLogService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      serviceRequest: { findFirst: jest.fn() },
      workLog: { findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn() },
      $transaction: jest.fn(),
    };
    prisma.$transaction.mockImplementation((queries: unknown[]) => Promise.all(queries as Promise<unknown>[]));

    service = new WorkLogService(prisma as unknown as PrismaService);
  });

  it('list returns work logs when actor can read all', async () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    prisma.serviceRequest.findFirst.mockResolvedValue({ id: 'r1', requesterId: 'u2', assigneeId: 'u3' });
    prisma.workLog.findMany.mockResolvedValue([
      {
        id: 'w1', tenantId: 't1', requestId: 'r1', authorId: 'u3', content: 'done',
        minutesSpent: 30, startedAt: now, endedAt: now, createdAt: now,
      },
    ]);
    prisma.workLog.count.mockResolvedValue(1);

    const result = await service.list('t1', 'u1', ['request.read.all'], 'r1', { page: 1, size: 20 });

    expect(result.data[0]?.id).toBe('w1');
    expect(result.meta.total).toBe(1);
  });

  it('list throws forbidden for unrelated actor without permission', async () => {
    prisma.serviceRequest.findFirst.mockResolvedValue({ id: 'r1', requesterId: 'u2', assigneeId: 'u3' });

    await expect(service.list('t1', 'u9', ['request.read.own'], 'r1', { page: 1, size: 20 })).rejects.toThrow(ForbiddenException);
  });

  it('detail throws not found when work log does not exist', async () => {
    prisma.serviceRequest.findFirst.mockResolvedValue({ id: 'r1', requesterId: 'u1', assigneeId: 'u3' });
    prisma.workLog.findFirst.mockResolvedValue(null);

    await expect(service.detail('t1', 'u1', ['request.read.own'], 'r1', 'w1')).rejects.toThrow(NotFoundException);
  });
});
