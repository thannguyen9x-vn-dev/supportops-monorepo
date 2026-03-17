import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
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
  @ApiOperation({ summary: 'Change current tenant plan (creates subscription if missing)' })
  changePlan(
    @CurrentTenant() tenantId: string,
    @CurrentUser('role') role: Role,
    @Body() dto: ChangePlanDto,
  ): Promise<CurrentSubscriptionResponseDto> {
    return this.subscriptionService.changePlan(tenantId, role, dto);
  }

  @Put('cancel')
  @ApiOperation({ summary: 'Cancel current tenant subscription' })
  cancel(@CurrentTenant() tenantId: string, @CurrentUser('role') role: Role): Promise<CurrentSubscriptionResponseDto> {
    return this.subscriptionService.cancel(tenantId, role);
  }

  @Put('reactivate')
  @ApiOperation({ summary: 'Reactivate a cancelled subscription' })
  reactivate(@CurrentTenant() tenantId: string, @CurrentUser('role') role: Role): Promise<CurrentSubscriptionResponseDto> {
    return this.subscriptionService.reactivate(tenantId, role);
  }
}
