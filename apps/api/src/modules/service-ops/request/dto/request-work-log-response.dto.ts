import { ApiProperty } from '@nestjs/swagger';
import { WorkLog } from '@prisma/client';

export class RequestWorkLogResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  requestId!: string;

  @ApiProperty()
  authorId!: string;

  @ApiProperty()
  content!: string;

  @ApiProperty({ nullable: true })
  minutesSpent!: number | null;

  @ApiProperty({ nullable: true })
  startedAt!: string | null;

  @ApiProperty({ nullable: true })
  endedAt!: string | null;

  @ApiProperty()
  createdAt!: string;

  static from(workLog: WorkLog): RequestWorkLogResponseDto {
    return {
      id: workLog.id,
      tenantId: workLog.tenantId,
      requestId: workLog.requestId,
      authorId: workLog.authorId,
      content: workLog.content,
      minutesSpent: workLog.minutesSpent ?? null,
      startedAt: workLog.startedAt?.toISOString() ?? null,
      endedAt: workLog.endedAt?.toISOString() ?? null,
      createdAt: workLog.createdAt.toISOString(),
    };
  }
}
