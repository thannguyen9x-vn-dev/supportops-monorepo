import { ApiProperty } from '@nestjs/swagger';
import { AuditLog } from '@prisma/client';

export class EscalationEventResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  requestId!: string;

  @ApiProperty()
  action!: string;

  @ApiProperty({ nullable: true })
  actorId!: string | null;

  @ApiProperty()
  isAuto!: boolean;

  @ApiProperty({ nullable: true })
  reason!: string | null;

  @ApiProperty()
  createdAt!: string;

  static from(model: AuditLog): EscalationEventResponseDto {
    const payload = (model.afterData ?? {}) as { reason?: string; isAuto?: boolean };
    const isAuto = payload.isAuto ?? model.action === 'REQUEST_AUTO_ESCALATED';

    return {
      id: model.id,
      tenantId: model.tenantId,
      requestId: model.requestId ?? model.entityId,
      action: model.action,
      actorId: model.actorId,
      isAuto,
      reason: payload.reason ?? null,
      createdAt: model.createdAt.toISOString(),
    };
  }
}
