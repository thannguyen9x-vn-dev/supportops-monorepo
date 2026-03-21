import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class DeactivateTenantUserDto {
  @ApiPropertyOptional({ example: 'Left company' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}
