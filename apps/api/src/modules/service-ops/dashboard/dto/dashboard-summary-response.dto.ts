import { ApiProperty } from '@nestjs/swagger';

export class DashboardKpisResponseDto {
  @ApiProperty()
  openRequests!: number;

  @ApiProperty()
  unassigned!: number;

  @ApiProperty()
  slaBreached!: number;

  @ApiProperty()
  resolvedToday!: number;

  @ApiProperty()
  avgResolutionTimeHours!: number;

  @ApiProperty()
  myAssigned!: number;
}

export class DashboardStatusCountResponseDto {
  @ApiProperty()
  status!: string;

  @ApiProperty()
  count!: number;
}

export class DashboardPriorityCountResponseDto {
  @ApiProperty()
  priority!: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

  @ApiProperty()
  count!: number;
}

export class DashboardSlaOverviewResponseDto {
  @ApiProperty()
  onTrack!: number;

  @ApiProperty()
  atRisk!: number;

  @ApiProperty()
  breached!: number;
}

export class DashboardSummaryResponseDto {
  @ApiProperty({ enum: ['TEAM', 'PERSONAL'] })
  scope!: 'TEAM' | 'PERSONAL';

  @ApiProperty({ type: DashboardKpisResponseDto })
  kpis!: DashboardKpisResponseDto;

  @ApiProperty({ type: [DashboardStatusCountResponseDto] })
  requestsByStatus!: DashboardStatusCountResponseDto[];

  @ApiProperty({ type: [DashboardPriorityCountResponseDto] })
  requestsByPriority!: DashboardPriorityCountResponseDto[];

  @ApiProperty({ type: DashboardSlaOverviewResponseDto })
  slaOverview!: DashboardSlaOverviewResponseDto;
}
