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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { CreateServiceTypeDto } from './dto/create-service-type.dto';
import { CreateSlaPolicyDto } from './dto/create-sla-policy.dto';
import { CreateWorkflowTransitionDto } from './dto/create-workflow-transition.dto';
import { ServiceTypeSettingResponseDto } from './dto/service-type-setting-response.dto';
import { SlaPolicySettingResponseDto } from './dto/sla-policy-setting-response.dto';
import { UpdateServiceTypeDto } from './dto/update-service-type.dto';
import { UpdateSlaPolicyDto } from './dto/update-sla-policy.dto';
import { UpdateWorkflowTransitionDto } from './dto/update-workflow-transition.dto';
import { WorkflowTransitionSettingResponseDto } from './dto/workflow-transition-setting-response.dto';
import { SettingsService } from './settings.service';

@ApiTags('Service Ops Settings')
@ApiBearerAuth()
@Controller()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('service-types')
  @Permissions({ all: ['workflow.manage'] })
  @ApiOperation({ summary: 'List service types' })
  listServiceTypes(@CurrentTenant() tenantId: string): Promise<ServiceTypeSettingResponseDto[]> {
    return this.settingsService.listServiceTypes(tenantId);
  }

  @Post('service-types')
  @Permissions({ all: ['workflow.manage'] })
  @ApiOperation({ summary: 'Create service type' })
  createServiceType(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateServiceTypeDto,
  ): Promise<ServiceTypeSettingResponseDto> {
    return this.settingsService.createServiceType(tenantId, dto);
  }

  @Patch('service-types/:id')
  @Permissions({ all: ['workflow.manage'] })
  @ApiOperation({ summary: 'Update service type' })
  updateServiceType(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceTypeDto,
  ): Promise<ServiceTypeSettingResponseDto> {
    return this.settingsService.updateServiceType(tenantId, id, dto);
  }

  @Delete('service-types/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions({ all: ['workflow.manage'] })
  @ApiOperation({ summary: 'Delete service type' })
  deleteServiceType(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.settingsService.deleteServiceType(tenantId, id);
  }

  @Get('sla-policies')
  @Permissions({ all: ['sla.manage'] })
  @ApiOperation({ summary: 'List SLA policies' })
  listSlaPolicies(@CurrentTenant() tenantId: string): Promise<SlaPolicySettingResponseDto[]> {
    return this.settingsService.listSlaPolicies(tenantId);
  }

  @Post('sla-policies')
  @Permissions({ all: ['sla.manage'] })
  @ApiOperation({ summary: 'Create SLA policy' })
  createSlaPolicy(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateSlaPolicyDto,
  ): Promise<SlaPolicySettingResponseDto> {
    return this.settingsService.createSlaPolicy(tenantId, dto);
  }

  @Patch('sla-policies/:id')
  @Permissions({ all: ['sla.manage'] })
  @ApiOperation({ summary: 'Update SLA policy' })
  updateSlaPolicy(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSlaPolicyDto,
  ): Promise<SlaPolicySettingResponseDto> {
    return this.settingsService.updateSlaPolicy(tenantId, id, dto);
  }

  @Delete('sla-policies/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions({ all: ['sla.manage'] })
  @ApiOperation({ summary: 'Delete SLA policy' })
  deleteSlaPolicy(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.settingsService.deleteSlaPolicy(tenantId, id);
  }

  @Get('workflow-transitions')
  @Permissions({ all: ['workflow.manage'] })
  @ApiOperation({ summary: 'List workflow transitions' })
  listWorkflowTransitions(@CurrentTenant() tenantId: string): Promise<WorkflowTransitionSettingResponseDto[]> {
    return this.settingsService.listWorkflowTransitions(tenantId);
  }

  @Post('workflow-transitions')
  @Permissions({ all: ['workflow.manage'] })
  @ApiOperation({ summary: 'Create workflow transition' })
  createWorkflowTransition(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateWorkflowTransitionDto,
  ): Promise<WorkflowTransitionSettingResponseDto> {
    return this.settingsService.createWorkflowTransition(tenantId, dto);
  }

  @Patch('workflow-transitions/:id')
  @Permissions({ all: ['workflow.manage'] })
  @ApiOperation({ summary: 'Update workflow transition' })
  updateWorkflowTransition(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWorkflowTransitionDto,
  ): Promise<WorkflowTransitionSettingResponseDto> {
    return this.settingsService.updateWorkflowTransition(tenantId, id, dto);
  }

  @Delete('workflow-transitions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions({ all: ['workflow.manage'] })
  @ApiOperation({ summary: 'Delete workflow transition' })
  deleteWorkflowTransition(@CurrentTenant() tenantId: string, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.settingsService.deleteWorkflowTransition(tenantId, id);
  }
}
