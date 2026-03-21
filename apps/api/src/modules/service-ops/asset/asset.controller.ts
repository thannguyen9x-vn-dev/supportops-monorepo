import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentPermissions } from '../../../common/decorators/current-permissions.decorator';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { AssetDetailQueryDto } from './dto/asset-detail-query.dto';
import { AssetDetailResponseDto } from './dto/asset-detail-response.dto';
import { AssetQueryDto } from './dto/asset-query.dto';
import { AssetService } from './asset.service';

@ApiTags('Assets')
@ApiBearerAuth()
@Controller('assets')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Get()
  @Permissions({ any: ['request.read.all', 'request.read.own', 'request.start_work'] })
  @ApiOperation({ summary: 'List assets derived from service requests' })
  list(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') actorId: string,
    @CurrentPermissions() permissions: string[],
    @Query() query: AssetQueryDto,
  ) {
    return this.assetService.list(tenantId, actorId, permissions, query);
  }

  @Get(':id')
  @Permissions({ any: ['request.read.all', 'request.read.own', 'request.start_work'] })
  @ApiOperation({ summary: 'Get asset detail and related requests' })
  detail(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') actorId: string,
    @CurrentPermissions() permissions: string[],
    @Param('id') id: string,
    @Query() query: AssetDetailQueryDto,
  ): Promise<AssetDetailResponseDto> {
    return this.assetService.detail(tenantId, actorId, permissions, id, query);
  }
}
