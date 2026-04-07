import { NotificationEventType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationPreferenceService } from './notification-preference.service';

describe('NotificationPreferenceService', () => {
  let service: NotificationPreferenceService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      notificationPreference: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        upsert: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    prisma.$transaction.mockImplementation((queries: unknown[]) => Promise.all(queries as Promise<unknown>[]));
    service = new NotificationPreferenceService(prisma as unknown as PrismaService);
  });

  it('getPreferences returns all 7 event types when user has no rows', async () => {
    prisma.notificationPreference.findMany.mockResolvedValue([]);

    const result = await service.getPreferences('t1', 'u1');

    expect(result).toHaveLength(7);
    expect(result.every((item) => item.inApp === true && item.email === true)).toBe(true);
  });

  it('getPreferences merges existing rows with defaults', async () => {
    prisma.notificationPreference.findMany.mockResolvedValue([
      { eventType: NotificationEventType.REQUEST_ASSIGNED, inApp: false, email: true },
      { eventType: NotificationEventType.REQUEST_MENTIONED, inApp: true, email: false },
    ]);

    const result = await service.getPreferences('t1', 'u1');

    const assigned = result.find((item) => item.eventType === NotificationEventType.REQUEST_ASSIGNED);
    const mentioned = result.find((item) => item.eventType === NotificationEventType.REQUEST_MENTIONED);
    const created = result.find((item) => item.eventType === NotificationEventType.REQUEST_CREATED);

    expect(assigned).toEqual({ eventType: NotificationEventType.REQUEST_ASSIGNED, inApp: false, email: true });
    expect(mentioned).toEqual({ eventType: NotificationEventType.REQUEST_MENTIONED, inApp: true, email: false });
    expect(created).toEqual({ eventType: NotificationEventType.REQUEST_CREATED, inApp: true, email: true });
  });

  it('getForUser returns defaults when no preference exists', async () => {
    prisma.notificationPreference.findFirst.mockResolvedValue(null);

    const result = await service.getForUser('t1', 'u1', NotificationEventType.REQUEST_ASSIGNED);

    expect(prisma.notificationPreference.findFirst).toHaveBeenCalledWith({
      where: {
        tenantId: 't1',
        userId: 'u1',
        eventType: NotificationEventType.REQUEST_ASSIGNED,
      },
      select: { eventType: true, inApp: true, email: true },
    });
    expect(result).toEqual({
      eventType: NotificationEventType.REQUEST_ASSIGNED,
      inApp: true,
      email: true,
    });
  });

  it('upsertPreferences updates existing rows', async () => {
    prisma.notificationPreference.upsert.mockResolvedValue({});
    prisma.notificationPreference.findMany.mockResolvedValue([]);

    await service.upsertPreferences('t1', 'u1', {
      preferences: [
        {
          eventType: NotificationEventType.REQUEST_STATUS_CHANGED,
          inApp: false,
          email: true,
        },
      ],
    });

    expect(prisma.notificationPreference.upsert).toHaveBeenCalledWith({
      where: {
        userId_eventType: {
          userId: 'u1',
          eventType: NotificationEventType.REQUEST_STATUS_CHANGED,
        },
      },
      create: {
        tenantId: 't1',
        userId: 'u1',
        eventType: NotificationEventType.REQUEST_STATUS_CHANGED,
        inApp: false,
        email: true,
      },
      update: {
        inApp: false,
        email: true,
      },
    });
  });

  it('upsertPreferences creates rows when missing', async () => {
    prisma.notificationPreference.upsert.mockResolvedValue({});
    prisma.notificationPreference.findMany.mockResolvedValue([]);

    await service.upsertPreferences('t1', 'u1', {
      preferences: [
        {
          eventType: NotificationEventType.REQUEST_CREATED,
          inApp: true,
          email: false,
        },
      ],
    });

    expect(prisma.notificationPreference.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          tenantId: 't1',
          userId: 'u1',
          eventType: NotificationEventType.REQUEST_CREATED,
          inApp: true,
          email: false,
        }),
      }),
    );
  });

  it('applies tenantId isolation on reads and writes', async () => {
    prisma.notificationPreference.findMany.mockResolvedValue([]);
    prisma.notificationPreference.upsert.mockResolvedValue({});

    await service.getPreferences('tenant-2', 'u1');
    await service.upsertPreferences('tenant-2', 'u1', {
      preferences: [
        {
          eventType: NotificationEventType.REQUEST_ASSIGNED,
          inApp: true,
          email: true,
        },
      ],
    });

    expect(prisma.notificationPreference.findMany).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-2', userId: 'u1' },
      select: { eventType: true, inApp: true, email: true },
    });
    expect(prisma.notificationPreference.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ tenantId: 'tenant-2' }),
      }),
    );
  });
});
