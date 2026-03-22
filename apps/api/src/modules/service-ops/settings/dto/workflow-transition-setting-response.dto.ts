import { ApiProperty } from '@nestjs/swagger';
import { RequestStatus, WorkflowTransition } from '@prisma/client';

export class WorkflowTransitionSettingResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  serviceTypeCode!: string;

  @ApiProperty({ enum: RequestStatus })
  fromStatus!: RequestStatus;

  @ApiProperty({ enum: RequestStatus })
  toStatus!: RequestStatus;

  @ApiProperty({ type: [String] })
  allowedRoles!: string[];

  @ApiProperty()
  isActive!: boolean;

  static from(model: WorkflowTransition): WorkflowTransitionSettingResponseDto {
    return {
      id: model.id,
      serviceTypeCode: model.serviceTypeCode,
      fromStatus: model.fromStatus,
      toStatus: model.toStatus,
      allowedRoles: model.allowedRoles,
      isActive: model.isActive,
    };
  }
}
