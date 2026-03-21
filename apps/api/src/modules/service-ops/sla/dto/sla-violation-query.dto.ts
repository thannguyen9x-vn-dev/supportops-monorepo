import { ApiPropertyOptional } from '@nestjs/swagger';
import { SlaType } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class SlaViolationQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: SlaType })
  @IsEnum(SlaType)
  @IsOptional()
  type?: SlaType;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsUUID()
  @IsOptional()
  requestId?: string;
}
