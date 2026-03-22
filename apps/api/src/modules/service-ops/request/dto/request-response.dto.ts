import { ApiProperty } from '@nestjs/swagger';
import {
  RequestImpactLevel,
  RequestPriority,
  RequestStatus,
  RequestUrgency,
  SlaHealth,
  ServiceRequest,
  SourceChannel,
} from '@prisma/client';

type RequestModel = ServiceRequest;
type RequestModelWithServiceType = RequestModel & {
  serviceType?: {
    code: string;
    name: string;
  } | null;
  queue?: {
    name: string;
  } | null;
  slaRecords?: Array<{
    health: SlaHealth;
    targetAt: Date;
  }>;
};

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

  @ApiProperty({ nullable: true })
  serviceTypeCode!: string | null;

  @ApiProperty({ nullable: true })
  serviceTypeName!: string | null;

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

  @ApiProperty({ nullable: true })
  queueLabel!: string | null;

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

  @ApiProperty({ enum: SlaHealth, nullable: true })
  slaHealth!: SlaHealth | null;

  @ApiProperty({ nullable: true })
  slaDueAt!: string | null;

  static from(request: RequestModelWithServiceType): RequestResponseDto {
    const slaHealth = request.slaRecords?.some((item) => item.health === 'BREACHED')
      ? 'BREACHED'
      : request.slaRecords?.some((item) => item.health === 'AT_RISK')
        ? 'AT_RISK'
        : request.slaRecords?.some((item) => item.health === 'ON_TRACK')
          ? 'ON_TRACK'
          : null;

    const earliestTargetAt = request.slaRecords?.length
      ? request.slaRecords
          .map((item) => item.targetAt.getTime())
          .reduce((min, current) => Math.min(min, current), Number.POSITIVE_INFINITY)
      : null;

    return {
      id: request.id,
      tenantId: request.tenantId,
      requestCode: request.requestCode,
      title: request.title,
      description: request.description,
      serviceTypeId: request.serviceTypeId,
      serviceTypeCode: request.serviceType?.code ?? null,
      serviceTypeName: request.serviceType?.name ?? null,
      status: request.status,
      priority: request.priority,
      impactLevel: request.impactLevel,
      urgency: request.urgency,
      locationId: request.locationId,
      assetId: request.assetId,
      requesterId: request.requesterId,
      assigneeId: request.assigneeId,
      queueId: request.queueId,
      queueLabel: request.queue?.name ?? null,
      sourceChannel: request.sourceChannel,
      isInternalOnly: request.isInternalOnly,
      submittedAt: request.submittedAt?.toISOString() ?? null,
      assignedAt: request.assignedAt?.toISOString() ?? null,
      startedAt: request.startedAt?.toISOString() ?? null,
      resolvedAt: request.resolvedAt?.toISOString() ?? null,
      closedAt: request.closedAt?.toISOString() ?? null,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
      slaHealth,
      slaDueAt: earliestTargetAt !== null ? new Date(earliestTargetAt).toISOString() : null,
    };
  }
}
