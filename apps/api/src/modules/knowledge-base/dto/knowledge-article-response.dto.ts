import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { KnowledgeArticle, KnowledgeBaseStatus } from '@prisma/client';

export class KnowledgeArticleResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  body!: string;

  @ApiPropertyOptional()
  category!: string | null;

  @ApiProperty({ type: [String] })
  tags!: string[];

  @ApiProperty({ enum: KnowledgeBaseStatus })
  status!: KnowledgeBaseStatus;

  @ApiProperty()
  authorId!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  static from(model: KnowledgeArticle): KnowledgeArticleResponseDto {
    return {
      id: model.id,
      title: model.title,
      body: model.body,
      category: model.category,
      tags: model.tags,
      status: model.status,
      authorId: model.authorId,
      createdAt: model.createdAt.toISOString(),
      updatedAt: model.updatedAt.toISOString(),
    };
  }
}
