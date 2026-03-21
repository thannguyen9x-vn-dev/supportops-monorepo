import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DashboardOverviewDto } from './dto/dashboard-overview.dto';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get dashboard overview for current tenant and user' })
  overview(@CurrentTenant() tenantId: string, @CurrentUser('sub') userId: string): Promise<DashboardOverviewDto> {
    return this.dashboardService.overview(tenantId, userId);
  }
}
