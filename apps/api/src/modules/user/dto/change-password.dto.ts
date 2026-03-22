import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  @MaxLength(32)
  @Matches(/[a-z]/, { message: 'New password must include at least one lowercase letter' })
  @Matches(/[A-Z]/, { message: 'New password must include at least one uppercase letter' })
  @Matches(/[0-9]/, { message: 'New password must include at least one number' })
  @Matches(/[!@#$%^&*(),.?":{}|<>]/, { message: 'New password must include at least one special character' })
  newPassword!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  confirmPassword!: string;
}
