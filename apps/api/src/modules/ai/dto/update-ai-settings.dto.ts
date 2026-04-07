import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

const AI_MODEL_IDS = ['claude-sonnet-4-20250514', 'claude-opus-4-20250514', 'gpt-4o', 'gpt-4o-mini'] as const;

export class UpdateAiSettingsDto {
  @ApiProperty({ enum: AI_MODEL_IDS })
  @IsEnum(AI_MODEL_IDS)
  defaultModel!: (typeof AI_MODEL_IDS)[number];
}
