import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class TriggerEscalationDto {
  @ApiPropertyOptional({ example: 'Waiting on external vendor response for core network issue.' })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  reason?: string;
}
