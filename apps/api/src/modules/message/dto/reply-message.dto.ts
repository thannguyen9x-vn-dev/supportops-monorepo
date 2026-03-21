import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReplyMessageDto {
  @ApiPropertyOptional({ example: 'Re: Need review for invoice INV-0001' })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  subject?: string;

  @ApiProperty({ example: 'Approved. Please proceed with sending to client.' })
  @IsString()
  @IsNotEmpty()
  body!: string;
}
