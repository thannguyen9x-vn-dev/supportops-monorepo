import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { EXPORT_METRIC } from '@supportops/types';
import type { ExportMetric } from '@supportops/types';

export class ExportReportDto {
  @ApiProperty({ example: '2026-01-01', description: 'Start date ISO format' })
  @IsDateString()
  from_date!: string;

  @ApiProperty({ example: '2026-03-31', description: 'End date ISO format' })
  @IsDateString()
  to_date!: string;

  @ApiPropertyOptional({ enum: EXPORT_METRIC, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(EXPORT_METRIC, { each: true })
  metrics?: ExportMetric[];
}
