import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

const SYSTEM_ROLE_CODES = ['EMPLOYEE', 'OPS_COORDINATOR', 'TECHNICIAN', 'TENANT_ADMIN'] as const;
type SystemRoleCode = (typeof SYSTEM_ROLE_CODES)[number];

export class UserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ nullable: true })
  avatarUrl!: string | null;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty({ nullable: true })
  phone!: string | null;

  @ApiProperty({ nullable: true })
  birthday!: string | null;

  @ApiProperty({ nullable: true })
  address!: string | null;

  @ApiProperty({ nullable: true })
  city!: string | null;

  @ApiProperty({ nullable: true })
  zipCode!: string | null;

  @ApiProperty({ nullable: true })
  country!: string | null;

  @ApiProperty({ nullable: true })
  organization!: string | null;

  @ApiProperty({ nullable: true })
  department!: string | null;

  @ApiProperty({ enum: SYSTEM_ROLE_CODES })
  role!: SystemRoleCode;

  @ApiProperty()
  timezone!: string;

  @ApiProperty()
  locale!: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ nullable: true })
  lastLoginAt!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  static from(user: User, roleCode: SystemRoleCode): UserResponseDto {
    return {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      avatarUrl: user.avatarUrl,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      birthday: user.birthday?.toISOString() ?? null,
      address: user.address,
      city: user.city,
      zipCode: user.zipCode,
      country: user.country,
      organization: user.organization,
      department: user.department,
      role: roleCode,
      timezone: user.timezone,
      locale: user.locale,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
