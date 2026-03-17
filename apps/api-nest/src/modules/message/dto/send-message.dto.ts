import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  receiverId!: string;

  @ApiProperty({ example: 'Need review for invoice INV-0001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  subject!: string;

  @ApiProperty({ example: 'Please review and approve before EOD.' })
  @IsString()
  @IsNotEmpty()
  body!: string;
}
