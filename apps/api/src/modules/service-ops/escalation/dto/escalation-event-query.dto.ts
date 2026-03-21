import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class EscalationEventQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsUUID()
  @IsOptional()
  requestId?: string;

  @ApiPropertyOptional({ description: 'Filter auto-escalation vs manual escalation events' })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isAuto?: boolean;
}
