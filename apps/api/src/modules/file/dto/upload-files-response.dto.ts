import { ApiProperty } from '@nestjs/swagger';

export class UploadedFileDto {
  @ApiProperty({ description: 'Unique file ID' })
  id: string;

  @ApiProperty({ description: 'Original file name' })
  fileName: string;

  @ApiProperty({ description: 'File URL' })
  fileUrl: string;

  @ApiProperty({ description: 'MIME type' })
  mimeType: string;

  @ApiProperty({ description: 'File size in bytes' })
  sizeBytes: number;

  @ApiProperty({ description: 'Upload timestamp' })
  uploadedAt: string;
}

export class UploadFilesResponseDto {
  @ApiProperty({ type: [UploadedFileDto], description: 'List of uploaded files' })
  files: UploadedFileDto[];
}
