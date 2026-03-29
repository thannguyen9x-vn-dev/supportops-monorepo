import { NotificationEventType, SlaType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  RequestAssignedEvent,
  RequestCommentAddedEvent,
  RequestCreatedEvent,
  SlaBreachedEvent,
} from '../service-ops/request/events/request.events';
import { NotificationPreferenceService } from './notification-preference.service';
import { NotificationFanoutService } from './notification-fanout.service';
import { NotificationService } from './notification.service';

describe('NotificationFanoutService', () => {
  let service: NotificationFanoutService;
  let prisma: any;
  let notificationService: { createNotification: jest.Mock };
  let notificationPreferenceService: { getForUser: jest.Mock };

  beforeEach(() => {
    prisma = {
      serviceRequest: {
        findFirst: jest.fn(),
      },
      membership: {
        findMany: jest.fn(),
      },
      requestWatcher: {
        findMany: jest.fn(),
      },
      user: {
        findFirst: jest.fn(),
      },
    };

    notificationService = {
      createNotification: jest.fn().mockResolvedValue({ id: 'n1' }),
    };

    notificationPreferenceService = {
      getForUser: jest.fn().mockResolvedValue({ inApp: true, email: true }),
    };

    prisma.user.findFirst.mockResolvedValue({
      fullName: 'Agent One',
      firstName: 'Agent',
      lastName: 'One',
      email: 'agent@example.com',
    });

    service = new NotificationFanoutService(
      prisma as unknown as PrismaService,
      notificationService as unknown as NotificationService,
      notificationPreferenceService as unknown as NotificationPreferenceService,
    );
  });

  it('handleRequestAssigned notifies both assignee and creator', async () => {
    prisma.serviceRequest.findFirst.mockResolvedValue({
      id: 'r1',
      queueId: null,
      requesterId: 'creator-1',
      assigneeId: 'assignee-1',
      requestCode: 'SR-001',
    });

    await service.handleRequestAssigned(new RequestAssignedEvent('t1', 'r1', 'assignee-1', 'actor-1', null));

    expect(notificationService.createNotification).toHaveBeenCalledTimes(2);
    const recipientIds = notificationService.createNotification.mock.calls.map((call) => call[0].userId).sort();
    expect(recipientIds).toEqual(['assignee-1', 'creator-1']);
  });

  it('handleRequestAssigned skips email enqueue when email preference is false', async () => {
    prisma.serviceRequest.findFirst.mockResolvedValue({
      id: 'r1',
      queueId: null,
      requesterId: 'creator-1',
      assigneeId: 'assignee-1',
      requestCode: 'SR-001',
    });
    notificationPreferenceService.getForUser.mockResolvedValue({ inApp: false, email: false });
    const enqueueSpy = jest.spyOn(service as any, 'enqueueEmailNotification');

    await service.handleRequestAssigned(new RequestAssignedEvent('t1', 'r1', 'assignee-1', 'actor-1', null));

    expect(enqueueSpy).not.toHaveBeenCalled();
    expect(notificationService.createNotification).not.toHaveBeenCalled();
  });

  it('handleCommented excludes commenter from recipients', async () => {
    prisma.serviceRequest.findFirst.mockResolvedValue({
      id: 'r1',
      queueId: null,
      requesterId: 'commenter-1',
      assigneeId: 'assignee-1',
      requestCode: 'SR-001',
    });
    prisma.requestWatcher.findMany.mockResolvedValue([
      { userId: 'commenter-1' },
      { userId: 'watcher-1' },
    ]);

    await service.handleCommented(
      new RequestCommentAddedEvent('t1', 'r1', 'commenter-1', 'A new comment', 'PUBLIC' as any, 'c1'),
    );

    const recipientIds = notificationService.createNotification.mock.calls.map((call) => call[0].userId).sort();
    expect(recipientIds).toEqual(['assignee-1', 'watcher-1']);
  });

  it('handleRequestCreated sends notifications to queue recipients when queueId exists', async () => {
    prisma.serviceRequest.findFirst.mockResolvedValue({
      id: 'r1',
      queueId: 'q1',
      requesterId: 'creator-1',
      assigneeId: null,
      requestCode: 'SR-001',
    });
    prisma.membership.findMany.mockResolvedValue([{ userId: 'ops-1' }, { userId: 'ops-2' }]);

    await service.handleRequestCreated(new RequestCreatedEvent('t1', 'r1', 'creator-1', true));

    expect(notificationService.createNotification).toHaveBeenCalledTimes(2);
    const recipientIds = notificationService.createNotification.mock.calls.map((call) => call[0].userId).sort();
    expect(recipientIds).toEqual(['ops-1', 'ops-2']);
  });

  it('handleRequestCreated falls back to OPS_COORDINATOR list when queueId is missing', async () => {
    prisma.serviceRequest.findFirst.mockResolvedValue({
      id: 'r1',
      queueId: null,
      requesterId: 'creator-1',
      assigneeId: null,
      requestCode: 'SR-001',
    });
    prisma.membership.findMany.mockResolvedValue([{ userId: 'ops-3' }, { userId: 'ops-4' }]);

    await service.handleRequestCreated(new RequestCreatedEvent('t1', 'r1', 'creator-1', true));

    const recipientIds = notificationService.createNotification.mock.calls.map((call) => call[0].userId).sort();
    expect(recipientIds).toEqual(['ops-3', 'ops-4']);
  });

  it('handleSlaBreached notifies assignee and OPS_COORDINATOR users', async () => {
    prisma.serviceRequest.findFirst.mockResolvedValue({
      id: 'r1',
      queueId: null,
      requesterId: 'creator-1',
      assigneeId: 'assignee-1',
      requestCode: 'SR-001',
    });
    prisma.membership.findMany.mockResolvedValue([{ userId: 'ops-1' }, { userId: 'assignee-1' }]);

    await service.handleSlaBreached(new SlaBreachedEvent('t1', 'r1', SlaType.RESOLUTION, null, 'near breach', true));

    const events = notificationService.createNotification.mock.calls.map((call) => call[0].type);
    expect(events.every((type) => type === NotificationEventType.SLA_NEAR_BREACH_RESOLUTION)).toBe(true);

    const recipientIds = notificationService.createNotification.mock.calls.map((call) => call[0].userId).sort();
    expect(recipientIds).toEqual(['assignee-1', 'ops-1']);
  });
});
