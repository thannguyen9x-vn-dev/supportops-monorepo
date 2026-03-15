import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class AuthResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  expiresIn!: number;

  @ApiProperty({ required: false })
  refreshToken?: string;

  @ApiProperty()
  user!: {
    id: string;
    tenantId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
  };
}
