import { CommentVisibility, RequestStatus, SlaType } from '@prisma/client';

export class RequestCreatedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly requestId: string,
    public readonly createdBy: string,
    public readonly isSubmitted: boolean,
  ) {}
}

export class RequestAssignedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly requestId: string,
    public readonly assigneeId: string | null,
    public readonly assignedBy: string,
    public readonly previousAssigneeId: string | null,
  ) {}
}

export class RequestStatusChangedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly requestId: string,
    public readonly fromStatus: RequestStatus,
    public readonly toStatus: RequestStatus,
    public readonly changedBy: string,
    public readonly description?: string,
    public readonly title?: string,
    public readonly metadata?: Record<string, unknown>,
  ) {}
}

export class RequestCommentAddedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly requestId: string,
    public readonly actorId: string,
    public readonly body: string,
    public readonly visibility: CommentVisibility,
    public readonly commentId: string,
  ) {}
}

export class RequestWorkLogAddedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly requestId: string,
    public readonly actorId: string,
    public readonly content: string,
    public readonly workLogId: string,
    public readonly minutesSpent: number | null,
  ) {}
}

export class RequestResolutionSubmittedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly requestId: string,
    public readonly actorId: string,
    public readonly summary: string,
    public readonly notes: string | null,
    public readonly closeImmediately: boolean,
  ) {}
}

export class RequestResolutionReopenedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly requestId: string,
    public readonly actorId: string,
    public readonly reason: string,
  ) {}
}

export class SlaBreachedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly requestId: string,
    public readonly slaType: SlaType,
    public readonly actorId: string | null,
    public readonly reason: string | null,
    public readonly isAuto: boolean,
  ) {}
}

export class RequestEscalatedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly requestId: string,
    public readonly escalatedAt: Date,
    public readonly actorId: string | null,
    public readonly reason: string | null,
    public readonly isAuto: boolean,
  ) {}
}
