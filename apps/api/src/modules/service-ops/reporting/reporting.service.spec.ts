import { ForbiddenException } from '../../../common/exceptions/forbidden.exception';
import { PrismaService } from '../../../prisma/prisma.service';
import { ReportingService } from './reporting.service';

describe('ReportingService', () => {
  let service: ReportingService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      membership: {
        findFirst: jest.fn(),
      },
      serviceRequest: {
        count: jest.fn(),
        groupBy: jest.fn(),
        findMany: jest.fn(),
      },
      slaRecord: {
        findMany: jest.fn(),
      },
      serviceType: {
        findMany: jest.fn(),
      },
    };

    prisma.membership.findFirst.mockResolvedValue({ roleCode: 'OPS_COORDINATOR' });
    prisma.serviceRequest.count.mockResolvedValue(10);
    prisma.serviceRequest.groupBy.mockImplementation(({ by }: { by: string[] }) => {
      const key = by[0];
      if (key === 'status') {
        return Promise.resolve([
          { status: 'SUBMITTED', _count: { _all: 4 } },
          { status: 'RESOLVED', _count: { _all: 6 } },
        ]);
      }
      if (key === 'priority') {
        return Promise.resolve([{ priority: 'HIGH', _count: { _all: 10 } }]);
      }

      return Promise.resolve([
        { serviceTypeId: 'st-1', _count: { _all: 8 } },
        { serviceTypeId: 'st-2', _count: { _all: 2 } },
      ]);
    });
    prisma.slaRecord.findMany.mockResolvedValue([
      { isBreached: true },
      { isBreached: false },
      { isBreached: false },
      { isBreached: false },
    ]);
    prisma.serviceType.findMany.mockResolvedValue([
      { id: 'st-1', name: 'IT Support' },
      { id: 'st-2', name: 'Facilities' },
    ]);

    const createdRows = [
      { createdAt: new Date('2026-03-01T02:00:00.000Z') },
      { createdAt: new Date('2026-03-03T02:00:00.000Z') },
    ];
    const resolvedRows = [{ resolvedAt: new Date('2026-03-02T08:00:00.000Z') }];
    const responseRows = [
      {
        submittedAt: new Date('2026-03-01T00:00:00.000Z'),
        assignedAt: new Date('2026-03-01T00:30:00.000Z'),
      },
      {
        submittedAt: new Date('2026-03-02T00:00:00.000Z'),
        assignedAt: new Date('2026-03-02T01:30:00.000Z'),
      },
    ];

    prisma.serviceRequest.findMany
      .mockResolvedValueOnce(createdRows)
      .mockResolvedValueOnce(resolvedRows)
      .mockResolvedValueOnce(responseRows);

    service = new ReportingService(prisma as PrismaService);
  });

  it('EMPLOYEE gets 403', async () => {
    prisma.membership.findFirst.mockResolvedValue({ roleCode: 'EMPLOYEE' });

    await expect(
      service.getOverview('t1', 'emp-1', { from: '2026-03-01', to: '2026-03-03' }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('TECHNICIAN gets 403', async () => {
    prisma.membership.findFirst.mockResolvedValue({ roleCode: 'TECHNICIAN' });

    await expect(
      service.getOverview('t1', 'tech-1', { from: '2026-03-01', to: '2026-03-03' }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('OPS_COORDINATOR gets overview data', async () => {
    const result = await service.getOverview('t1', 'ops-1', { from: '2026-03-01', to: '2026-03-03' });

    expect(result.totalRequests).toBe(10);
    expect(result.byPriority).toEqual([{ priority: 'HIGH', count: 10 }]);
  });

  it('byStatus contains statuses returned in range', async () => {
    const result = await service.getOverview('t1', 'ops-1', { from: '2026-03-01', to: '2026-03-03' });

    expect(result.byStatus).toEqual([
      { status: 'SUBMITTED', count: 4 },
      { status: 'RESOLVED', count: 6 },
    ]);
  });

  it('byServiceType maps to serviceTypeName', async () => {
    const result = await service.getOverview('t1', 'ops-1', { from: '2026-03-01', to: '2026-03-03' });

    expect(result.byServiceType).toEqual([
      { serviceTypeId: 'st-1', serviceTypeName: 'IT Support', count: 8 },
      { serviceTypeId: 'st-2', serviceTypeName: 'Facilities', count: 2 },
    ]);
  });

  it('slaComplianceRate is calculated correctly', async () => {
    const result = await service.getOverview('t1', 'ops-1', { from: '2026-03-01', to: '2026-03-03' });

    expect(result.slaComplianceRate).toBe(75);
  });

  it('volumeTrend includes every date in range with zero-fill', async () => {
    const result = await service.getOverview('t1', 'ops-1', { from: '2026-03-01', to: '2026-03-03' });

    expect(result.volumeTrend).toEqual([
      { date: '2026-03-01', created: 1, resolved: 0 },
      { date: '2026-03-02', created: 0, resolved: 1 },
      { date: '2026-03-03', created: 1, resolved: 0 },
    ]);
  });

  it('assigneeId filter is applied', async () => {
    prisma.serviceRequest.findMany.mockReset();
    prisma.serviceRequest.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    await service.getOverview('t1', 'ops-1', {
      from: '2026-03-01',
      to: '2026-03-03',
      assigneeId: 'u-assignee',
    });

    expect(prisma.serviceRequest.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ assigneeId: 'u-assignee' }),
      }),
    );
    expect(prisma.serviceRequest.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ assigneeId: 'u-assignee' }),
      }),
    );
  });

  it('tenantId isolation is always enforced', async () => {
    prisma.serviceRequest.findMany.mockReset();
    prisma.serviceRequest.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    await service.getOverview('tenant-a', 'ops-1', { from: '2026-03-01', to: '2026-03-03' });

    expect(prisma.serviceRequest.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 'tenant-a' }),
      }),
    );
    expect(prisma.slaRecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 'tenant-a' }),
      }),
    );
    expect(prisma.serviceType.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 'tenant-a' }),
      }),
    );
  });
});
