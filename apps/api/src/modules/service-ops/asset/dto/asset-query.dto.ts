import { ApiPropertyOptional } from '@nestjs/swagger';
import { AssetStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class AssetQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: AssetStatus })
  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assetTypeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  locationId?: string;
}
