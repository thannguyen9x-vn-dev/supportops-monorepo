import { Injectable, Logger } from '@nestjs/common';
import { NotificationEventType, SlaType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RequestCommentAddedEvent, RequestCreatedEvent, RequestMentionedEvent, RequestAssignedEvent, RequestStatusChangedEvent, SlaBreachedEvent } from '../service-ops/request/events/request.events';
import { NotificationPreferenceService } from './notification-preference.service';
import { NotificationService } from './notification.service';

@Injectable()
export class NotificationFanoutService {
  private readonly logger = new Logger(NotificationFanoutService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly notificationPreferenceService: NotificationPreferenceService,
  ) {}

  async handleRequestCreated(event: RequestCreatedEvent): Promise<void> {
    const request = await this.getRequestContext(event.tenantId, event.requestId);
    if (!request) {
      return;
    }

    const recipients = request.queueId
      ? await this.findOpsCoordinatorIdsForQueue(event.tenantId, request.queueId)
      : [];
    const fallbackRecipients = recipients.length > 0 ? recipients : await this.findAllOpsCoordinatorIds(event.tenantId);

    await this.notifyRecipients({
      tenantId: event.tenantId,
      recipients: fallbackRecipients,
      eventType: NotificationEventType.REQUEST_CREATED,
      title: 'New request created',
      body: `${request.requestCode ?? request.id} was created`,
      requestId: request.id,
      actorId: event.createdBy,
      requestCode: request.requestCode,
      actorName: await this.resolveActorName(event.tenantId, event.createdBy),
    });
  }

  async handleRequestAssigned(event: RequestAssignedEvent): Promise<void> {
    if (!event.assigneeId) {
      return;
    }

    const request = await this.getRequestContext(event.tenantId, event.requestId);
    if (!request) {
      return;
    }

    const recipients = this.uniqueRecipients([event.assigneeId, request.requesterId]);
    await this.notifyRecipients({
      tenantId: event.tenantId,
      recipients,
      eventType: NotificationEventType.REQUEST_ASSIGNED,
      title: 'Request assigned',
      body: `${request.requestCode ?? request.id} has been assigned`,
      requestId: request.id,
      actorId: event.assignedBy,
      requestCode: request.requestCode,
      actorName: await this.resolveActorName(event.tenantId, event.assignedBy),
    });
  }

  async handleStatusChanged(event: RequestStatusChangedEvent): Promise<void> {
    const request = await this.getRequestContext(event.tenantId, event.requestId);
    if (!request) {
      return;
    }

    const watchers = await this.getWatcherIds(event.tenantId, request.id);
    const recipients = this.uniqueRecipients([request.requesterId, request.assigneeId, ...watchers]);

    await this.notifyRecipients({
      tenantId: event.tenantId,
      recipients,
      eventType: NotificationEventType.REQUEST_STATUS_CHANGED,
      title: 'Request status changed',
      body: `${request.requestCode ?? request.id}: ${event.fromStatus} -> ${event.toStatus}`,
      requestId: request.id,
      actorId: event.changedBy,
      requestCode: request.requestCode,
      actorName: await this.resolveActorName(event.tenantId, event.changedBy),
    });
  }

  async handleCommented(event: RequestCommentAddedEvent): Promise<void> {
    const request = await this.getRequestContext(event.tenantId, event.requestId);
    if (!request) {
      return;
    }

    const watchers = await this.getWatcherIds(event.tenantId, request.id);
    const recipients = this.uniqueRecipients([request.requesterId, request.assigneeId, ...watchers]).filter(
      (id) => id !== event.actorId,
    );

    await this.notifyRecipients({
      tenantId: event.tenantId,
      recipients,
      eventType: NotificationEventType.REQUEST_COMMENTED,
      title: 'New comment on request',
      body: event.body,
      requestId: request.id,
      actorId: event.actorId,
      requestCode: request.requestCode,
      actorName: await this.resolveActorName(event.tenantId, event.actorId),
    });
  }

  async handleMentioned(event: RequestMentionedEvent): Promise<void> {
    if (event.mentionedUserIds.length === 0) {
      return;
    }

    const request = await this.getRequestContext(event.tenantId, event.requestId);
    if (!request) {
      return;
    }

    const recipients = this.uniqueRecipients(event.mentionedUserIds).filter((id) => id !== event.actorId);
    await this.notifyRecipients({
      tenantId: event.tenantId,
      recipients,
      eventType: NotificationEventType.REQUEST_MENTIONED,
      title: 'You were mentioned',
      body: event.body,
      requestId: request.id,
      actorId: event.actorId,
      requestCode: request.requestCode,
      actorName: await this.resolveActorName(event.tenantId, event.actorId),
    });
  }

