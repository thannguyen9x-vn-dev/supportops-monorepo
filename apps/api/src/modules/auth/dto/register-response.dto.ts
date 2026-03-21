import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty()
  message!: string;

  @ApiProperty()
  requiresEmailVerification!: boolean;

  @ApiProperty({ example: 'admin@supportops.dev' })
  email!: string;
}
