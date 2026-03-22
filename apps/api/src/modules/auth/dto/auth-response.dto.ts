import { ApiProperty } from '@nestjs/swagger';

type SystemRoleCode = 'EMPLOYEE' | 'OPS_COORDINATOR' | 'TECHNICIAN' | 'TENANT_ADMIN';

export class AuthResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  expiresIn!: number;

  @ApiProperty({ required: false })
  refreshToken?: string;

  @ApiProperty({ required: false })
  rememberMe?: boolean;

  @ApiProperty()
  user!: {
    id: string;
    tenantId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: SystemRoleCode;
    joinedAt: string | null;
  };

  @ApiProperty({ required: false })
  membership?: {
    id: string;
    tenantId: string;
    roleCode: string;
  };
}
