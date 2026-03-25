import { Injectable } from '@nestjs/common';
import { Prisma, RequestPriority, RequestStatus, SlaHealth } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { DashboardRecentActivityResponseDto } from './dto/dashboard-recent-activity-response.dto';
import { DashboardRequestTrendItemDto } from './dto/dashboard-request-trend-response.dto';
import { DashboardSummaryResponseDto } from './dto/dashboard-summary-response.dto';

type StatusGroupResult = {
  status: RequestStatus;
  _count?: {
    _all?: number;
  } | true;
};

type PriorityGroupResult = {
  priority: RequestPriority;
  _count?: {
    _all?: number;
  } | true;
};

type SlaHealthGroupResult = {
  health: SlaHealth;
  _count?: {
    _all?: number;
  } | true;
};

@Injectable()
export class DashboardService {
  private static readonly TEAM_WIDE_PERMISSION = 'request.read.all';
  private static readonly OPEN_STATUSES = [
    RequestStatus.SUBMITTED,
    RequestStatus.TRIAGE,
    RequestStatus.ASSIGNED,
    RequestStatus.IN_PROGRESS,
    RequestStatus.RESOLVED,
    RequestStatus.WAITING_EXTERNAL_VENDOR,
    RequestStatus.REOPENED,
  ] as const;

  private static readonly ASSIGNED_WORK_STATUSES = [
    RequestStatus.ASSIGNED,
    RequestStatus.IN_PROGRESS,
    RequestStatus.WAITING_EXTERNAL_VENDOR,
    RequestStatus.REOPENED,
  ] as const;

  constructor(private readonly prisma: PrismaService) {}

  async summary(tenantId: string, userId: string, permissions: string[]): Promise<DashboardSummaryResponseDto> {
    const startOfToday = this.startOfTodayUtc();
    const requestScopeWhere = this.buildRequestScopeWhere(tenantId, userId, permissions);
    const openWhere = {
      ...requestScopeWhere,
      status: { in: [...DashboardService.OPEN_STATUSES] },
    } satisfies Prisma.ServiceRequestWhereInput;

    const [openRequests, unassigned, resolvedToday, myAssigned, resolvedRequests, statusGroups, priorityGroups, slaGroups] =
      await this.prisma.$transaction([
        this.prisma.serviceRequest.count({
          where: openWhere,
        }),
        this.prisma.serviceRequest.count({
          where: {
            ...openWhere,
            assigneeId: null,
          },
        }),
        this.prisma.serviceRequest.count({
          where: {
            ...requestScopeWhere,
            resolvedAt: { gte: startOfToday },
          },
        }),
        this.prisma.serviceRequest.count({
          where: {
            tenantId,
            assigneeId: userId,
            status: { in: [...DashboardService.ASSIGNED_WORK_STATUSES] },
          },
        }),
        this.prisma.serviceRequest.findMany({
          where: {
            ...requestScopeWhere,
            resolvedAt: { not: null },
          },
          select: {
            createdAt: true,
            submittedAt: true,
            resolvedAt: true,
          },
        }),
        this.prisma.serviceRequest.groupBy({
          by: ['status'],
          where: requestScopeWhere,
          orderBy: { status: 'asc' },
          _count: { _all: true },
        }),
        this.prisma.serviceRequest.groupBy({
          by: ['priority'],
          where: requestScopeWhere,
          orderBy: { priority: 'asc' },
          _count: { _all: true },
        }),
        this.prisma.slaRecord.groupBy({
          by: ['health'],
          where: {
            tenantId,
            request: openWhere,
          },
          orderBy: { health: 'asc' },
          _count: { _all: true },
        }),
      ]);

    const avgResolutionTimeHours = this.averageResolutionHours(resolvedRequests);
    const slaBreached = this.findSlaHealthCount(slaGroups, SlaHealth.BREACHED);

    return {
      scope: this.isTeamScope(permissions) ? 'TEAM' : 'PERSONAL',
      kpis: {
        openRequests,
        unassigned,
        slaBreached,
        resolvedToday,
        avgResolutionTimeHours,
        myAssigned,
      },
      requestsByStatus: this.mapStatusGroups(statusGroups),
      requestsByPriority: this.mapPriorityGroups(priorityGroups),
      slaOverview: {
        onTrack: this.findSlaHealthCount(slaGroups, SlaHealth.ON_TRACK),
        atRisk: this.findSlaHealthCount(slaGroups, SlaHealth.AT_RISK),
        breached: slaBreached,
      },
    };
  }

