import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { RequestPriority } from '@prisma/client';

export class BulkCreateRequestItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  serviceTypeCode!: string;

  @IsEnum(RequestPriority)
  priority!: RequestPriority;

  @IsString()
  @IsNotEmpty()
  locationId!: string;

  @IsOptional()
  @IsEmail()
  reporterEmail?: string;
}

export class BulkCreateRequestDto {
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => BulkCreateRequestItemDto)
  items!: BulkCreateRequestItemDto[];
}
