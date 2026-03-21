import { ApiProperty } from '@nestjs/swagger';

export class InviteTenantUserResponseDto {
  @ApiProperty()
  inviteId!: string;

  @ApiProperty()
  expiresAt!: string;
}
