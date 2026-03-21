import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ChangePlanDto } from './dto/change-plan.dto';
import { CurrentSubscriptionResponseDto, PlanResponseDto } from './dto/subscription-response.dto';
import { SubscriptionService } from './subscription.service';

@ApiTags('Subscription')
@ApiBearerAuth()
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('plans')
  @ApiOperation({ summary: 'List active subscription plans' })
  plans(): Promise<PlanResponseDto[]> {
    return this.subscriptionService.listPlans();
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current tenant subscription' })
  current(@CurrentTenant() tenantId: string): Promise<CurrentSubscriptionResponseDto> {
    return this.subscriptionService.getCurrent(tenantId);
  }

  @Put('change-plan')
  @Permissions({ all: ['subscription.manage'] })
  @ApiOperation({ summary: 'Change current tenant plan (creates subscription if missing)' })
  changePlan(
    @CurrentTenant() tenantId: string,
    @Body() dto: ChangePlanDto,
  ): Promise<CurrentSubscriptionResponseDto> {
    return this.subscriptionService.changePlan(tenantId, dto);
  }

  @Put('cancel')
  @Permissions({ all: ['subscription.manage'] })
  @ApiOperation({ summary: 'Cancel current tenant subscription' })
  cancel(@CurrentTenant() tenantId: string): Promise<CurrentSubscriptionResponseDto> {
    return this.subscriptionService.cancel(tenantId);
  }

  @Put('reactivate')
  @Permissions({ all: ['subscription.manage'] })
  @ApiOperation({ summary: 'Reactivate a cancelled subscription' })
  reactivate(@CurrentTenant() tenantId: string): Promise<CurrentSubscriptionResponseDto> {
    return this.subscriptionService.reactivate(tenantId);
  }
}
