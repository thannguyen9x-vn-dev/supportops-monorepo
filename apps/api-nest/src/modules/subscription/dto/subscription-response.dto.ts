import { ApiProperty } from '@nestjs/swagger';
import { Plan, Subscription, SubscriptionStatus } from '@prisma/client';

export class PlanResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  price!: number;

  @ApiProperty()
  billingPeriod!: string;

  @ApiProperty()
  maxUsers!: number;

  @ApiProperty({ type: [String] })
  features!: string[];

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  sortOrder!: number;

  static from(plan: Plan): PlanResponseDto {
    return {
      id: plan.id,
      name: plan.name,
      slug: plan.slug,
      price: Number(plan.price),
      billingPeriod: plan.billingPeriod,
      maxUsers: plan.maxUsers,
      features: Array.isArray(plan.features) ? (plan.features as string[]) : [],
      isActive: plan.isActive,
      sortOrder: plan.sortOrder,
    };
  }
}

export class CurrentSubscriptionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty({ enum: SubscriptionStatus })
  status!: SubscriptionStatus;

  @ApiProperty()
  currentPeriodStart!: string;

  @ApiProperty()
  currentPeriodEnd!: string;

  @ApiProperty({ nullable: true })
  cancelledAt!: string | null;

  @ApiProperty({ type: PlanResponseDto })
  plan!: PlanResponseDto;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  static from(subscription: Subscription & { plan: Plan }): CurrentSubscriptionResponseDto {
    return {
      id: subscription.id,
      tenantId: subscription.tenantId,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart.toISOString(),
      currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
      cancelledAt: subscription.cancelledAt?.toISOString() ?? null,
      plan: PlanResponseDto.from(subscription.plan),
      createdAt: subscription.createdAt.toISOString(),
      updatedAt: subscription.updatedAt.toISOString(),
    };
  }
}
