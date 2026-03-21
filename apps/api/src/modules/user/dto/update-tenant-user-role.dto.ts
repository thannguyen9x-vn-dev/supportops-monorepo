import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

const ROLE_CODES = ['EMPLOYEE', 'OPS_COORDINATOR', 'TECHNICIAN', 'TENANT_ADMIN'] as const;

export class UpdateTenantUserRoleDto {
  @ApiProperty({ enum: ROLE_CODES })
  @IsString()
  @IsIn(ROLE_CODES)
  roleCode!: (typeof ROLE_CODES)[number];
}
