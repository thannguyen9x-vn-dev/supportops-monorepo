import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RequestStatus } from '@prisma/client';
import { ArrayNotEmpty, IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateWorkflowTransitionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  serviceTypeCode!: string;

  @ApiProperty({ enum: RequestStatus })
  @IsEnum(RequestStatus)
  fromStatus!: RequestStatus;

  @ApiProperty({ enum: RequestStatus })
  @IsEnum(RequestStatus)
  toStatus!: RequestStatus;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  allowedRoles!: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
