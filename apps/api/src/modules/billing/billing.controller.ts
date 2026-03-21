import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
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
  @Permissions({ all: ['billing.manage'] })
  @ApiOperation({ summary: 'Create or update billing info' })
  upsertInfo(
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdateBillingInfoDto,
  ): Promise<BillingInfoResponseDto> {
    return this.billingService.upsertBillingInfo(tenantId, dto);
  }

  @Get('payment-methods')
  @ApiOperation({ summary: 'List payment methods' })
  paymentMethods(@CurrentTenant() tenantId: string): Promise<PaymentMethodResponseDto[]> {
    return this.billingService.listPaymentMethods(tenantId);
  }

  @Post('payment-methods')
  @HttpCode(HttpStatus.CREATED)
  @Permissions({ all: ['billing.manage'] })
  @ApiOperation({ summary: 'Create payment method' })
  createPaymentMethod(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreatePaymentMethodDto,
  ): Promise<PaymentMethodResponseDto> {
    return this.billingService.createPaymentMethod(tenantId, dto);
  }

  @Put('payment-methods/:id')
  @Permissions({ all: ['billing.manage'] })
  @ApiOperation({ summary: 'Update payment method' })
  updatePaymentMethod(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePaymentMethodDto,
  ): Promise<PaymentMethodResponseDto> {
    return this.billingService.updatePaymentMethod(tenantId, id, dto);
  }

  @Put('payment-methods/:id/default')
  @Permissions({ all: ['billing.manage'] })
  @ApiOperation({ summary: 'Set default payment method' })
  setDefaultPaymentMethod(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PaymentMethodResponseDto> {
    return this.billingService.setDefaultPaymentMethod(tenantId, id);
  }

  @Delete('payment-methods/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions({ all: ['billing.manage'] })
  @ApiOperation({ summary: 'Delete payment method' })
  async deletePaymentMethod(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.billingService.deletePaymentMethod(tenantId, id);
  }
}
