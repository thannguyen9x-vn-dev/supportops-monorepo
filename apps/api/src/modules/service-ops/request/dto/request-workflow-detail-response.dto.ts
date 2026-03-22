import { ApiProperty } from '@nestjs/swagger';
import { AssignmentHistory, RequestActivity, RequestAttachment, SlaHealth, SlaRecord, SlaType, User } from '@prisma/client';
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
  title!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty({ nullable: true })
  actorId!: string | null;

  @ApiProperty()
  createdAt!: string;

  static from(model: RequestActivity): RequestWorkflowActivityDto {
    return {
      id: model.id,
      tenantId: model.tenantId,
      requestId: model.requestId,
      type: model.type,
      title: model.title,
      description: model.description,
      actorId: model.actorId,
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
