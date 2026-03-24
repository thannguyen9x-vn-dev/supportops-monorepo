import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Asset, AssetStatus, AssetType } from '@prisma/client';
import { AssetTypeResponseDto } from './asset-type-response.dto';

type AssetWithType = Asset & { assetType?: AssetType };

export class AssetResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  assetCode!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  assetTypeId!: string;

  @ApiPropertyOptional({ type: () => AssetTypeResponseDto })
  assetType?: AssetTypeResponseDto;

  @ApiProperty()
  locationId!: string;

  @ApiProperty({ enum: AssetStatus })
  status!: AssetStatus;

  @ApiPropertyOptional()
  serialNumber?: string | null;

  @ApiPropertyOptional()
  model?: string | null;

  @ApiPropertyOptional()
  assignedDepartment?: string | null;

  @ApiPropertyOptional()
  responsibleTeam?: string | null;

  @ApiPropertyOptional()
  installedAt?: string | null;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  static from(asset: AssetWithType): AssetResponseDto {
    return {
      id: asset.id,
      tenantId: asset.tenantId,
      assetCode: asset.assetCode,
      name: asset.name,
      assetTypeId: asset.assetTypeId,
      assetType: asset.assetType ? AssetTypeResponseDto.from(asset.assetType) : undefined,
      locationId: asset.locationId,
      status: asset.status,
      serialNumber: asset.serialNumber,
      model: asset.model,
      assignedDepartment: asset.assignedDepartment,
      responsibleTeam: asset.responsibleTeam,
      installedAt: asset.installedAt?.toISOString() ?? null,
      description: asset.description,
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString(),
    };
  }
}
