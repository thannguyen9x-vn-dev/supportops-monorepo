import { ApiPropertyOptional } from '@nestjs/swagger';
import { RequestStatus, SlaHealth } from '@prisma/client';
import { IsBoolean, IsEnum, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

const REQUEST_TAB_KEYS = [
  'allRequests',
  'submittedTriage',
  'unassigned',
  'slaRisk',
  'escalated',
  'closed',
] as const;

export type RequestTabKey = (typeof REQUEST_TAB_KEYS)[number];

export class RequestQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: RequestStatus })
  @IsEnum(RequestStatus)
  @IsOptional()
  status?: RequestStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  serviceTypeCode?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  locationId?: string;

  @ApiPropertyOptional({ enum: SlaHealth })
  @IsEnum(SlaHealth)
  @IsOptional()
  slaHealth?: SlaHealth;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  updatedToday?: boolean;

  @ApiPropertyOptional({ enum: REQUEST_TAB_KEYS })
  @IsIn(REQUEST_TAB_KEYS)
  @IsOptional()
  tab?: RequestTabKey;
}
