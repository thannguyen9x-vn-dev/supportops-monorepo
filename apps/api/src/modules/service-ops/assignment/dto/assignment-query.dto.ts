import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class AssignmentQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsUUID()
  @IsOptional()
  requestId?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Filter by new assignee' })
  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Filter by actor who changed assignment' })
  @IsUUID()
  @IsOptional()
  changedById?: string;
}
