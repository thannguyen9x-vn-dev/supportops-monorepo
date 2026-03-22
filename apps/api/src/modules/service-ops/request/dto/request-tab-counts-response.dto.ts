import { ApiProperty } from '@nestjs/swagger';

export class RequestTabCountsResponseDto {
  @ApiProperty()
  allRequests!: number;

  @ApiProperty()
  submittedTriage!: number;

  @ApiProperty()
  unassigned!: number;

  @ApiProperty()
  slaRisk!: number;

  @ApiProperty()
  escalated!: number;

  @ApiProperty()
  closed!: number;
}
