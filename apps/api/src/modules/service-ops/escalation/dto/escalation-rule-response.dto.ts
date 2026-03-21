import { ApiProperty } from '@nestjs/swagger';

export class EscalationRuleResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  serviceTypeCode!: string;

  @ApiProperty()
  whenMinutesOverdue!: number;

  @ApiProperty()
  targetStatus!: string;

  @ApiProperty()
  notifyRoleCode!: string;
}
