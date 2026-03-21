import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

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

  @ApiPropertyOptional({ example: true, description: 'Keep sign-in across browser restarts (7-day persistent cookie)' })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
