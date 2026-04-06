import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

const AI_MODEL_IDS = ['claude-sonnet-4-20250514', 'claude-opus-4-20250514', 'gpt-4o', 'gpt-4o-mini'] as const;
type AiModelId = (typeof AI_MODEL_IDS)[number];

export class ChatMessageDto {
  @ApiProperty({ enum: ['user', 'assistant'] })
  @IsEnum(['user', 'assistant'])
  role!: 'user' | 'assistant';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content!: string;
}

export class AskRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiProperty({ type: [ChatMessageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  history!: ChatMessageDto[];

  @ApiPropertyOptional({ enum: AI_MODEL_IDS })
  @IsOptional()
  @IsEnum(AI_MODEL_IDS)
  model?: AiModelId;
}
