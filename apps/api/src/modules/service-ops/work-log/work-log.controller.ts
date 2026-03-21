import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentPermissions } from '../../../common/decorators/current-permissions.decorator';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { WorkLogQueryDto } from './dto/work-log-query.dto';
import { WorkLogResponseDto } from './dto/work-log-response.dto';
import { WorkLogService } from './work-log.service';

@ApiTags('Work Logs')
@ApiBearerAuth()
@Controller('requests/:requestId/work-logs')
export class WorkLogController {
  constructor(private readonly workLogService: WorkLogService) {}

  @Get()
  @Permissions({ any: ['request.read.all', 'request.read.own', 'request.start_work'] })
  @ApiOperation({ summary: 'List work logs by request ID' })
  list(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') actorId: string,
    @CurrentPermissions() permissions: string[],
    @Param('requestId', ParseUUIDPipe) requestId: string,
    @Query() query: WorkLogQueryDto,
  ) {
    return this.workLogService.list(tenantId, actorId, permissions, requestId, query);
  }

  @Get(':workLogId')
  @Permissions({ any: ['request.read.all', 'request.read.own', 'request.start_work'] })
  @ApiOperation({ summary: 'Get work log detail by ID' })
  detail(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') actorId: string,
    @CurrentPermissions() permissions: string[],
    @Param('requestId', ParseUUIDPipe) requestId: string,
    @Param('workLogId', ParseUUIDPipe) workLogId: string,
  ): Promise<WorkLogResponseDto> {
    return this.workLogService.detail(tenantId, actorId, permissions, requestId, workLogId);
  }
}
