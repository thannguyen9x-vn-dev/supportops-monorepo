import { ApiProperty } from '@nestjs/swagger';

export class WatcherListResponseDto {
  @ApiProperty()
  userId!: string;

  @ApiProperty()
  userName!: string;

  @ApiProperty()
  autoWatch!: boolean;

  @ApiProperty()
  createdAt!: string;
}
