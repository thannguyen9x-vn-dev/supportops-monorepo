import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentPermissions } from '../../../common/decorators/current-permissions.decorator';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DashboardRecentActivityResponseDto } from './dto/dashboard-recent-activity-response.dto';
import { DashboardSummaryResponseDto } from './dto/dashboard-summary-response.dto';
import { DashboardService } from './dashboard.service';

@ApiTags('ServiceOps Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @Permissions({ any: ['request.read.all', 'request.read.own'] })
  @ApiOperation({ summary: 'Get ServiceOps dashboard summary for current tenant and user scope' })
  summary(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
    @CurrentPermissions() permissions: string[],
  ): Promise<DashboardSummaryResponseDto> {
    return this.dashboardService.summary(tenantId, userId, permissions);
  }

  @Get('recent-activity')
  @Permissions({ any: ['request.read.all', 'request.read.own'] })
  @ApiOperation({ summary: 'Get recent ServiceOps activity for current tenant and user scope' })
  recentActivity(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
    @CurrentPermissions() permissions: string[],
  ): Promise<DashboardRecentActivityResponseDto[]> {
    return this.dashboardService.recentActivity(tenantId, userId, permissions);
  }
}
