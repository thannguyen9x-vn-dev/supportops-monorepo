import { ApiProperty } from '@nestjs/swagger';
import type { TenantAiSettings } from '@prisma/client';

export class AiSettingsResponseDto {
  @ApiProperty()
  defaultModel!: string;

  static from(model: TenantAiSettings | null): AiSettingsResponseDto {
    return {
      defaultModel: model?.defaultModel ?? 'claude-sonnet-4-20250514',
    };
  }
}
