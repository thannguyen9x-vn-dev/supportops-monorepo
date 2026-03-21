import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

const ROLE_CODES = ['EMPLOYEE', 'OPS_COORDINATOR', 'TECHNICIAN', 'TENANT_ADMIN'] as const;

export class InviteTenantUserDto {
  @ApiProperty({ example: 'new.user@supportops.dev' })
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: ROLE_CODES })
  @IsString()
  @IsIn(ROLE_CODES)
  roleCode!: (typeof ROLE_CODES)[number];

  @ApiPropertyOptional({ example: 'New User' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  fullName?: string;
}
