import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { SlaPolicyResponseDto } from './dto/sla-policy-response.dto';
import { SlaViolationQueryDto } from './dto/sla-violation-query.dto';
import { SlaService } from './sla.service';

@ApiTags('SLA')
@ApiBearerAuth()
@Controller('sla')
export class SlaController {
  constructor(private readonly slaService: SlaService) {}

  @Get('policies')
  @Permissions({ any: ['sla.manage', 'request.read.all'] })
  @ApiOperation({ summary: 'List SLA policy snapshots by service type' })
  listPolicies(@CurrentTenant() tenantId: string): Promise<SlaPolicyResponseDto[]> {
    return this.slaService.listPolicies(tenantId);
  }

  @Get('violations')
  @Permissions({ any: ['sla.manage', 'request.read.all'] })
  @ApiOperation({ summary: 'List SLA violations' })
  listViolations(@CurrentTenant() tenantId: string, @Query() query: SlaViolationQueryDto) {
    return this.slaService.listViolations(tenantId, query);
  }
}
