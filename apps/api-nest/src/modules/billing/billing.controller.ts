import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BillingService } from './billing.service';
import { BillingInfoResponseDto, PaymentMethodResponseDto } from './dto/billing-response.dto';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdateBillingInfoDto } from './dto/update-billing-info.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

@ApiTags('Billing')
@ApiBearerAuth()
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('info')
  @ApiOperation({ summary: 'Get billing info' })
  info(@CurrentTenant() tenantId: string): Promise<BillingInfoResponseDto | null> {
    return this.billingService.getBillingInfo(tenantId);
  }

  @Put('info')
  @ApiOperation({ summary: 'Create or update billing info' })
  upsertInfo(
    @CurrentTenant() tenantId: string,
    @CurrentUser('role') role: Role,
    @Body() dto: UpdateBillingInfoDto,
  ): Promise<BillingInfoResponseDto> {
    return this.billingService.upsertBillingInfo(tenantId, role, dto);
  }

  @Get('payment-methods')
  @ApiOperation({ summary: 'List payment methods' })
  paymentMethods(@CurrentTenant() tenantId: string): Promise<PaymentMethodResponseDto[]> {
    return this.billingService.listPaymentMethods(tenantId);
  }

  @Post('payment-methods')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create payment method' })
  createPaymentMethod(
    @CurrentTenant() tenantId: string,
    @CurrentUser('role') role: Role,
    @Body() dto: CreatePaymentMethodDto,
  ): Promise<PaymentMethodResponseDto> {
    return this.billingService.createPaymentMethod(tenantId, role, dto);
  }

  @Put('payment-methods/:id')
  @ApiOperation({ summary: 'Update payment method' })
  updatePaymentMethod(
    @CurrentTenant() tenantId: string,
    @CurrentUser('role') role: Role,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePaymentMethodDto,
  ): Promise<PaymentMethodResponseDto> {
    return this.billingService.updatePaymentMethod(tenantId, role, id, dto);
  }

  @Put('payment-methods/:id/default')
  @ApiOperation({ summary: 'Set default payment method' })
  setDefaultPaymentMethod(
    @CurrentTenant() tenantId: string,
    @CurrentUser('role') role: Role,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PaymentMethodResponseDto> {
    return this.billingService.setDefaultPaymentMethod(tenantId, role, id);
  }

  @Delete('payment-methods/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete payment method' })
  async deletePaymentMethod(
    @CurrentTenant() tenantId: string,
    @CurrentUser('role') role: Role,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.billingService.deletePaymentMethod(tenantId, role, id);
  }
}
