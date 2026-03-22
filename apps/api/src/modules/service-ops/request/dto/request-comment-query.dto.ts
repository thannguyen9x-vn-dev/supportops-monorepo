import { ApiPropertyOptional } from '@nestjs/swagger';
import { CommentVisibility } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class RequestCommentQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: CommentVisibility })
  @IsEnum(CommentVisibility)
  @IsOptional()
  visibility?: CommentVisibility;
}
