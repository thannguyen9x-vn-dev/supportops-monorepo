import { ConflictException } from '../../../common/exceptions/conflict.exception';
import { NotFoundException } from '../../../common/exceptions/not-found.exception';
import { PrismaService } from '../../../prisma/prisma.service';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      serviceType: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
      serviceRequest: { count: jest.fn() },
      slaPolicy: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), deleteMany: jest.fn() },
      workflowTransition: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), deleteMany: jest.fn() },
      $transaction: jest.fn(),
    };
    prisma.$transaction.mockImplementation((queries: unknown[]) => Promise.all(queries as Promise<unknown>[]));

    service = new SettingsService(prisma as unknown as PrismaService);
  });

  it('createServiceType creates normalized code', async () => {
    prisma.serviceType.findFirst.mockResolvedValueOnce(null);
    prisma.serviceType.create.mockResolvedValue({
      id: 'st1', tenantId: 't1', code: 'IT', name: 'IT Support', description: null, isActive: true,
      createdAt: new Date(), updatedAt: new Date(),
    });

    const result = await service.createServiceType('t1', { code: ' it ', name: ' IT Support ' } as any);

    expect(prisma.serviceType.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ code: 'IT' }) }));
    expect(result.code).toBe('IT');
  });

  it('createServiceType throws conflict for duplicated code', async () => {
    prisma.serviceType.findFirst.mockResolvedValue({ id: 'dup' });
    await expect(service.createServiceType('t1', { code: 'IT', name: 'IT' } as any)).rejects.toThrow(ConflictException);
  });

  it('updateServiceType throws not found for missing record', async () => {
    prisma.serviceType.findFirst.mockResolvedValue(null);
    await expect(service.updateServiceType('t1', 'st1', { name: 'new' } as any)).rejects.toThrow(NotFoundException);
  });

  it('deleteServiceType removes service type when no linked requests', async () => {
    prisma.serviceType.findFirst.mockResolvedValue({ id: 'st1', code: 'IT' });
    prisma.serviceRequest.count.mockResolvedValue(0);

    await service.deleteServiceType('t1', 'st1');

    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('createWorkflowTransition validates allowed roles non-empty', async () => {
    prisma.serviceType.findFirst.mockResolvedValue({ id: 'st1' });

    await expect(
      service.createWorkflowTransition('t1', {
        serviceTypeCode: 'it',
        fromStatus: 'SUBMITTED',
        toStatus: 'ASSIGNED',
        allowedRoles: ['   '],
      } as any),
    ).rejects.toThrow(ConflictException);
  });
});
