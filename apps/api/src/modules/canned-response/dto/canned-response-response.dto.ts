import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CannedResponse } from '@prisma/client';

export class CannedResponseResponseDto {
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

  @ApiPropertyOptional()
  shortcut!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  static from(model: CannedResponse): CannedResponseResponseDto {
    return {
      id: model.id,
      title: model.title,
      body: model.body,
      category: model.category,
      tags: model.tags,
      shortcut: model.shortcut,
      createdAt: model.createdAt.toISOString(),
      updatedAt: model.updatedAt.toISOString(),
    };
  }
}
