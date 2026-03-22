import { ApiProperty } from '@nestjs/swagger';
import { AssignmentHistory, CommentVisibility, RequestActivity, RequestAttachment, RequestStatus, SlaHealth, SlaRecord, SlaType, User } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { RequestCommentResponseDto } from './request-comment-response.dto';
import { RequestResponseDto } from './request-response.dto';
import { RequestWorkLogResponseDto } from './request-work-log-response.dto';

export class RequestWorkflowAssignmentHistoryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  requestId!: string;

  @ApiProperty({ nullable: true })
  fromAssigneeId!: string | null;

  @ApiProperty({ nullable: true })
  toAssigneeId!: string | null;

  @ApiProperty()
  changedById!: string;

  @ApiProperty({ nullable: true })
  reason!: string | null;

  @ApiProperty()
  changedAt!: string;

  static from(model: AssignmentHistory): RequestWorkflowAssignmentHistoryDto {
    return {
      id: model.id,
      tenantId: model.tenantId,
      requestId: model.requestId,
      fromAssigneeId: model.fromAssigneeId,
      toAssigneeId: model.toAssigneeId,
      changedById: model.changedById,
      reason: model.reason,
      changedAt: model.changedAt.toISOString(),
    };
  }
}

export class RequestWorkflowSlaRecordDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  requestId!: string;

  @ApiProperty({ enum: SlaType })
  type!: SlaType;

  @ApiProperty({ enum: SlaHealth })
  health!: SlaHealth;

  @ApiProperty()
  targetAt!: string;

  @ApiProperty({ nullable: true })
  breachedAt!: string | null;

  @ApiProperty()
  isBreached!: boolean;

  @ApiProperty({ nullable: true })
  lastCalculatedAt!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  static from(model: SlaRecord): RequestWorkflowSlaRecordDto {
    return {
      id: model.id,
      tenantId: model.tenantId,
      requestId: model.requestId,
      type: model.type,
      health: model.health,
      targetAt: model.targetAt.toISOString(),
      breachedAt: model.breachedAt?.toISOString() ?? null,
      isBreached: model.isBreached,
      lastCalculatedAt: model.lastCalculatedAt?.toISOString() ?? null,
      createdAt: model.createdAt.toISOString(),
      updatedAt: model.updatedAt.toISOString(),
    };
  }
}

export class RequestWorkflowActivityDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  requestId!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  eventType!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty({ nullable: true })
  actorId!: string | null;

  @ApiProperty({ enum: ['USER', 'SYSTEM'] })
  actorType!: 'USER' | 'SYSTEM';

  @ApiProperty({ enum: CommentVisibility })
  visibility!: CommentVisibility;

  @ApiProperty({ nullable: true })
  metadata!: Prisma.JsonValue | null;

  @ApiProperty()
  createdAt!: string;

  private static resolveEventType(model: RequestActivity): string {
    const metadata = (model.metadata ?? {}) as Record<string, unknown>;
    const fromStatus = typeof metadata.from === 'string' ? metadata.from : undefined;
    const toStatus = typeof metadata.to === 'string' ? metadata.to : undefined;

    if (model.type === 'REQUEST_CREATED') {
      return 'REQUEST_CREATED';
    }

    if (model.type === 'STATUS_CHANGED') {
      if (toStatus === RequestStatus.RESOLVED) return 'REQUEST_RESOLVED';
      if (toStatus === RequestStatus.CLOSED) return 'REQUEST_CLOSED';
      if (toStatus === RequestStatus.REOPENED) return 'REQUEST_REOPENED';
      if (toStatus === RequestStatus.CANCELLED) return 'REQUEST_CANCELLED';
      if (fromStatus && toStatus && fromStatus !== toStatus) return 'STATUS_CHANGED';
      return 'STATUS_CHANGED';
    }

    if (model.type === 'ASSIGNED') {
      return 'REQUEST_ASSIGNED';
    }

    if (model.type === 'REASSIGNED') {
      return 'REQUEST_REASSIGNED';
    }

    if (model.type === 'INTERNAL_NOTE_ADDED') {
      return 'COMMENT_ADDED';
    }

    if (model.type === 'COMMENT_ADDED') {
      if (model.title.toLowerCase().includes('work log')) {
        return 'WORK_LOG_ADDED';
      }
      return 'COMMENT_ADDED';
    }

    if (model.type === 'SLA_WARNING') {
      return 'SLA_AT_RISK';
    }

    if (model.type === 'SLA_BREACHED') {
      const looksEscalated =
        model.title.toLowerCase().includes('escalat') ||
        metadata.isAuto === true ||
        metadata.nextStatus === RequestStatus.WAITING_EXTERNAL_VENDOR;
      return looksEscalated ? 'REQUEST_ESCALATED' : 'SLA_BREACHED';
    }

    if (model.type === 'RESOLUTION_SUBMITTED') {
      return 'REQUEST_RESOLVED';
    }

    return model.type;
  }

  private static resolveVisibility(model: RequestActivity): CommentVisibility {
    if (model.type === 'INTERNAL_NOTE_ADDED' || model.type === 'SLA_WARNING') {
      return CommentVisibility.INTERNAL;
    }

    if (model.type === 'SLA_BREACHED') {
      const metadata = (model.metadata ?? {}) as Record<string, unknown>;
      const looksEscalated =
        model.title.toLowerCase().includes('escalat') ||
        metadata.isAuto === true ||
        metadata.nextStatus === RequestStatus.WAITING_EXTERNAL_VENDOR;
      return looksEscalated ? CommentVisibility.PUBLIC : CommentVisibility.INTERNAL;
    }

    if (model.type === 'COMMENT_ADDED') {
      const metadata = (model.metadata ?? {}) as Record<string, unknown>;
      if (metadata.visibility === CommentVisibility.INTERNAL || model.title.toLowerCase().includes('work log')) {
        return CommentVisibility.INTERNAL;
      }
    }

    return CommentVisibility.PUBLIC;
  }

  static from(model: RequestActivity): RequestWorkflowActivityDto {
    return {
      id: model.id,
      tenantId: model.tenantId,
      requestId: model.requestId,
      type: model.type,
      eventType: this.resolveEventType(model),
      title: model.title,
      description: model.description,
      actorId: model.actorId,
      actorType: model.actorId ? 'USER' : 'SYSTEM',
      visibility: this.resolveVisibility(model),
      metadata: model.metadata,
      createdAt: model.createdAt.toISOString(),
    };
  }
}

