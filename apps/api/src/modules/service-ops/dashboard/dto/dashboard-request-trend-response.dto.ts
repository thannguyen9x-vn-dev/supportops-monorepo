import { ApiProperty } from '@nestjs/swagger';

export class DashboardRequestTrendItemDto {
  @ApiProperty({ example: '2026-03-01' })
  date!: string;

  @ApiProperty()
  opened!: number;

  @ApiProperty()
  resolved!: number;
}
