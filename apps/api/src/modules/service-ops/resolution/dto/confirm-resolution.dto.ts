import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ConfirmResolutionDto {
  @ApiProperty({ example: 'Root cause fixed and service restored.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  summary!: string;

  @ApiPropertyOptional({ example: 'Restarted queue worker and validated end-to-end flow.' })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  notes?: string;

  @ApiPropertyOptional({ default: false, description: 'Close request immediately after marking resolved' })
  @IsBoolean()
  @IsOptional()
  closeImmediately?: boolean;
}
