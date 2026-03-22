import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceType } from '@prisma/client';

export class ServiceTypeSettingResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiProperty()
  isActive!: boolean;

  static from(model: ServiceType): ServiceTypeSettingResponseDto {
    return {
      id: model.id,
      code: model.code,
      name: model.name,
      description: model.description,
      isActive: model.isActive,
    };
  }
}
