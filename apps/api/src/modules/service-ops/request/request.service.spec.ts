import { EventEmitter2 } from '@nestjs/event-emitter';
import { RequestStatus } from '@prisma/client';
import { ConflictException } from '../../../common/exceptions/conflict.exception';
import { ForbiddenException } from '../../../common/exceptions/forbidden.exception';
import { PrismaService } from '../../../prisma/prisma.service';
import { RequestService } from './request.service';

describe('RequestService', () => {
  let service: RequestService;
  let prisma: any;
  let emitter: any;
  let slaService: any;

  beforeEach(() => {
    prisma = {
      serviceRequest: { findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn() },
      requestWatcher: { upsert: jest.fn(), deleteMany: jest.fn(), findMany: jest.fn() },
      membership: { findMany: jest.fn(), findFirst: jest.fn() },
      $transaction: jest.fn(),
    };
    prisma.$transaction.mockImplementation((arg: unknown) => {
      if (typeof arg === 'function') {
        return arg({
          serviceRequest: { create: jest.fn(), update: jest.fn() },
          requestActivity: { create: jest.fn() },
          slaRecord: { createMany: jest.fn() },
          auditLog: { create: jest.fn() },
          assignmentHistory: { create: jest.fn() },
        });
      }

      return Promise.all(arg as Promise<unknown>[]);
    });

    emitter = { emitAsync: jest.fn().mockResolvedValue(undefined) };
    slaService = {
      pauseSla: jest.fn().mockResolvedValue(undefined),
      resumeSla: jest.fn().mockResolvedValue(undefined),
    };

    service = new RequestService(
      prisma as unknown as PrismaService,
      emitter as unknown as EventEmitter2,
      slaService,
    );
  });

  it('list returns paginated mapped data', async () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    prisma.serviceRequest.findMany.mockResolvedValue([
      {
        id: 'r1',
        tenantId: 't1',
        requestCode: 'REQ-1',
        title: 'Issue',
        description: 'desc',
        serviceTypeId: 'st1',
        status: RequestStatus.SUBMITTED,
        priority: 'MEDIUM',
        impactLevel: 'MEDIUM',
        urgency: 'MEDIUM',
        locationId: 'loc1',
        assetId: null,
        requesterId: 'u1',
        assigneeId: null,
        queueId: null,
        sourceChannel: 'WEB',
        isInternalOnly: false,
        submittedAt: null,
        assignedAt: null,
        startedAt: null,
        resolvedAt: null,
        closedAt: null,
        createdAt: now,
        updatedAt: now,
        serviceType: { code: 'IT', name: 'IT Support' },
        queue: null,
        slaRecords: [],
      },
    ]);
    prisma.serviceRequest.count.mockResolvedValue(1);

    const result = await service.list('t1', 'u1', ['request.read.all'], { page: 1, size: 20 } as any);

    expect(result.meta.total).toBe(1);
    expect(result.data[0]?.id).toBe('r1');
  });

  it('create throws conflict when service type cannot be resolved', async () => {
    jest.spyOn(service as any, 'resolveServiceTypeId').mockResolvedValue(null);

    await expect(
      service.create('t1', 'u1', { title: 'Title', description: 'Desc', mode: 'SUBMIT' } as any),
    ).rejects.toThrow(ConflictException);
  });

  it('listAssignees returns normalized names', async () => {
    prisma.membership.findMany.mockResolvedValue([
      {
        userId: 'u2',
        roleCode: 'TECHNICIAN',
        user: {
          email: 'tech@example.com',
          fullName: null,
          firstName: 'Tech',
          lastName: 'One',
          avatarUrl: null,
        },
      },
    ]);

    const result = await service.listAssignees('t1');

    expect(result).toHaveLength(1);
    expect(result[0]?.fullName).toBe('Tech One');
  });

  it('updateStatus throws conflict for same status', async () => {
    jest.spyOn(service as any, 'findRequestById').mockResolvedValue({
      id: 'r1', status: RequestStatus.SUBMITTED,
    });
    prisma.membership.findFirst.mockResolvedValue({ roleCode: 'TENANT_ADMIN' });

    await expect(
      service.updateStatus('t1', 'u1', ['request.read.all'], 'r1', { status: RequestStatus.SUBMITTED }),
    ).rejects.toThrow(ConflictException);
  });

  it('watchRequest creates RequestWatcher row', async () => {
    prisma.serviceRequest.findFirst.mockResolvedValue({ id: 'r1', requesterId: 'u2' });
    jest.spyOn(service as any, 'resolveActiveRoleCode').mockResolvedValue('OPS_COORDINATOR');

    const result = await service.watchRequest('t1', 'u1', 'r1');

    expect(prisma.requestWatcher.upsert).toHaveBeenCalledWith({
      where: { requestId_userId: { requestId: 'r1', userId: 'u1' } },
      create: { tenantId: 't1', requestId: 'r1', userId: 'u1', autoWatch: false },
      update: {},
    });
    expect(result).toEqual({ requestId: 'r1', userId: 'u1', watching: true });
  });

  it('watchRequest is idempotent', async () => {
    prisma.serviceRequest.findFirst.mockResolvedValue({ id: 'r1', requesterId: 'u2' });
    jest.spyOn(service as any, 'resolveActiveRoleCode').mockResolvedValue('OPS_COORDINATOR');

    await service.watchRequest('t1', 'u1', 'r1');
    await service.watchRequest('t1', 'u1', 'r1');

    expect(prisma.requestWatcher.upsert).toHaveBeenCalledTimes(2);
  });

  it('unwatchRequest deletes watcher row', async () => {
    prisma.serviceRequest.findFirst.mockResolvedValue({ id: 'r1', requesterId: 'u2' });
    prisma.requestWatcher.deleteMany.mockResolvedValue({ count: 1 });
    jest.spyOn(service as any, 'resolveActiveRoleCode').mockResolvedValue('OPS_COORDINATOR');

    const result = await service.unwatchRequest('t1', 'u1', 'r1');

    expect(prisma.requestWatcher.deleteMany).toHaveBeenCalledWith({
      where: { tenantId: 't1', requestId: 'r1', userId: 'u1' },
    });
    expect(result).toEqual({ requestId: 'r1', userId: 'u1', watching: false });
  });

  it('autoWatch sets autoWatch=true', async () => {
    await service.autoWatch('t1', 'u2', 'r1', true);

    expect(prisma.requestWatcher.upsert).toHaveBeenCalledWith({
      where: { requestId_userId: { requestId: 'r1', userId: 'u2' } },
      create: { tenantId: 't1', requestId: 'r1', userId: 'u2', autoWatch: true },
      update: { autoWatch: true },
    });
  });

  it('EMPLOYEE cannot watch requests of other users', async () => {
    prisma.serviceRequest.findFirst.mockResolvedValue({ id: 'r1', requesterId: 'owner' });
    jest.spyOn(service as any, 'resolveActiveRoleCode').mockResolvedValue('EMPLOYEE');

    await expect(service.watchRequest('t1', 'employee', 'r1')).rejects.toThrow(ForbiddenException);
  });

  it('watchRequest enforces tenant isolation', async () => {
    prisma.serviceRequest.findFirst.mockResolvedValue({ id: 'r1', requesterId: 'u1' });
    jest.spyOn(service as any, 'resolveActiveRoleCode').mockResolvedValue('OPS_COORDINATOR');

    await service.watchRequest('tenant-2', 'u1', 'r1');

    expect(prisma.serviceRequest.findFirst).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-2', id: 'r1' },
      select: { id: true, requesterId: true },
    });
    expect(prisma.requestWatcher.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ tenantId: 'tenant-2' }),
      }),
    );
  });

  it('updateStatus -> WAITING_FOR_CUSTOMER calls pauseSla', async () => {
    const now = new Date('2026-03-01T00:00:00.000Z');
    const updatedRequest = {
      id: 'r1',
      tenantId: 't1',
      requestCode: 'REQ-1',
      title: 'Issue',
      description: 'desc',
      serviceTypeId: 'st1',
      status: RequestStatus.WAITING_FOR_CUSTOMER,
      priority: 'MEDIUM',
      impactLevel: 'MEDIUM',
      urgency: 'MEDIUM',
      locationId: 'loc1',
      assetId: null,
      requesterId: 'u1',
      assigneeId: null,
      queueId: null,
      sourceChannel: 'WEB',
      isInternalOnly: false,
      submittedAt: now,
      assignedAt: now,
      startedAt: now,
      resolvedAt: null,
      closedAt: null,
      createdAt: now,
      updatedAt: now,
      serviceType: { code: 'IT', name: 'IT Support' },
      queue: null,
      slaRecords: [],
    };
    jest.spyOn(service as any, 'findRequestById').mockResolvedValue({
      id: 'r1',
      status: RequestStatus.IN_PROGRESS,
      submittedAt: now,
      assignedAt: now,
      startedAt: now,
      resolvedAt: null,
      closedAt: null,
    });
    jest.spyOn(service as any, 'isStatusTransitionAllowed').mockReturnValue(true);
    jest.spyOn(service as any, 'canTransitionStatus').mockReturnValue(true);
    prisma.membership.findFirst.mockResolvedValue({ roleCode: 'TENANT_ADMIN' });
    prisma.$transaction.mockImplementation(async (arg: unknown) => {
      if (typeof arg === 'function') {
        return arg({
          serviceRequest: { update: jest.fn().mockResolvedValue(updatedRequest) },
          auditLog: { create: jest.fn().mockResolvedValue(undefined) },
        });
      }
      return Promise.all(arg as Promise<unknown>[]);
    });

    await service.updateStatus('t1', 'u1', ['request.resolve'], 'r1', { status: RequestStatus.WAITING_FOR_CUSTOMER });

    expect(slaService.pauseSla).toHaveBeenCalledWith('t1', 'r1');
    expect(slaService.resumeSla).not.toHaveBeenCalled();
  });

  it('updateStatus leaving WAITING_FOR_CUSTOMER calls resumeSla', async () => {
    const now = new Date('2026-03-01T00:00:00.000Z');
    const updatedRequest = {
      id: 'r1',
      tenantId: 't1',
      requestCode: 'REQ-1',
      title: 'Issue',
      description: 'desc',
      serviceTypeId: 'st1',
      status: RequestStatus.IN_PROGRESS,
      priority: 'MEDIUM',
      impactLevel: 'MEDIUM',
      urgency: 'MEDIUM',
      locationId: 'loc1',
      assetId: null,
      requesterId: 'u1',
      assigneeId: null,
      queueId: null,
      sourceChannel: 'WEB',
      isInternalOnly: false,
      submittedAt: now,
      assignedAt: now,
      startedAt: now,
      resolvedAt: null,
      closedAt: null,
      createdAt: now,
      updatedAt: now,
      serviceType: { code: 'IT', name: 'IT Support' },
      queue: null,
      slaRecords: [],
    };
    jest.spyOn(service as any, 'findRequestById').mockResolvedValue({
      id: 'r1',
      status: RequestStatus.WAITING_FOR_CUSTOMER,
      submittedAt: now,
      assignedAt: now,
      startedAt: now,
      resolvedAt: null,
      closedAt: null,
    });
    jest.spyOn(service as any, 'isStatusTransitionAllowed').mockReturnValue(true);
    jest.spyOn(service as any, 'canTransitionStatus').mockReturnValue(true);
    prisma.membership.findFirst.mockResolvedValue({ roleCode: 'TENANT_ADMIN' });
    prisma.$transaction.mockImplementation(async (arg: unknown) => {
      if (typeof arg === 'function') {
        return arg({
          serviceRequest: { update: jest.fn().mockResolvedValue(updatedRequest) },
          auditLog: { create: jest.fn().mockResolvedValue(undefined) },
        });
      }
      return Promise.all(arg as Promise<unknown>[]);
    });

    await service.updateStatus('t1', 'u1', ['request.start_work'], 'r1', { status: RequestStatus.IN_PROGRESS });

    expect(slaService.resumeSla).toHaveBeenCalledWith('t1', 'r1');
    expect(slaService.pauseSla).not.toHaveBeenCalled();
  });
});
