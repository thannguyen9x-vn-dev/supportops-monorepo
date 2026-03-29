import { NotificationEventType } from '@prisma/client';
import { NotFoundException } from '../../common/exceptions/not-found.exception';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      notification: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        create: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    prisma.$transaction.mockImplementation((queries: unknown[]) => Promise.all(queries as Promise<unknown>[]));
    service = new NotificationService(prisma as unknown as PrismaService);
  });

  it('findAll returns notifications scoped by tenant and user', async () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    prisma.notification.findMany.mockResolvedValue([
      {
        id: 'n1',
        tenantId: 't1',
        userId: 'u1',
        type: NotificationEventType.REQUEST_ASSIGNED,
        title: 'Assigned',
        body: 'Assigned to you',
        requestId: null,
        actorId: null,
        metadata: null,
        isRead: false,
        readAt: null,
        createdAt: now,
      },
    ]);
    prisma.notification.count.mockResolvedValue(1);

    const result = await service.findAll('t1', 'u1', { page: 1, size: 20 });

    expect(prisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 't1', userId: 'u1' },
      }),
    );
    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it('findAll applies unread filter', async () => {
    prisma.notification.findMany.mockResolvedValue([]);
    prisma.notification.count.mockResolvedValue(0);

    await service.findAll('t1', 'u1', { page: 1, size: 20, unread: true });

    expect(prisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 't1', userId: 'u1', isRead: false },
      }),
    );
  });

  it('findAll applies pagination', async () => {
    prisma.notification.findMany.mockResolvedValue([]);
    prisma.notification.count.mockResolvedValue(0);

    await service.findAll('t1', 'u1', { page: 2, size: 5 });

    expect(prisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 5,
        take: 5,
      }),
    );
  });

  it('markRead throws 404 when notification does not belong to user', async () => {
    prisma.notification.findFirst.mockResolvedValue(null);

    await expect(service.markRead('t1', 'u1', 'n1')).rejects.toThrow(NotFoundException);
  });

  it('markRead throws 404 when notification belongs to another tenant', async () => {
    prisma.notification.findFirst.mockResolvedValue(null);

    await expect(service.markRead('t2', 'u1', 'n1')).rejects.toThrow(NotFoundException);
  });

  it('markAllRead updates only current user notifications', async () => {
    prisma.notification.updateMany.mockResolvedValue({ count: 4 });
    prisma.notification.count.mockResolvedValue(0);

    const result = await service.markAllRead('t1', 'u1');

    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: { tenantId: 't1', userId: 'u1', isRead: false },
      data: expect.objectContaining({ isRead: true }),
    });
    expect(result.count).toBe(4);
  });

  it('getUnreadCount counts unread notifications correctly', async () => {
    prisma.notification.count.mockResolvedValue(7);

    await expect(service.getUnreadCount('t1', 'u1')).resolves.toBe(7);
    expect(prisma.notification.count).toHaveBeenCalledWith({
      where: { tenantId: 't1', userId: 'u1', isRead: false },
    });
  });

  it('createNotification persists expected fields', async () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    prisma.notification.create.mockResolvedValue({
      id: 'n1',
      tenantId: 't1',
      userId: 'u1',
      type: NotificationEventType.REQUEST_CREATED,
      title: 'New request',
      body: 'Request created',
      requestId: 'r1',
      actorId: 'u2',
      metadata: { requestCode: 'SR-1', actorName: 'Jane' },
      isRead: false,
      readAt: null,
      createdAt: now,
    });
    prisma.notification.count.mockResolvedValue(1);

    await service.createNotification({
      tenantId: 't1',
      userId: 'u1',
      type: NotificationEventType.REQUEST_CREATED,
      title: 'New request',
      body: 'Request created',
      requestId: 'r1',
      actorId: 'u2',
      metadata: { requestCode: 'SR-1', actorName: 'Jane' },
    });

    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: {
        tenantId: 't1',
        userId: 'u1',
        type: NotificationEventType.REQUEST_CREATED,
        title: 'New request',
        body: 'Request created',
        requestId: 'r1',
        actorId: 'u2',
        metadata: { requestCode: 'SR-1', actorName: 'Jane' },
      },
    });
  });
});
