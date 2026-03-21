import { Injectable } from '@nestjs/common';
import { Prisma, SubscriptionStatus } from '@prisma/client';
import { ConflictException } from '../../common/exceptions/conflict.exception';
import { NotFoundException } from '../../common/exceptions/not-found.exception';
import { PrismaService } from '../../prisma/prisma.service';
import { ChangePlanDto } from './dto/change-plan.dto';
import { CurrentSubscriptionResponseDto, PlanResponseDto } from './dto/subscription-response.dto';

@Injectable()
export class SubscriptionService {
  private static readonly subscriptionWithPlanSelect = {
    include: { plan: true },
  } satisfies Prisma.SubscriptionDefaultArgs;

  constructor(private readonly prisma: PrismaService) {}

  async listPlans(): Promise<PlanResponseDto[]> {
    const plans = await this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return plans.map((plan) => PlanResponseDto.from(plan));
  }

  async getCurrent(tenantId: string): Promise<CurrentSubscriptionResponseDto> {
    const subscription = await this.getLatestSubscription(tenantId);

    if (!subscription) {
      throw new NotFoundException('Subscription', tenantId);
    }

    return CurrentSubscriptionResponseDto.from(subscription);
  }

  async changePlan(
    tenantId: string,
    dto: ChangePlanDto,
  ): Promise<CurrentSubscriptionResponseDto> {
    const plan = await this.prisma.plan.findFirst({
      where: {
        id: dto.planId,
        isActive: true,
      },
    });

    if (!plan) {
      throw new NotFoundException('Plan', dto.planId);
    }

    const now = new Date();
    const nextPeriodEnd = this.addDays(now, 30);

    const subscription = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.subscription.findFirst({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
      });

      if (!existing) {
        return tx.subscription.create({
          data: {
            tenantId,
            planId: plan.id,
            status: SubscriptionStatus.ACTIVE,
            currentPeriodStart: now,
            currentPeriodEnd: nextPeriodEnd,
          },
          ...SubscriptionService.subscriptionWithPlanSelect,
        });
      }

      return tx.subscription.update({
        where: { id: existing.id },
        data: {
          planId: plan.id,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: now,
          currentPeriodEnd: nextPeriodEnd,
          cancelledAt: null,
        },
        ...SubscriptionService.subscriptionWithPlanSelect,
      });
    });

    return CurrentSubscriptionResponseDto.from(subscription);
  }

  async cancel(tenantId: string): Promise<CurrentSubscriptionResponseDto> {
    const existing = await this.getLatestSubscription(tenantId);
    if (!existing) {
      throw new NotFoundException('Subscription', tenantId);
    }

    if (existing.status === SubscriptionStatus.CANCELLED) {
      throw new ConflictException('SUBSCRIPTION_ALREADY_CANCELLED', 'Subscription is already cancelled');
    }

    const updated = await this.prisma.subscription.update({
      where: { id: existing.id },
      data: {
        status: SubscriptionStatus.CANCELLED,
        cancelledAt: new Date(),
      },
      ...SubscriptionService.subscriptionWithPlanSelect,
    });

    return CurrentSubscriptionResponseDto.from(updated);
  }

  async reactivate(tenantId: string): Promise<CurrentSubscriptionResponseDto> {
    const existing = await this.getLatestSubscription(tenantId);
    if (!existing) {
      throw new NotFoundException('Subscription', tenantId);
    }

    if (existing.status !== SubscriptionStatus.CANCELLED) {
      throw new ConflictException('SUBSCRIPTION_NOT_CANCELLED', 'Only cancelled subscriptions can be reactivated');
    }

    const updated = await this.prisma.subscription.update({
      where: { id: existing.id },
      data: {
        status: SubscriptionStatus.ACTIVE,
        cancelledAt: null,
      },
      ...SubscriptionService.subscriptionWithPlanSelect,
    });

    return CurrentSubscriptionResponseDto.from(updated);
  }

  private async getLatestSubscription(
    tenantId: string,
  ): Promise<Prisma.SubscriptionGetPayload<typeof SubscriptionService.subscriptionWithPlanSelect> | null> {
    return this.prisma.subscription.findFirst({
      where: { tenantId },
      ...SubscriptionService.subscriptionWithPlanSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  private addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  }
}
