import { ApiProperty } from '@nestjs/swagger';

export class FileAccessUrlResponseDto {
  @ApiProperty()
  url!: string;

  @ApiProperty()
  expiresAt!: string;
}