type RequestAttachmentWithFile = RequestAttachment & {
  uploadedFile: {
    id: string;
    fileName: string;
    fileUrl: string;
    mimeType: string;
    sizeBytes: number;
    uploadedById: string;
    createdAt: Date;
  };
};

export class RequestWorkflowAttachmentDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  requestId!: string;

  @ApiProperty()
  uploadedFileId!: string;

  @ApiProperty()
  fileName!: string;

  @ApiProperty()
  fileUrl!: string;

  @ApiProperty()
  mimeType!: string;

  @ApiProperty()
  sizeBytes!: number;

  @ApiProperty()
  uploadedById!: string;

  @ApiProperty()
  createdAt!: string;

  static from(model: RequestAttachmentWithFile): RequestWorkflowAttachmentDto {
    return {
      id: model.id,
      tenantId: model.tenantId,
      requestId: model.requestId,
      uploadedFileId: model.uploadedFileId,
      fileName: model.uploadedFile.fileName,
      fileUrl: model.uploadedFile.fileUrl,
      mimeType: model.uploadedFile.mimeType,
      sizeBytes: model.uploadedFile.sizeBytes,
      uploadedById: model.uploadedFile.uploadedById,
      createdAt: model.uploadedFile.createdAt.toISOString(),
    };
  }
}

export class RequestWorkflowActorDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ nullable: true })
  avatarUrl!: string | null;

  static from(model: User): RequestWorkflowActorDto {
    return {
      id: model.id,
      fullName: model.fullName?.trim() || [model.firstName, model.lastName].filter(Boolean).join(' ').trim() || model.email,
      email: model.email,
      avatarUrl: model.avatarUrl ?? null,
    };
  }
}

export class RequestWorkflowDetailResponseDto {
  @ApiProperty({ type: RequestResponseDto })
  request!: RequestResponseDto;

  @ApiProperty({ type: [RequestCommentResponseDto] })
  comments!: RequestCommentResponseDto[];

  @ApiProperty({ type: [RequestWorkLogResponseDto] })
  workLogs!: RequestWorkLogResponseDto[];

  @ApiProperty({ type: [RequestWorkflowAssignmentHistoryDto] })
  assignmentHistory!: RequestWorkflowAssignmentHistoryDto[];

  @ApiProperty({ type: [RequestWorkflowSlaRecordDto] })
  slaRecords!: RequestWorkflowSlaRecordDto[];

  @ApiProperty({ type: [RequestWorkflowActivityDto] })
  activities!: RequestWorkflowActivityDto[];

  @ApiProperty({ type: [RequestWorkflowAttachmentDto] })
  attachments!: RequestWorkflowAttachmentDto[];

  @ApiProperty({ type: [RequestWorkflowActorDto] })
  actors!: RequestWorkflowActorDto[];

  @ApiProperty({ nullable: true })
  queueLabel!: string | null;

  @ApiProperty({ type: [String] })
  tags!: string[];

  @ApiProperty({ type: [String] })
  escalationRules!: string[];
}
