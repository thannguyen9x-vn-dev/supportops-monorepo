import { Injectable } from '@nestjs/common';
import { MembershipStatus, Prisma, RequestStatus, UserStatus } from '@prisma/client';
import { ForbiddenException } from '../../../common/exceptions/forbidden.exception';
import { PrismaService } from '../../../prisma/prisma.service';
import { ReportOverviewQueryDto } from './dto/report-overview-query.dto';
import { ReportOverviewResponseDto, ReportVolumeTrendPointDto } from './dto/report-overview-response.dto';

type SystemRoleCode = 'EMPLOYEE' | 'OPS_COORDINATOR' | 'TECHNICIAN' | 'TENANT_ADMIN';

type CountByStatus = { status: string; _count: { _all: number } };
type CountByPriority = { priority: string; _count: { _all: number } };
type CountByServiceType = { serviceTypeId: string; _count: { _all: number } };

@Injectable()
export class ReportingService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(
    tenantId: string,
    actorId: string,
    query: ReportOverviewQueryDto,
  ): Promise<ReportOverviewResponseDto> {
    await this.ensureCanReadReport(tenantId, actorId);

    const fromDate = new Date(query.from);
    fromDate.setUTCHours(0, 0, 0, 0);
    const toDate = new Date(query.to);
    toDate.setUTCHours(23, 59, 59, 999);

    const baseWhere: Prisma.ServiceRequestWhereInput = {
      tenantId,
      createdAt: { gte: fromDate, lte: toDate },
      ...(query.assigneeId ? { assigneeId: query.assigneeId } : {}),
    };

    const [
      totalRequests,
      byStatus,
      byPriority,
      byServiceType,
      slaBreachData,
      volumeTrend,
      avgResponseMinutes,
    ] = await Promise.all([
      this.prisma.serviceRequest.count({ where: baseWhere }),
      this.prisma.serviceRequest.groupBy({
        by: ['status'],
        where: baseWhere,
        _count: { _all: true },
      }) as unknown as Promise<CountByStatus[]>,
      this.prisma.serviceRequest.groupBy({
        by: ['priority'],
        where: baseWhere,
        _count: { _all: true },
      }) as unknown as Promise<CountByPriority[]>,
      this.prisma.serviceRequest.groupBy({
        by: ['serviceTypeId'],
        where: baseWhere,
        _count: { _all: true },
      }) as unknown as Promise<CountByServiceType[]>,
      this.prisma.slaRecord.findMany({
        where: {
          tenantId,
          request: {
            createdAt: { gte: fromDate, lte: toDate },
            ...(query.assigneeId ? { assigneeId: query.assigneeId } : {}),
          },
        },
        select: { isBreached: true },
      }),
      this.buildVolumeTrend(tenantId, fromDate, toDate, query.assigneeId),
      this.calcAvgResponseMinutes(tenantId, fromDate, toDate, query.assigneeId),
    ]);

    const serviceTypeIds = byServiceType.map((item) => item.serviceTypeId);
    const serviceTypes = serviceTypeIds.length
      ? await this.prisma.serviceType.findMany({
          where: {
            tenantId,
            id: { in: serviceTypeIds },
          },
          select: {
            id: true,
            name: true,
          },
        })
      : [];

    const serviceTypeNameMap = new Map(serviceTypes.map((item) => [item.id, item.name]));

    const totalSla = slaBreachData.length;
    const breached = slaBreachData.filter((item) => item.isBreached).length;
    const slaComplianceRate = totalSla === 0 ? 100 : Number((((totalSla - breached) / totalSla) * 100).toFixed(2));

    return {
      totalRequests,
      byStatus: byStatus.map((item) => ({ status: item.status, count: item._count._all })),
      byPriority: byPriority.map((item) => ({ priority: item.priority, count: item._count._all })),
      byServiceType: byServiceType.map((item) => ({
        serviceTypeId: item.serviceTypeId,
        serviceTypeName: serviceTypeNameMap.get(item.serviceTypeId) ?? item.serviceTypeId,
        count: item._count._all,
      })),
      slaComplianceRate,
      volumeTrend,
      avgResponseMinutes,
    };
  }

  private async ensureCanReadReport(tenantId: string, actorId: string): Promise<void> {
    const roleCode = await this.getActorRole(tenantId, actorId);
    if (roleCode !== 'OPS_COORDINATOR' && roleCode !== 'TENANT_ADMIN') {
      throw new ForbiddenException('Insufficient role to read reports');
    }
  }

  private async buildVolumeTrend(
    tenantId: string,
    fromDate: Date,
    toDate: Date,
    assigneeId?: string,
  ): Promise<ReportVolumeTrendPointDto[]> {
    const where: Prisma.ServiceRequestWhereInput = {
      tenantId,
      createdAt: { gte: fromDate, lte: toDate },
      ...(assigneeId ? { assigneeId } : {}),
    };

    const [createdRows, resolvedRows] = await Promise.all([
      this.prisma.serviceRequest.findMany({
        where,
        select: { createdAt: true },
      }),
      this.prisma.serviceRequest.findMany({
        where: {
          tenantId,
          resolvedAt: { gte: fromDate, lte: toDate },
          status: { in: [RequestStatus.RESOLVED, RequestStatus.CLOSED] },
          ...(assigneeId ? { assigneeId } : {}),
        },
        select: { resolvedAt: true },
      }),
    ]);

    const createdMap = new Map<string, number>();
    const resolvedMap = new Map<string, number>();

    createdRows.forEach((row) => {
      const key = row.createdAt.toISOString().slice(0, 10);
      createdMap.set(key, (createdMap.get(key) ?? 0) + 1);
    });

    resolvedRows.forEach((row) => {
      if (!row.resolvedAt) {
        return;
      }
      const key = row.resolvedAt.toISOString().slice(0, 10);
      resolvedMap.set(key, (resolvedMap.get(key) ?? 0) + 1);
    });

    const result: ReportVolumeTrendPointDto[] = [];
    const cursor = new Date(fromDate);
    cursor.setUTCHours(0, 0, 0, 0);

    while (cursor <= toDate) {
      const key = cursor.toISOString().slice(0, 10);
      result.push({
        date: key,
        created: createdMap.get(key) ?? 0,
        resolved: resolvedMap.get(key) ?? 0,
      });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return result;
  }

  private async calcAvgResponseMinutes(
    tenantId: string,
    fromDate: Date,
    toDate: Date,
    assigneeId?: string,
  ): Promise<number> {
    const rows = await this.prisma.serviceRequest.findMany({
      where: {
        tenantId,
        createdAt: { gte: fromDate, lte: toDate },
        assignedAt: { not: null },
        submittedAt: { not: null },
        ...(assigneeId ? { assigneeId } : {}),
      },
      select: {
        submittedAt: true,
        assignedAt: true,
      },
    });

    const values = rows
      .map((row) => {
        if (!row.submittedAt || !row.assignedAt) {
          return null;
        }
        return (row.assignedAt.getTime() - row.submittedAt.getTime()) / 60000;
      })
      .filter((value): value is number => value !== null && value >= 0);

    if (values.length === 0) {
      return 0;
    }

    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    return Number(average.toFixed(2));
  }

  private async getActorRole(tenantId: string, actorId: string): Promise<SystemRoleCode> {
    const membership = await this.prisma.membership.findFirst({
      where: {
        tenantId,
        userId: actorId,
        status: MembershipStatus.ACTIVE,
        user: { status: UserStatus.ACTIVE },
      },
      select: {
        roleCode: true,
      },
    });

    if (
      membership?.roleCode === 'EMPLOYEE' ||
      membership?.roleCode === 'OPS_COORDINATOR' ||
      membership?.roleCode === 'TECHNICIAN' ||
      membership?.roleCode === 'TENANT_ADMIN'
    ) {
      return membership.roleCode;
    }

    return 'EMPLOYEE';
  }
}
