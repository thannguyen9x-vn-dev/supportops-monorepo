import { ApiProperty } from '@nestjs/swagger';
import { MembershipStatus, UserStatus } from '@prisma/client';

export class TenantUserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty({ nullable: true })
  department!: string | null;

  @ApiProperty({ enum: UserStatus })
  userStatus!: UserStatus;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ nullable: true })
  lastLoginAt!: string | null;

  @ApiProperty({ nullable: true })
  membershipId!: string | null;

  @ApiProperty({ nullable: true })
  roleCode!: string | null;

  @ApiProperty({ enum: MembershipStatus, nullable: true })
  membershipStatus!: MembershipStatus | null;

  @ApiProperty()
  createdAt!: string;
}
