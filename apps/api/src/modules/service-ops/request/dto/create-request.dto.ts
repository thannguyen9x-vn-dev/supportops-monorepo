import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  RequestImpactLevel,
  RequestPriority,
  RequestUrgency,
  SourceChannel,
} from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
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

export const FRONTEND_CRITICAL_PRIORITY = 'CRITICAL' as const;
export const FRONTEND_IMPACT_DEPARTMENT = 'DEPARTMENT' as const;
export const FRONTEND_IMPACT_TEAM = 'TEAM' as const;
export const FRONTEND_IMPACT_ORGANIZATION = 'ORGANIZATION' as const;

const PRIORITY_ACCEPTED_VALUES = [...Object.values(RequestPriority), FRONTEND_CRITICAL_PRIORITY];
const IMPACT_ACCEPTED_VALUES = [
  ...Object.values(RequestImpactLevel),
  FRONTEND_IMPACT_DEPARTMENT,
  FRONTEND_IMPACT_TEAM,
  FRONTEND_IMPACT_ORGANIZATION,
];

export class CreateRequestDto {
  @ApiProperty({ enum: CreateRequestMode, default: CreateRequestMode.SUBMIT })
  @IsEnum(CreateRequestMode)
  mode: CreateRequestMode = CreateRequestMode.SUBMIT;

  @ApiPropertyOptional({ format: 'uuid', description: 'Primary field used by contracts' })
  @IsUUID()
  @IsOptional()
  serviceTypeId?: string;

  @ApiPropertyOptional({ description: 'Frontend compatibility alias, e.g. HVAC/LIGHTING' })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(120)
  serviceTypeCode?: string;

  @ApiPropertyOptional({ description: 'Frontend compatibility alias for serviceTypeCode' })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(120)
  serviceType?: string;

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

  @ApiPropertyOptional({ example: 'hq-floor-5-meeting-room-c' })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(120)
  locationId?: string;

  @ApiPropertyOptional({ description: 'Frontend compatibility alias for locationId' })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(120)
  location?: string;

  @ApiProperty({ enum: PRIORITY_ACCEPTED_VALUES, default: RequestPriority.MEDIUM })
  @IsIn(PRIORITY_ACCEPTED_VALUES)
  @Transform(({ value }) => (value === FRONTEND_CRITICAL_PRIORITY ? RequestPriority.URGENT : value))
  priority: RequestPriority = RequestPriority.MEDIUM;

  @ApiPropertyOptional({ nullable: true })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(120)
  assetId?: string;

  @ApiPropertyOptional({ enum: IMPACT_ACCEPTED_VALUES, default: RequestImpactLevel.MEDIUM })
  @IsIn(IMPACT_ACCEPTED_VALUES)
  @Transform(({ value }) => {
    if (value === FRONTEND_IMPACT_DEPARTMENT) return RequestImpactLevel.LOW;
    if (value === FRONTEND_IMPACT_TEAM) return RequestImpactLevel.MEDIUM;
    if (value === FRONTEND_IMPACT_ORGANIZATION) return RequestImpactLevel.HIGH;
    return value;
  })
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

  @ApiPropertyOptional({ description: 'Accepted from frontend form, currently not persisted yet' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  preferredContact?: string;

  @ApiPropertyOptional({ type: [String], description: 'Array of uploaded file IDs' })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  attachmentFileIds?: string[];
}
