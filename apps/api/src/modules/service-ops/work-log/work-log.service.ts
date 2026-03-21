import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PageMeta, pageMetaOf } from '../../../common/dto/page-meta.dto';
import { ForbiddenException } from '../../../common/exceptions/forbidden.exception';
import { NotFoundException } from '../../../common/exceptions/not-found.exception';
import { PrismaService } from '../../../prisma/prisma.service';
import { WorkLogQueryDto } from './dto/work-log-query.dto';
import { WorkLogResponseDto } from './dto/work-log-response.dto';

@Injectable()
export class WorkLogService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    tenantId: string,
    actorId: string,
    permissions: string[],
    requestId: string,
    query: WorkLogQueryDto,
  ): Promise<{ data: WorkLogResponseDto[]; meta: PageMeta }> {
    await this.assertCanReadRequest(tenantId, actorId, permissions, requestId);

    const page = query.page ?? 1;
    const size = query.size ?? 20;
    const skip = (page - 1) * size;

    const where: Prisma.WorkLogWhereInput = {
      tenantId,
      requestId,
      ...(query.authorId ? { authorId: query.authorId } : {}),
      ...(query.search
        ? {
            content: { contains: query.search, mode: 'insensitive' },
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.workLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: size }),
      this.prisma.workLog.count({ where }),
    ]);

    return {
      data: items.map((item) => WorkLogResponseDto.from(item)),
      meta: pageMetaOf({ page, size, total }),
    };
  }

  async detail(
    tenantId: string,
    actorId: string,
    permissions: string[],
    requestId: string,
    workLogId: string,
  ): Promise<WorkLogResponseDto> {
    await this.assertCanReadRequest(tenantId, actorId, permissions, requestId);

    const workLog = await this.prisma.workLog.findFirst({
      where: {
        id: workLogId,
        tenantId,
        requestId,
      },
    });

    if (!workLog) {
      throw new NotFoundException('WorkLog', workLogId);
    }

    return WorkLogResponseDto.from(workLog);
  }

  private async assertCanReadRequest(
    tenantId: string,
    actorId: string,
    permissions: string[],
    requestId: string,
  ): Promise<void> {
    const request = await this.prisma.serviceRequest.findFirst({
      where: {
        id: requestId,
        tenantId,
      },
      select: {
        id: true,
        requesterId: true,
        assigneeId: true,
      },
    });

    if (!request) {
      throw new NotFoundException('ServiceRequest', requestId);
    }

    if (permissions.includes('request.read.all')) {
      return;
    }

    if (request.requesterId === actorId || request.assigneeId === actorId) {
      return;
    }

    throw new ForbiddenException('You do not have permission to read work logs of this request');
  }
}
