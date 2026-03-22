import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentPermissions } from '../../../common/decorators/current-permissions.decorator';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { RequestResponseDto } from '../request/dto/request-response.dto';
import { EscalationEventQueryDto } from './dto/escalation-event-query.dto';
import { EscalationRuleResponseDto } from './dto/escalation-rule-response.dto';
import { TriggerEscalationDto } from './dto/trigger-escalation.dto';
import { EscalationService } from './escalation.service';

@ApiTags('Escalations')
@ApiBearerAuth()
@Controller('escalations')
export class EscalationController {
  constructor(private readonly escalationService: EscalationService) {}

  @Get('rules')
  @Permissions({ any: ['request.escalate', 'request.read.all', 'sla.manage'] })
  @ApiOperation({ summary: 'List escalation rule snapshots' })
  listRules(@CurrentTenant() tenantId: string): Promise<EscalationRuleResponseDto[]> {
    return this.escalationService.listRules(tenantId);
  }

  @Get('rules/:id')
  @Permissions({ any: ['request.escalate', 'request.read.all', 'sla.manage'] })
  @ApiOperation({ summary: 'Get escalation rule snapshot by id' })
  detailRule(@CurrentTenant() tenantId: string, @Param('id') id: string): Promise<EscalationRuleResponseDto> {
    return this.escalationService.detailRule(tenantId, id);
  }

  @Get('events')
  @Permissions({ any: ['request.escalate', 'request.read.all', 'audit.read'] })
  @ApiOperation({ summary: 'List escalation events' })
  listEvents(@CurrentTenant() tenantId: string, @Query() query: EscalationEventQueryDto) {
    return this.escalationService.listEvents(tenantId, query);
  }

  @Post('events/trigger/:requestId')
  @HttpCode(HttpStatus.OK)
  @Permissions({ all: ['request.escalate'] })
  @ApiOperation({ summary: 'Trigger manual escalation for a request' })
  trigger(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') actorId: string,
    @CurrentPermissions() permissions: string[],
    @Param('requestId', ParseUUIDPipe) requestId: string,
    @Body() dto: TriggerEscalationDto,
  ): Promise<RequestResponseDto> {
    return this.escalationService.triggerManual(tenantId, actorId, permissions, requestId, dto);
  }
}
