import { ApiProperty } from '@nestjs/swagger';
import { CommentVisibility, RequestComment } from '@prisma/client';

export class RequestCommentResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  requestId!: string;

  @ApiProperty()
  authorId!: string;

  @ApiProperty({ enum: CommentVisibility })
  visibility!: CommentVisibility;

  @ApiProperty()
  body!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  static from(comment: RequestComment): RequestCommentResponseDto {
    return {
      id: comment.id,
      tenantId: comment.tenantId,
      requestId: comment.requestId,
      authorId: comment.authorId,
      visibility: comment.visibility,
      body: comment.body,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
    };
  }
}
