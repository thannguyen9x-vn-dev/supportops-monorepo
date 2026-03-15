import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class LoginDto {
  @ApiPropertyOptional({ example: 'supportops-demo' })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @IsOptional()
  tenantSlug?: string;

  @ApiProperty({ example: 'admin@supportops.dev' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongPassword123' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
