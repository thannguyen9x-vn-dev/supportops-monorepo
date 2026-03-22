import { ApiProperty } from '@nestjs/swagger';

export class DashboardRecentActivityResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  requestId!: string;

  @ApiProperty({ nullable: true })
  requestCode!: string | null;

  @ApiProperty()
  requestTitle!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty({ nullable: true })
  actorName!: string | null;

  @ApiProperty()
  createdAt!: string;
}
