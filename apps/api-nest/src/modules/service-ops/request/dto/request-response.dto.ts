import { ApiProperty } from '@nestjs/swagger';
import {
  RequestImpactLevel,
  RequestPriority,
  RequestStatus,
  RequestUrgency,
  ServiceRequest,
  SourceChannel,
} from '@prisma/client';

type RequestModel = ServiceRequest;

export class RequestResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty({ nullable: true })
  requestCode!: string | null;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  serviceTypeId!: string;

  @ApiProperty({ enum: RequestStatus })
  status!: RequestStatus;

  @ApiProperty({ enum: RequestPriority })
  priority!: RequestPriority;

  @ApiProperty({ enum: RequestImpactLevel })
  impactLevel!: RequestImpactLevel;

  @ApiProperty({ enum: RequestUrgency })
  urgency!: RequestUrgency;

  @ApiProperty()
  locationId!: string;

  @ApiProperty({ nullable: true })
  assetId!: string | null;

  @ApiProperty()
  requesterId!: string;

  @ApiProperty({ nullable: true })
  assigneeId!: string | null;

  @ApiProperty({ nullable: true })
  queueId!: string | null;

  @ApiProperty({ enum: SourceChannel })
  sourceChannel!: SourceChannel;

  @ApiProperty()
  isInternalOnly!: boolean;

  @ApiProperty({ nullable: true })
  submittedAt!: string | null;

  @ApiProperty({ nullable: true })
  assignedAt!: string | null;

  @ApiProperty({ nullable: true })
  startedAt!: string | null;

  @ApiProperty({ nullable: true })
  resolvedAt!: string | null;

  @ApiProperty({ nullable: true })
  closedAt!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  static from(request: RequestModel): RequestResponseDto {
    return {
      id: request.id,
      tenantId: request.tenantId,
      requestCode: request.requestCode,
      title: request.title,
      description: request.description,
      serviceTypeId: request.serviceTypeId,
      status: request.status,
      priority: request.priority,
      impactLevel: request.impactLevel,
      urgency: request.urgency,
      locationId: request.locationId,
      assetId: request.assetId,
      requesterId: request.requesterId,
      assigneeId: request.assigneeId,
      queueId: request.queueId,
      sourceChannel: request.sourceChannel,
      isInternalOnly: request.isInternalOnly,
      submittedAt: request.submittedAt?.toISOString() ?? null,
      assignedAt: request.assignedAt?.toISOString() ?? null,
      startedAt: request.startedAt?.toISOString() ?? null,
      resolvedAt: request.resolvedAt?.toISOString() ?? null,
      closedAt: request.closedAt?.toISOString() ?? null,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
    };
  }
}
