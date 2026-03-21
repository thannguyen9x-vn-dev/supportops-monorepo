import { ApiProperty } from '@nestjs/swagger';
import { AssignmentHistory } from '@prisma/client';

export class AssignmentResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  requestId!: string;

  @ApiProperty({ nullable: true })
  fromAssigneeId!: string | null;

  @ApiProperty({ nullable: true })
  toAssigneeId!: string | null;

  @ApiProperty()
  changedById!: string;

  @ApiProperty({ nullable: true })
  reason!: string | null;

  @ApiProperty()
  changedAt!: string;

  static from(history: AssignmentHistory): AssignmentResponseDto {
    return {
      id: history.id,
      tenantId: history.tenantId,
      requestId: history.requestId,
      fromAssigneeId: history.fromAssigneeId,
      toAssigneeId: history.toAssigneeId,
      changedById: history.changedById,
      reason: history.reason,
      changedAt: history.changedAt.toISOString(),
    };
  }
}
