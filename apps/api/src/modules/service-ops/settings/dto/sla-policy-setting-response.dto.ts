import { ApiProperty } from '@nestjs/swagger';
import { SlaPolicy } from '@prisma/client';

export class SlaPolicySettingResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  serviceTypeCode!: string;

  @ApiProperty()
  responseMinutes!: number;

  @ApiProperty()
  resolutionMinutes!: number;

  @ApiProperty()
  escalationAfterMinutes!: number;

  @ApiProperty()
  isActive!: boolean;

  static from(model: SlaPolicy): SlaPolicySettingResponseDto {
    return {
      id: model.id,
      serviceTypeCode: model.serviceTypeCode,
      responseMinutes: model.responseMinutes,
      resolutionMinutes: model.resolutionMinutes,
      escalationAfterMinutes: model.escalationAfterMinutes,
      isActive: model.isActive,
    };
  }
}
