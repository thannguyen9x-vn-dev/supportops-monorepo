import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  RequestImpactLevel,
  RequestPriority,
  RequestUrgency,
  SourceChannel,
} from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export enum CreateRequestMode {
  DRAFT = 'draft',
  SUBMIT = 'submit',
}

export class CreateRequestDto {
  @ApiProperty({ enum: CreateRequestMode, default: CreateRequestMode.SUBMIT })
  @IsEnum(CreateRequestMode)
  mode: CreateRequestMode = CreateRequestMode.SUBMIT;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  serviceTypeId!: string;

  @ApiProperty({ example: 'Office AC leaking at Floor 5 - Meeting Room C' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiProperty({ example: 'Leak has increased and is affecting nearby power sockets.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description!: string;

  @ApiProperty({ example: 'hq-floor-5-meeting-room-c' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  locationId!: string;

  @ApiProperty({ enum: RequestPriority, default: RequestPriority.MEDIUM })
  @IsEnum(RequestPriority)
  priority: RequestPriority = RequestPriority.MEDIUM;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  @IsUUID()
  @IsOptional()
  assetId?: string;

  @ApiPropertyOptional({ enum: RequestImpactLevel, default: RequestImpactLevel.MEDIUM })
  @IsEnum(RequestImpactLevel)
  @IsOptional()
  impactLevel?: RequestImpactLevel;

  @ApiPropertyOptional({ enum: RequestUrgency, default: RequestUrgency.MEDIUM })
  @IsEnum(RequestUrgency)
  @IsOptional()
  urgency?: RequestUrgency;

  @ApiPropertyOptional({ enum: SourceChannel, default: SourceChannel.WEB })
  @IsEnum(SourceChannel)
  @IsOptional()
  sourceChannel?: SourceChannel;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isInternalOnly?: boolean;
}
