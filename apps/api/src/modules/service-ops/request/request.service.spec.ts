import { EventEmitter2 } from '@nestjs/event-emitter';
import { RequestStatus } from '@prisma/client';
import { ConflictException } from '../../../common/exceptions/conflict.exception';
import { PrismaService } from '../../../prisma/prisma.service';
import { RequestService } from './request.service';

describe('RequestService', () => {
  let service: RequestService;
  let prisma: any;
  let emitter: any;

  beforeEach(() => {
    prisma = {
      serviceRequest: { findMany: jest.fn(), count: jest.fn() },
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

    service = new RequestService(prisma as unknown as PrismaService, emitter as unknown as EventEmitter2);
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
});
