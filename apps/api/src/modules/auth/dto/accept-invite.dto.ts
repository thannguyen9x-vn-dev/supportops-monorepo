import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class AcceptInviteDto {
  @ApiProperty({ example: '7cb0e00f-1f19-4f2e-a6b7-5b30f2a9693e' })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({ example: 'Linh Tran' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  fullName!: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsString()
  @MinLength(10)
  @MaxLength(32)
  @Matches(/[a-z]/)
  @Matches(/[A-Z]/)
  @Matches(/[0-9]/)
  @Matches(/[!@#$%^&*(),.?":{}|<>]/)
  password!: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsString()
  @MinLength(10)
  @MaxLength(32)
  confirmPassword!: string;
}
