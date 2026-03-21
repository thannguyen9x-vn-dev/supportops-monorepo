import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommentVisibility } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRequestCommentDto {
  @ApiProperty({ example: 'Please provide additional screenshots for this issue.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  body!: string;

  @ApiPropertyOptional({ enum: CommentVisibility, default: CommentVisibility.PUBLIC })
  @IsEnum(CommentVisibility)
  @IsOptional()
  visibility?: CommentVisibility;
}