  async handleSlaBreached(event: SlaBreachedEvent): Promise<void> {
    const request = await this.getRequestContext(event.tenantId, event.requestId);
    if (!request) {
      return;
    }

    const opsCoordinators = await this.findAllOpsCoordinatorIds(event.tenantId);
    const recipients = this.uniqueRecipients([request.assigneeId, ...opsCoordinators]);
    const eventType =
      event.slaType === SlaType.ASSIGNMENT
        ? NotificationEventType.SLA_NEAR_BREACH_RESPONSE
        : NotificationEventType.SLA_NEAR_BREACH_RESOLUTION;

    await this.notifyRecipients({
      tenantId: event.tenantId,
      recipients,
      eventType,
      title: 'SLA warning',
      body: event.reason ?? `${event.slaType} SLA breached`,
      requestId: request.id,
      actorId: event.actorId,
      requestCode: request.requestCode,
      actorName: event.actorId ? await this.resolveActorName(event.tenantId, event.actorId) : null,
    });
  }

  private async notifyRecipients(input: {
    tenantId: string;
    recipients: string[];
    eventType: NotificationEventType;
    title: string;
    body: string;
    requestId: string;
    actorId: string | null;
    requestCode: string | null;
    actorName: string | null;
  }): Promise<void> {
    for (const userId of input.recipients) {
      const pref = await this.notificationPreferenceService.getForUser(input.tenantId, userId, input.eventType);
      if (pref.inApp) {
        await this.notificationService.createNotification({
          tenantId: input.tenantId,
          userId,
          type: input.eventType,
          title: input.title,
          body: input.body,
          requestId: input.requestId,
          actorId: input.actorId,
          metadata: {
            requestCode: input.requestCode,
            actorName: input.actorName,
          },
        });
      }
      if (pref.email) {
        this.enqueueEmailNotification(input.tenantId, userId, input.eventType, input.requestId);
      }
    }
  }

  private enqueueEmailNotification(
    tenantId: string,
    userId: string,
    eventType: NotificationEventType,
    requestId: string,
  ): void {
    this.logger.debug(`enqueueEmailNotification tenant=${tenantId} user=${userId} event=${eventType} request=${requestId}`);
  }

  private async getRequestContext(tenantId: string, requestId: string): Promise<{
    id: string;
    queueId: string | null;
    requesterId: string;
    assigneeId: string | null;
    requestCode: string | null;
  } | null> {
    return this.prisma.serviceRequest.findFirst({
      where: {
        tenantId,
        id: requestId,
      },
      select: {
        id: true,
        queueId: true,
        requesterId: true,
        assigneeId: true,
        requestCode: true,
      },
    });
  }

  private async findAllOpsCoordinatorIds(tenantId: string): Promise<string[]> {
    const memberships = await this.prisma.membership.findMany({
      where: {
        tenantId,
        roleCode: 'OPS_COORDINATOR',
        status: 'ACTIVE',
      },
      select: {
        userId: true,
      },
    });

    return memberships.map((item) => item.userId);
  }

  private async findOpsCoordinatorIdsForQueue(tenantId: string, _queueId: string): Promise<string[]> {
    return this.findAllOpsCoordinatorIds(tenantId);
  }

  private async getWatcherIds(tenantId: string, requestId: string): Promise<string[]> {
    const watchers = await this.prisma.requestWatcher.findMany({
      where: {
        tenantId,
        requestId,
      },
      select: {
        userId: true,
      },
    });
    return watchers.map((item) => item.userId);
  }

  private async resolveActorName(tenantId: string, actorId: string): Promise<string | null> {
    const actor = await this.prisma.user.findFirst({
      where: {
        tenantId,
        id: actorId,
      },
      select: {
        fullName: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    if (!actor) {
      return null;
    }
    const fallbackName = [actor.firstName, actor.lastName].filter(Boolean).join(' ').trim();
    return actor.fullName?.trim() || fallbackName || actor.email;
  }

  private uniqueRecipients(ids: Array<string | null | undefined>): string[] {
    return [...new Set(ids.filter((id): id is string => Boolean(id)))];
  }
}
