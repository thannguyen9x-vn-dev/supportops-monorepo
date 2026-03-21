import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Apple iMac 27"' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ example: 'Retina 5K Display' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  subtitle?: string;

  @ApiProperty({ example: 'Electronics' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  category!: string;

  @ApiProperty({ example: 'Apple' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  brand!: string;

  @ApiProperty({ example: 2999.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price!: number;

  @ApiPropertyOptional({ example: 'Full specifications...' })
  @IsString()
  @IsOptional()
  details?: string;
}
