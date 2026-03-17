import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token!: string;

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
