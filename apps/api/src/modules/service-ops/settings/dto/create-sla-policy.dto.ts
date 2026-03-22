import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateSlaPolicyDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  serviceTypeCode!: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  responseMinutes!: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  resolutionMinutes!: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  escalationAfterMinutes!: number;
}
