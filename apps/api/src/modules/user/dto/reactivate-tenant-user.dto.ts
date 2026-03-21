import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ReactivateTenantUserDto {
  @ApiPropertyOptional({ example: 'Rejoined team' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}
