import { ApiPropertyOptional } from '@nestjs/swagger';
import { KnowledgeBaseStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class KnowledgeArticleQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: KnowledgeBaseStatus })
  @IsOptional()
  @IsEnum(KnowledgeBaseStatus)
  status?: KnowledgeBaseStatus;

  @ApiPropertyOptional({ description: 'Full-text search keyword' })
  @IsOptional()
  @IsString()
  q?: string;
}
