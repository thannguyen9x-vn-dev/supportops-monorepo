import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'admin@supportops.dev' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Matches(/^\d{6}$/, { message: 'Reset code must be 6 digits' })
  code!: string;

  @ApiProperty({ example: 'StrongPassw0rd!' })
  @IsString()
  @MinLength(10)
  @MaxLength(32)
  @Matches(/.*[a-z].*/, { message: 'At least one lowercase character' })
  @Matches(/.*[A-Z].*/, { message: 'At least one uppercase character' })
  @Matches(/.*[0-9].*/, { message: 'At least one number' })
  @Matches(/.*[!@#$%^&*(),.?":{}|<>].*/, { message: 'At least one special character' })
  newPassword!: string;

  @ApiProperty({ example: 'StrongPassw0rd!' })
  @IsString()
  @IsNotEmpty()
  confirmPassword!: string;
}
