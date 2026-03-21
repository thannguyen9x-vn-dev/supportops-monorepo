import { Injectable } from '@nestjs/common';
import { NotFoundException } from '../../common/exceptions/not-found.exception';
import { PrismaService } from '../../prisma/prisma.service';
import { BillingInfoResponseDto, PaymentMethodResponseDto } from './dto/billing-response.dto';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdateBillingInfoDto } from './dto/update-billing-info.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  async getBillingInfo(tenantId: string): Promise<BillingInfoResponseDto | null> {
    const info = await this.prisma.billingInfo.findUnique({
      where: { tenantId },
    });

    return info ? BillingInfoResponseDto.from(info) : null;
  }

  async upsertBillingInfo(tenantId: string, dto: UpdateBillingInfoDto): Promise<BillingInfoResponseDto> {
    const info = await this.prisma.billingInfo.upsert({
      where: { tenantId },
      create: {
        tenantId,
        companyName: dto.companyName,
        vatNumber: dto.vatNumber,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        zipCode: dto.zipCode,
        country: dto.country,
        email: dto.email,
      },
      update: {
        ...(dto.companyName !== undefined && { companyName: dto.companyName }),
        ...(dto.vatNumber !== undefined && { vatNumber: dto.vatNumber }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.state !== undefined && { state: dto.state }),
        ...(dto.zipCode !== undefined && { zipCode: dto.zipCode }),
        ...(dto.country !== undefined && { country: dto.country }),
        ...(dto.email !== undefined && { email: dto.email }),
      },
    });

    return BillingInfoResponseDto.from(info);
  }

  async listPaymentMethods(tenantId: string): Promise<PaymentMethodResponseDto[]> {
    const methods = await this.prisma.paymentMethod.findMany({
      where: { tenantId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return methods.map((method) => PaymentMethodResponseDto.from(method));
  }

  async createPaymentMethod(
    tenantId: string,
    dto: CreatePaymentMethodDto,
  ): Promise<PaymentMethodResponseDto> {
    const method = await this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.paymentMethod.updateMany({
          where: { tenantId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const hasDefault = await tx.paymentMethod.count({
        where: { tenantId, isDefault: true },
      });

      return tx.paymentMethod.create({
        data: {
          tenantId,
          type: dto.type,
          last4: dto.last4,
          brand: dto.brand,
          expiryMonth: dto.expiryMonth,
          expiryYear: dto.expiryYear,
          isDefault: dto.isDefault ?? hasDefault === 0,
        },
      });
    });

    return PaymentMethodResponseDto.from(method);
  }

  async updatePaymentMethod(
    tenantId: string,
    id: string,
    dto: UpdatePaymentMethodDto,
  ): Promise<PaymentMethodResponseDto> {
    await this.ensurePaymentMethod(tenantId, id);

    const method = await this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.paymentMethod.updateMany({
          where: { tenantId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.paymentMethod.update({
        where: { id },
        data: {
          ...(dto.type !== undefined && { type: dto.type }),
          ...(dto.last4 !== undefined && { last4: dto.last4 }),
          ...(dto.brand !== undefined && { brand: dto.brand }),
          ...(dto.expiryMonth !== undefined && { expiryMonth: dto.expiryMonth }),
          ...(dto.expiryYear !== undefined && { expiryYear: dto.expiryYear }),
          ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
        },
      });
    });

    return PaymentMethodResponseDto.from(method);
  }

  async setDefaultPaymentMethod(tenantId: string, id: string): Promise<PaymentMethodResponseDto> {
    await this.ensurePaymentMethod(tenantId, id);

    const method = await this.prisma.$transaction(async (tx) => {
      await tx.paymentMethod.updateMany({
        where: { tenantId, isDefault: true },
        data: { isDefault: false },
      });

      return tx.paymentMethod.update({
        where: { id },
        data: { isDefault: true },
      });
    });

    return PaymentMethodResponseDto.from(method);
  }

  async deletePaymentMethod(tenantId: string, id: string): Promise<void> {
    const method = await this.ensurePaymentMethod(tenantId, id);

    await this.prisma.$transaction(async (tx) => {
      await tx.paymentMethod.delete({ where: { id } });

      if (!method.isDefault) {
        return;
      }

      const fallback = await tx.paymentMethod.findFirst({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
      });

      if (fallback) {
        await tx.paymentMethod.update({
          where: { id: fallback.id },
          data: { isDefault: true },
        });
      }
    });
  }

  private async ensurePaymentMethod(tenantId: string, id: string) {
    const method = await this.prisma.paymentMethod.findFirst({
      where: { id, tenantId },
    });

    if (!method) {
      throw new NotFoundException('PaymentMethod', id);
    }

    return method;
  }
}
