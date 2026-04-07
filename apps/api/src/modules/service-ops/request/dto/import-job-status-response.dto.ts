import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { BulkImportResult, ImportJobStatus, ImportPreviewResult } from '@supportops/types';

export class ImportJobStatusResponseDto {
  @ApiProperty()
  jobId!: string;

  @ApiProperty({ enum: ['queued', 'preview_ready', 'processing', 'completed', 'failed'] })
  status!: ImportJobStatus;

  @ApiPropertyOptional()
  progress?: number;

  @ApiPropertyOptional()
  preview?: ImportPreviewResult;

  @ApiPropertyOptional()
  result?: BulkImportResult;

  @ApiPropertyOptional()
  error?: string;
}
