import { ApiProperty } from '@nestjs/swagger';

export class UserSessionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ nullable: true })
  userAgent!: string | null;

  @ApiProperty({ nullable: true })
  ipAddress!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty({ nullable: true })
  lastUsedAt!: string | null;

  @ApiProperty()
  expiresAt!: string;

  @ApiProperty({ nullable: true })
  revokedAt!: string | null;

  @ApiProperty({ nullable: true })
  revokedReason!: string | null;

  @ApiProperty()
  isCurrent!: boolean;
}
