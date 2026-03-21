import { ApiProperty } from '@nestjs/swagger';
import { SlaHealth, SlaRecord, SlaType } from '@prisma/client';

type SlaRecordWithRequest = SlaRecord & {
  request?: {
    requestCode: string | null;
    title: string;
    status: string;
  } | null;
};

export class SlaViolationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  requestId!: string;

  @ApiProperty({ nullable: true })
  requestCode!: string | null;

  @ApiProperty({ nullable: true })
  requestTitle!: string | null;

  @ApiProperty({ nullable: true })
  requestStatus!: string | null;

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

  static from(model: SlaRecordWithRequest): SlaViolationResponseDto {
    return {
      id: model.id,
      tenantId: model.tenantId,
      requestId: model.requestId,
      requestCode: model.request?.requestCode ?? null,
      requestTitle: model.request?.title ?? null,
      requestStatus: model.request?.status ?? null,
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
