import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiPropertyOptional({ example: 'SupportOps Demo' })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  tenantName?: string;

  @ApiPropertyOptional({ example: 'SupportOps Demo Co.' })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  organizationName?: string;

  @ApiPropertyOptional({ example: 'supportops-demo' })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @MaxLength(255)
  @IsOptional()
  tenantSlug?: string;

  @ApiProperty({ example: 'admin@supportops.dev' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'StrongPassword123' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @ApiProperty({ example: 'Admin' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: 'User' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;
}