  async recentActivity(
    tenantId: string,
    userId: string,
    permissions: string[],
  ): Promise<DashboardRecentActivityResponseDto[]> {
    const requestScopeWhere = this.buildRequestScopeWhere(tenantId, userId, permissions);
    const activities = await this.prisma.requestActivity.findMany({
      where: {
        tenantId,
        request: requestScopeWhere,
      },
      include: {
        actor: {
          select: {
            fullName: true,
            firstName: true,
            lastName: true,
          },
        },
        request: {
          select: {
            id: true,
            requestCode: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return activities.map((activity) => ({
      id: activity.id,
      requestId: activity.requestId,
      requestCode: activity.request.requestCode,
      requestTitle: activity.request.title,
      type: activity.type,
      title: activity.title,
      description: activity.description ?? null,
      actorName: this.resolveActorName(activity.actor),
      createdAt: activity.createdAt.toISOString(),
    }));
  }

  async requestTrend(
    tenantId: string,
    userId: string,
    permissions: string[],
    days = 30,
  ): Promise<DashboardRequestTrendItemDto[]> {
    const startDate = new Date();
    startDate.setUTCDate(startDate.getUTCDate() - days);
    startDate.setUTCHours(0, 0, 0, 0);

    const requestScopeWhere = this.buildRequestScopeWhere(tenantId, userId, permissions);

    const [opened, resolved] = await Promise.all([
      this.prisma.serviceRequest.findMany({
        where: { ...requestScopeWhere, createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
      this.prisma.serviceRequest.findMany({
        where: { ...requestScopeWhere, resolvedAt: { gte: startDate } },
        select: { resolvedAt: true },
      }),
    ]);

    const openedByDate = new Map<string, number>();
    const resolvedByDate = new Map<string, number>();

    for (const r of opened) {
      const date = r.createdAt.toISOString().split('T')[0]!;
      openedByDate.set(date, (openedByDate.get(date) ?? 0) + 1);
    }

    for (const r of resolved) {
      if (!r.resolvedAt) continue;
      const date = r.resolvedAt.toISOString().split('T')[0]!;
      resolvedByDate.set(date, (resolvedByDate.get(date) ?? 0) + 1);
    }

    const result: DashboardRequestTrendItemDto[] = [];
    for (let i = days; i >= 0; i--) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      d.setUTCHours(0, 0, 0, 0);
      const dateStr = d.toISOString().split('T')[0]!;
      result.push({
        date: dateStr,
        opened: openedByDate.get(dateStr) ?? 0,
        resolved: resolvedByDate.get(dateStr) ?? 0,
      });
    }

    return result;
  }

  private buildRequestScopeWhere(
    tenantId: string,
    userId: string,
    permissions: string[],
  ): Prisma.ServiceRequestWhereInput {
    const baseWhere: Prisma.ServiceRequestWhereInput = { tenantId };
    if (this.isTeamScope(permissions)) {
      return baseWhere;
    }

    if (permissions.includes('request.start_work')) {
      return {
        ...baseWhere,
        OR: [{ requesterId: userId }, { assigneeId: userId }],
      };
    }

    return {
      ...baseWhere,
      requesterId: userId,
    };
  }

  private isTeamScope(permissions: string[]): boolean {
    return permissions.includes(DashboardService.TEAM_WIDE_PERMISSION);
  }

  private startOfTodayUtc(): Date {
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);
    return now;
  }

  private averageResolutionHours(
    items: Array<{ createdAt: Date; submittedAt: Date | null; resolvedAt: Date | null }>,
  ): number {
    const durations = items
      .map((item) => {
        if (!item.resolvedAt) {
          return null;
        }
        const start = item.submittedAt ?? item.createdAt;
        return (item.resolvedAt.getTime() - start.getTime()) / 3_600_000;
      })
      .filter((value): value is number => value !== null && value >= 0);

    if (durations.length === 0) {
      return 0;
    }

    const average = durations.reduce((sum, value) => sum + value, 0) / durations.length;
    return Number(average.toFixed(1));
  }

  private mapStatusGroups(
    items: StatusGroupResult[],
  ): Array<{ status: string; count: number }> {
    const statusOrder: RequestStatus[] = [
      RequestStatus.DRAFT,
      RequestStatus.SUBMITTED,
      RequestStatus.TRIAGE,
      RequestStatus.ASSIGNED,
      RequestStatus.IN_PROGRESS,
      RequestStatus.WAITING_EXTERNAL_VENDOR,
      RequestStatus.RESOLVED,
      RequestStatus.CLOSED,
      RequestStatus.REOPENED,
      RequestStatus.CANCELLED,
    ];

    return statusOrder.map((status) => ({
      status,
      count: this.resolveGroupCount(items.find((item) => item.status === status)),
    }));
  }

  private mapPriorityGroups(
    items: PriorityGroupResult[],
  ): Array<{ priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'; count: number }> {
    const priorityOrder: RequestPriority[] = [
      RequestPriority.LOW,
      RequestPriority.MEDIUM,
      RequestPriority.HIGH,
      RequestPriority.URGENT,
    ];

    return priorityOrder.map((priority) => ({
      priority,
      count: this.resolveGroupCount(items.find((item) => item.priority === priority)),
    }));
  }

  private findSlaHealthCount(items: SlaHealthGroupResult[], health: SlaHealth): number {
    return this.resolveGroupCount(items.find((item) => item.health === health));
  }

  private resolveGroupCount(item?: { _count?: { _all?: number } | true }): number {
    if (!item || !item._count || item._count === true) {
      return 0;
    }

    return item._count._all ?? 0;
  }

  private resolveActorName(
    actor:
      | {
          fullName: string | null;
          firstName: string;
          lastName: string;
        }
      | null,
  ): string | null {
    if (!actor) {
      return null;
    }

    const fullName = actor.fullName?.trim();
    if (fullName) {
      return fullName;
    }

    return `${actor.firstName} ${actor.lastName}`.trim() || null;
  }
}
