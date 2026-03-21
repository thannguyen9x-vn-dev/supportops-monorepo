import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendVerificationEmailDto {
  @ApiProperty({ example: 'admin@supportops.dev' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
