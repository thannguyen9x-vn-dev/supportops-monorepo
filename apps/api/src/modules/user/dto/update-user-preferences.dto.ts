import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserPreferencesDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  companyNews?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  accountActivity?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  meetupsNearYou?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  newMessages?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  ratingReminders?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  itemUpdateNotif?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  itemCommentNotif?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  buyerReviewNotif?: boolean;
}
