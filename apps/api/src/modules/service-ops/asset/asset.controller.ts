import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { AssetService } from './asset.service';
import { AssetDetailQueryDto } from './dto/asset-detail-query.dto';
import { AssetDetailResponseDto } from './dto/asset-detail-response.dto';
import { AssetQueryDto } from './dto/asset-query.dto';
import { AssetResponseDto } from './dto/asset-response.dto';
import { AssetTypeResponseDto } from './dto/asset-type-response.dto';
import { CreateAssetDto } from './dto/create-asset.dto';
import { CreateAssetTypeDto } from './dto/create-asset-type.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { UpdateAssetTypeDto } from './dto/update-asset-type.dto';

@ApiTags('Assets')
@ApiBearerAuth()
@Controller()
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  // ─── Asset Types ─────────────────────────────────────────────────────────────

  @Get('asset-types')
  @Permissions({ any: ['request.read.all', 'request.read.own', 'request.start_work', 'asset.manage'] })
  @ApiOperation({ summary: 'List asset types' })
  listAssetTypes(@CurrentTenant() tenantId: string): Promise<AssetTypeResponseDto[]> {
    return this.assetService.listAssetTypes(tenantId);
  }

  @Post('asset-types')
  @Permissions({ all: ['asset.manage'] })
  @ApiOperation({ summary: 'Create asset type' })
  createAssetType(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateAssetTypeDto,
  ): Promise<AssetTypeResponseDto> {
    return this.assetService.createAssetType(tenantId, dto);
  }

  @Patch('asset-types/:id')
  @Permissions({ all: ['asset.manage'] })
  @ApiOperation({ summary: 'Update asset type' })
  updateAssetType(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAssetTypeDto,
  ): Promise<AssetTypeResponseDto> {
    return this.assetService.updateAssetType(tenantId, id, dto);
  }

  @Delete('asset-types/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions({ all: ['asset.manage'] })
  @ApiOperation({ summary: 'Delete asset type' })
  deleteAssetType(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.assetService.deleteAssetType(tenantId, id);
  }

  // ─── Assets ──────────────────────────────────────────────────────────────────

  @Get('assets')
  @Permissions({ any: ['request.read.all', 'request.read.own', 'request.start_work', 'asset.manage'] })
  @ApiOperation({ summary: 'List assets' })
  list(
    @CurrentTenant() tenantId: string,
    @Query() query: AssetQueryDto,
  ): Promise<{ data: AssetResponseDto[] }> {
    return this.assetService.list(tenantId, query);
  }

  @Post('assets')
  @Permissions({ all: ['asset.manage'] })
  @ApiOperation({ summary: 'Create asset' })
  create(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateAssetDto,
  ): Promise<AssetResponseDto> {
    return this.assetService.create(tenantId, dto);
  }

  @Get('assets/:id')
  @Permissions({ any: ['request.read.all', 'request.read.own', 'request.start_work', 'asset.manage'] })
  @ApiOperation({ summary: 'Get asset detail with linked requests' })
  detail(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: AssetDetailQueryDto,
  ): Promise<AssetDetailResponseDto> {
    return this.assetService.detail(tenantId, id, query);
  }

  @Patch('assets/:id')
  @Permissions({ all: ['asset.manage'] })
  @ApiOperation({ summary: 'Update asset' })
  update(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAssetDto,
  ): Promise<AssetResponseDto> {
    return this.assetService.update(tenantId, id, dto);
  }

  @Delete('assets/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions({ all: ['asset.manage'] })
  @ApiOperation({ summary: 'Delete asset' })
  delete(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.assetService.delete(tenantId, id);
  }
}
