import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserPreferencesDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  assignmentAlerts?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  statusUpdateAlerts?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  slaRiskAlerts?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  escalationAlerts?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  resolutionReminders?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  requestUpdateDigest?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  commentNotifications?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  mentionNotifications?: boolean;
}
