import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class CreatePaymentMethodDto {
  @ApiProperty({ example: 'card' })
  @IsString()
  type!: string;

  @ApiProperty({ example: '4242' })
  @IsString()
  @Length(4, 4)
  last4!: string;

  @ApiPropertyOptional({ example: 'visa' })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({ example: 12 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  expiryMonth?: number;

  @ApiPropertyOptional({ example: 2030 })
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  @Max(2100)
  @IsOptional()
  expiryYear?: number;

  @ApiPropertyOptional({ example: true })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
