import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateRequestWorkLogDto {
  @ApiProperty({ example: 'Investigated logs and restarted integration worker.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content!: string;

  @ApiPropertyOptional({ example: 45, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  minutesSpent?: number;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startedAt?: Date;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endedAt?: Date;
}
