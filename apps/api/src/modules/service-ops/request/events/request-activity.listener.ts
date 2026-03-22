import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CommentVisibility, Prisma, RequestActivityType, RequestStatus } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { REQUEST_EVENTS } from './request-events.constants';
import {
  RequestAssignedEvent,
  RequestCommentAddedEvent,
  RequestCreatedEvent,
  RequestEscalatedEvent,
  RequestResolutionReopenedEvent,
  RequestResolutionSubmittedEvent,
  RequestStatusChangedEvent,
  RequestWorkLogAddedEvent,
  SlaBreachedEvent,
} from './request.events';

@Injectable()
export class RequestActivityListener {
  private readonly logger = new Logger(RequestActivityListener.name);

  constructor(private readonly prisma: PrismaService) {}

  @OnEvent(REQUEST_EVENTS.CREATED, { async: true })
  async onRequestCreated(event: RequestCreatedEvent): Promise<void> {
    await this.prisma.requestActivity.create({
      data: {
        tenantId: event.tenantId,
        requestId: event.requestId,
        type: RequestActivityType.REQUEST_CREATED,
        title: 'Request created',
        description: event.isSubmitted ? 'Request created and submitted' : 'Request saved as draft',
        actorId: event.createdBy,
      },
    });
  }

  @OnEvent(REQUEST_EVENTS.ASSIGNED, { async: true })
  async onRequestAssigned(event: RequestAssignedEvent): Promise<void> {
    const isAssigned = event.assigneeId !== null;
    const type = event.previousAssigneeId ? RequestActivityType.REASSIGNED : RequestActivityType.ASSIGNED;
    const title = isAssigned
      ? event.previousAssigneeId
        ? 'Request reassigned'
        : 'Request assigned'
      : 'Request unassigned';
    const description = isAssigned
      ? event.previousAssigneeId
        ? `Assignee updated from ${event.previousAssigneeId} to ${event.assigneeId}`
        : `Assigned to ${event.assigneeId}`
      : `Assignee removed from ${event.previousAssigneeId}`;

    await this.prisma.requestActivity.create({
      data: {
        tenantId: event.tenantId,
        requestId: event.requestId,
        type,
        title,
        description,
        actorId: event.assignedBy,
        metadata: this.toJson({
          fromAssigneeId: event.previousAssigneeId,
          toAssigneeId: event.assigneeId,
        }),
      },
    });
  }

  @OnEvent(REQUEST_EVENTS.STATUS_CHANGED, { async: true })
  async onStatusChanged(event: RequestStatusChangedEvent): Promise<void> {
    await this.prisma.requestActivity.create({
      data: {
        tenantId: event.tenantId,
        requestId: event.requestId,
        type: RequestActivityType.STATUS_CHANGED,
        title: event.title ?? `Status changed: ${event.fromStatus} -> ${event.toStatus}`,
        description: event.description ?? 'Request status was updated',
        actorId: event.changedBy,
        metadata: this.toJson({
          from: event.fromStatus,
          to: event.toStatus,
          ...(event.metadata ?? {}),
        }),
      },
    });
  }

  @OnEvent(REQUEST_EVENTS.COMMENT_ADDED, { async: true })
  async onCommentAdded(event: RequestCommentAddedEvent): Promise<void> {
    await this.prisma.requestActivity.create({
      data: {
        tenantId: event.tenantId,
        requestId: event.requestId,
        type:
          event.visibility === CommentVisibility.INTERNAL
            ? RequestActivityType.INTERNAL_NOTE_ADDED
            : RequestActivityType.COMMENT_ADDED,
        title: event.visibility === CommentVisibility.INTERNAL ? 'Internal note added' : 'Comment added',
        description: event.body,
        actorId: event.actorId,
        metadata: this.toJson({
          commentId: event.commentId,
          visibility: event.visibility,
        }),
      },
    });
  }

  @OnEvent(REQUEST_EVENTS.WORK_LOG_ADDED, { async: true })
  async onWorkLogAdded(event: RequestWorkLogAddedEvent): Promise<void> {
    await this.prisma.requestActivity.create({
      data: {
        tenantId: event.tenantId,
        requestId: event.requestId,
        type: RequestActivityType.COMMENT_ADDED,
        title: 'Work log added',
        description: event.content,
        actorId: event.actorId,
        metadata: this.toJson({
          workLogId: event.workLogId,
          minutesSpent: event.minutesSpent,
        }),
      },
    });
  }

  @OnEvent(REQUEST_EVENTS.RESOLUTION_SUBMITTED, { async: true })
  async onResolutionSubmitted(event: RequestResolutionSubmittedEvent): Promise<void> {
    await this.prisma.requestActivity.create({
      data: {
        tenantId: event.tenantId,
        requestId: event.requestId,
        type: RequestActivityType.RESOLUTION_SUBMITTED,
        title: event.closeImmediately ? 'Resolution confirmed and request closed' : 'Resolution confirmed',
        description: event.summary,
        actorId: event.actorId,
        metadata: this.toJson({
          summary: event.summary,
          notes: event.notes,
          closeImmediately: event.closeImmediately,
        }),
      },
    });
  }

  @OnEvent(REQUEST_EVENTS.RESOLUTION_REOPENED, { async: true })
  async onResolutionReopened(event: RequestResolutionReopenedEvent): Promise<void> {
    await this.prisma.requestActivity.create({
      data: {
        tenantId: event.tenantId,
        requestId: event.requestId,
        type: RequestActivityType.STATUS_CHANGED,
        title: 'Resolution reopened',
        description: event.reason,
        actorId: event.actorId,
        metadata: this.toJson({
          reason: event.reason,
        }),
      },
    });
  }

  @OnEvent(REQUEST_EVENTS.SLA_BREACHED, { async: true })
  async onSlaBreached(event: SlaBreachedEvent): Promise<void> {
    await this.prisma.requestActivity.create({
      data: {
        tenantId: event.tenantId,
        requestId: event.requestId,
        type: RequestActivityType.SLA_BREACHED,
        title: 'SLA breached',
        description: event.reason ?? `${event.slaType} SLA breached`,
        actorId: event.actorId,
        metadata: this.toJson({
          slaType: event.slaType,
          isAuto: event.isAuto,
          reason: event.reason,
        }),
      },
    });
  }

  @OnEvent(REQUEST_EVENTS.ESCALATED, { async: true })
  async onEscalated(event: RequestEscalatedEvent): Promise<void> {
    await this.prisma.requestActivity.create({
      data: {
        tenantId: event.tenantId,
        requestId: event.requestId,
        type: RequestActivityType.SLA_BREACHED,
        title: 'Request escalated',
        description: event.reason ?? 'Escalated by operator',
        actorId: event.actorId,
        metadata: this.toJson({
          isAuto: event.isAuto,
          reason: event.reason,
          escalatedAt: event.escalatedAt.toISOString(),
          nextStatus: RequestStatus.WAITING_EXTERNAL_VENDOR,
        }),
      },
    });
  }

  private toJson(data: Record<string, unknown>): Prisma.InputJsonValue {
    return data as Prisma.InputJsonValue;
  }
}
