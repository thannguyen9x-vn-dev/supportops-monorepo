import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { ReportOverviewQueryDto } from './dto/report-overview-query.dto';
import { ReportOverviewResponseDto } from './dto/report-overview-response.dto';
import { ReportingService } from './reporting.service';

@ApiTags('Service Ops Reporting')
@ApiBearerAuth()
@Controller('reports')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get('overview')
  @Permissions({ all: ['report.read'] })
  @ApiOperation({ summary: 'Get reporting overview metrics' })
  overview(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') actorId: string,
    @Query() query: ReportOverviewQueryDto,
  ): Promise<ReportOverviewResponseDto> {
    return this.reportingService.getOverview(tenantId, actorId, query);
  }
}
