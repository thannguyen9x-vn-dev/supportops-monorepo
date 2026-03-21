import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ReopenResolutionDto {
  @ApiProperty({ example: 'Issue reoccurred after deployment rollback.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  reason!: string;
}
