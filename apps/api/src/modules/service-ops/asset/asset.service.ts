import { Injectable } from '@nestjs/common';
import { Prisma, RequestStatus } from '@prisma/client';
import { PageMeta, pageMetaOf } from '../../../common/dto/page-meta.dto';
import { NotFoundException } from '../../../common/exceptions/not-found.exception';
import { PrismaService } from '../../../prisma/prisma.service';
import { RequestResponseDto } from '../request/dto/request-response.dto';
import { AssetDetailQueryDto } from './dto/asset-detail-query.dto';
import { AssetDetailResponseDto } from './dto/asset-detail-response.dto';
import { AssetQueryDto } from './dto/asset-query.dto';
import { AssetSummaryResponseDto } from './dto/asset-summary-response.dto';

interface AggregatedAsset {
  id: string;
  requestCount: number;
  openRequestCount: number;
  lastSeenAt: Date;
}

@Injectable()
export class AssetService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    tenantId: string,
    actorId: string,
    permissions: string[],
    query: AssetQueryDto,
  ): Promise<{ data: AssetSummaryResponseDto[]; meta: PageMeta }> {
    const page = query.page ?? 1;
    const size = query.size ?? 20;

    const rows = await this.prisma.serviceRequest.findMany({
      where: {
        tenantId,
        assetId: {
          not: null,
          ...(query.search ? { contains: query.search, mode: 'insensitive' } : {}),
        },
        ...this.readScopeWhere(actorId, permissions),
      },
      select: {
        assetId: true,
        status: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    const aggregated = this.aggregate(rows);
    const total = aggregated.length;
    const start = (page - 1) * size;
    const sliced = aggregated.slice(start, start + size);

    return {
      data: sliced.map((item) => ({
        id: item.id,
        requestCount: item.requestCount,
        openRequestCount: item.openRequestCount,
        lastSeenAt: item.lastSeenAt.toISOString(),
      })),
      meta: pageMetaOf({ page, size, total }),
    };
  }

  async detail(
    tenantId: string,
    actorId: string,
    permissions: string[],
    assetId: string,
    query: AssetDetailQueryDto,
  ): Promise<AssetDetailResponseDto> {
    const page = query.page ?? 1;
    const size = query.size ?? 20;
    const skip = (page - 1) * size;

    const baseWhere: Prisma.ServiceRequestWhereInput = {
      tenantId,
      assetId,
      ...this.readScopeWhere(actorId, permissions),
    };

    const [summaryRows, requests, total] = await this.prisma.$transaction([
      this.prisma.serviceRequest.findMany({
        where: baseWhere,
        select: {
          assetId: true,
          status: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.serviceRequest.findMany({
        where: {
          ...baseWhere,
          ...(query.status ? { status: query.status } : {}),
        },
        include: {
          serviceType: {
            select: {
              code: true,
              name: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: size,
      }),
      this.prisma.serviceRequest.count({
        where: {
          ...baseWhere,
          ...(query.status ? { status: query.status } : {}),
        },
      }),
    ]);

    const aggregated = this.aggregate(summaryRows);
    const summary = aggregated.find((item) => item.id === assetId);
    if (!summary) {
      throw new NotFoundException('Asset', assetId);
    }

    return {
      id: summary.id,
      requestCount: summary.requestCount,
      openRequestCount: summary.openRequestCount,
      lastSeenAt: summary.lastSeenAt.toISOString(),
      requests: requests.map((item) => RequestResponseDto.from(item)),
      meta: pageMetaOf({ page, size, total }),
    };
  }

  private aggregate(
    rows: Array<{ assetId: string | null; status: RequestStatus; updatedAt: Date }>,
  ): AggregatedAsset[] {
    const map = new Map<string, AggregatedAsset>();

    for (const row of rows) {
      if (!row.assetId) {
        continue;
      }

      const current =
        map.get(row.assetId) ??
        ({
          id: row.assetId,
          requestCount: 0,
          openRequestCount: 0,
          lastSeenAt: row.updatedAt,
        } satisfies AggregatedAsset);

      current.requestCount += 1;
      if (this.isOpenStatus(row.status)) {
        current.openRequestCount += 1;
      }
      if (row.updatedAt.getTime() > current.lastSeenAt.getTime()) {
        current.lastSeenAt = row.updatedAt;
      }

      map.set(row.assetId, current);
    }

    return Array.from(map.values()).sort((a, b) => b.lastSeenAt.getTime() - a.lastSeenAt.getTime());
  }

  private readScopeWhere(actorId: string, permissions: string[]): Prisma.ServiceRequestWhereInput {
    const canReadAll = permissions.includes('request.read.all');
    const canReadAssigned = permissions.includes('request.start_work') && !canReadAll;

    if (canReadAll) {
      return {};
    }

    if (canReadAssigned) {
      return {
        OR: [{ requesterId: actorId }, { assigneeId: actorId }],
      };
    }

    return { requesterId: actorId };
  }

  private isOpenStatus(status: RequestStatus): boolean {
    return status !== RequestStatus.CLOSED && status !== RequestStatus.CANCELLED;
  }
}
