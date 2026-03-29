import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class ReportOverviewQueryDto {
  @ApiProperty({ example: '2026-03-01' })
  @IsDateString()
  from!: string;

  @ApiProperty({ example: '2026-03-31' })
  @IsDateString()
  to!: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  assigneeId?: string;
}
