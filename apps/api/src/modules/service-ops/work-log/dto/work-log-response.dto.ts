import { ApiProperty } from '@nestjs/swagger';
import { WorkLog } from '@prisma/client';

export class WorkLogResponseDto {
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

  static from(model: WorkLog): WorkLogResponseDto {
    return {
      id: model.id,
      tenantId: model.tenantId,
      requestId: model.requestId,
      authorId: model.authorId,
      content: model.content,
      minutesSpent: model.minutesSpent,
      startedAt: model.startedAt?.toISOString() ?? null,
      endedAt: model.endedAt?.toISOString() ?? null,
      createdAt: model.createdAt.toISOString(),
    };
  }
}
