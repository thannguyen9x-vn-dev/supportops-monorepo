import { ApiProperty } from '@nestjs/swagger';

export class ReportStatusPointDto {
  @ApiProperty()
  status!: string;

  @ApiProperty()
  count!: number;
}

export class ReportPriorityPointDto {
  @ApiProperty()
  priority!: string;

  @ApiProperty()
  count!: number;
}

export class ReportServiceTypePointDto {
  @ApiProperty()
  serviceTypeId!: string;

  @ApiProperty()
  serviceTypeName!: string;

  @ApiProperty()
  count!: number;
}

export class ReportVolumeTrendPointDto {
  @ApiProperty()
  date!: string;

  @ApiProperty()
  created!: number;

  @ApiProperty()
  resolved!: number;
}

export class ReportOverviewResponseDto {
  @ApiProperty()
  totalRequests!: number;

  @ApiProperty({ type: [ReportStatusPointDto] })
  byStatus!: ReportStatusPointDto[];

  @ApiProperty({ type: [ReportPriorityPointDto] })
  byPriority!: ReportPriorityPointDto[];

  @ApiProperty({ type: [ReportServiceTypePointDto] })
  byServiceType!: ReportServiceTypePointDto[];

  @ApiProperty()
  slaComplianceRate!: number;

  @ApiProperty({ type: [ReportVolumeTrendPointDto] })
  volumeTrend!: ReportVolumeTrendPointDto[];

  @ApiProperty()
  avgResponseMinutes!: number;
}
