import { ApiProperty } from '@nestjs/swagger';

export class WatchRequestResponseDto {
  @ApiProperty()
  requestId!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  watching!: boolean;
}
