import { PrismaService } from '../../../prisma/prisma.service';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      serviceRequest: {
        count: jest.fn(),
        findMany: jest.fn(),
        groupBy: jest.fn(),
      },
      slaRecord: {
        groupBy: jest.fn(),
      },
      requestActivity: {
        findMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    prisma.$transaction.mockImplementation((queries: unknown[]) => Promise.all(queries as Promise<unknown>[]));
    service = new DashboardService(prisma as unknown as PrismaService);
  });

  it('summary returns aggregate KPI payload', async () => {
    prisma.serviceRequest.count
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(3);
    prisma.serviceRequest.findMany.mockResolvedValue([{ createdAt: new Date(), submittedAt: null, resolvedAt: new Date() }]);
    prisma.serviceRequest.groupBy
      .mockResolvedValueOnce([{ status: 'SUBMITTED', _count: { _all: 2 } }])
      .mockResolvedValueOnce([{ priority: 'HIGH', _count: { _all: 1 } }]);
    prisma.slaRecord.groupBy.mockResolvedValue([{ health: 'BREACHED', _count: { _all: 1 } }]);

    const result = await service.summary('t1', 'u1', ['request.read.all']);

    expect(result.scope).toBe('TEAM');
    expect(result.kpis.openRequests).toBe(5);
    expect(result.kpis.slaBreached).toBe(1);
  });

  it('recentActivity maps actor display name with fallback', async () => {
    prisma.requestActivity.findMany.mockResolvedValue([
      {
        id: 'a1',
        requestId: 'r1',
        type: 'STATUS_CHANGED',
        title: 'Changed',
        description: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        actor: { fullName: null, firstName: 'Jane', lastName: 'Doe' },
        request: { id: 'r1', requestCode: 'REQ-1', title: 'Issue' },
      },
    ]);

    const result = await service.recentActivity('t1', 'u1', []);

    expect(result[0]?.actorName).toBe('Jane Doe');
    expect(prisma.requestActivity.findMany).toHaveBeenCalled();
  });

  it('requestTrend returns day-by-day opened/resolved counts', async () => {
    const openedDate = new Date();
    openedDate.setUTCHours(0, 0, 0, 0);
    prisma.serviceRequest.findMany
      .mockResolvedValueOnce([{ createdAt: openedDate }])
      .mockResolvedValueOnce([{ resolvedAt: openedDate }]);

    const result = await service.requestTrend('t1', 'u1', ['request.read.own'], 1);

    expect(result).toHaveLength(2);
    expect(result[result.length - 1]?.opened).toBeGreaterThanOrEqual(0);
    expect(result[result.length - 1]?.resolved).toBeGreaterThanOrEqual(0);
  });
});
