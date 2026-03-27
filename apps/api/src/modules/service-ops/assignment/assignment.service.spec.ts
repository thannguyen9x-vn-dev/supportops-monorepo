import { PrismaService } from '../../../prisma/prisma.service';
import { AssignmentService } from './assignment.service';

describe('AssignmentService', () => {
  let service: AssignmentService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      assignmentHistory: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    prisma.$transaction.mockImplementation((queries: unknown[]) => Promise.all(queries as Promise<unknown>[]));

    service = new AssignmentService(prisma as unknown as PrismaService);
  });

  it('list returns paginated assignment history', async () => {
    const changedAt = new Date('2026-01-01T00:00:00.000Z');
    prisma.assignmentHistory.findMany.mockResolvedValue([
      {
        id: 'ah1',
        tenantId: 't1',
        requestId: 'r1',
        fromAssigneeId: null,
        toAssigneeId: 'u2',
        changedById: 'u1',
        reason: null,
        changedAt,
      },
    ]);
    prisma.assignmentHistory.count.mockResolvedValue(1);

    const result = await service.list('t1', { page: 1, size: 20 });

    expect(prisma.assignmentHistory.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { tenantId: 't1' } }));
    expect(result.data[0]?.id).toBe('ah1');
    expect(result.meta.total).toBe(1);
  });

  it('list applies optional filters', async () => {
    prisma.assignmentHistory.findMany.mockResolvedValue([]);
    prisma.assignmentHistory.count.mockResolvedValue(0);

    await service.list('t1', { page: 1, size: 10, requestId: 'r1', assigneeId: 'u2', changedById: 'u3' });

    expect(prisma.assignmentHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          tenantId: 't1',
          requestId: 'r1',
          toAssigneeId: 'u2',
          changedById: 'u3',
        },
      }),
    );
  });
});
