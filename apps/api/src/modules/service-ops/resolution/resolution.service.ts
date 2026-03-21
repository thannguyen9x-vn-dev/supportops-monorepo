import { Injectable } from '@nestjs/common';
import { Prisma, RequestActivityType, RequestStatus } from '@prisma/client';
import { RequestService } from '../request/request.service';
import { RequestResponseDto } from '../request/dto/request-response.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConfirmResolutionDto } from './dto/confirm-resolution.dto';
import { ReopenResolutionDto } from './dto/reopen-resolution.dto';

@Injectable()
export class ResolutionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly requestService: RequestService,
  ) {}

  async confirm(
    tenantId: string,
    actorId: string,
    permissions: string[],
    requestId: string,
    dto: ConfirmResolutionDto,
  ): Promise<RequestResponseDto> {
    const closeImmediately = dto.closeImmediately ?? false;
    const targetStatus = closeImmediately ? RequestStatus.CLOSED : RequestStatus.RESOLVED;

    const updated = await this.requestService.updateStatus(tenantId, actorId, permissions, requestId, {
      status: targetStatus,
    });

    await this.prisma.$transaction([
      this.prisma.requestActivity.create({
        data: {
          tenantId,
          requestId,
          type: RequestActivityType.RESOLUTION_SUBMITTED,
          title: closeImmediately ? 'Resolution confirmed and request closed' : 'Resolution confirmed',
          description: dto.summary,
          actorId,
          metadata: {
            summary: dto.summary,
            notes: dto.notes ?? null,
            closeImmediately,
          },
        },
      }),
      this.prisma.auditLog.create({
        data: {
          tenantId,
          requestId,
          entityType: 'REQUEST_RESOLUTION',
          entityId: requestId,
          action: closeImmediately ? 'REQUEST_CLOSED_WITH_RESOLUTION' : 'REQUEST_RESOLVED',
          actorId,
          beforeData: Prisma.JsonNull,
          afterData: {
            summary: dto.summary,
            notes: dto.notes ?? null,
            status: updated.status,
          },
        },
      }),
    ]);

    return updated;
  }

  async reopen(
    tenantId: string,
    actorId: string,
    permissions: string[],
    requestId: string,
    dto: ReopenResolutionDto,
  ): Promise<RequestResponseDto> {
    const updated = await this.requestService.updateStatus(tenantId, actorId, permissions, requestId, {
      status: RequestStatus.REOPENED,
    });

    await this.prisma.$transaction([
      this.prisma.requestActivity.create({
        data: {
          tenantId,
          requestId,
          type: RequestActivityType.STATUS_CHANGED,
          title: 'Resolution reopened',
          description: dto.reason,
          actorId,
          metadata: {
            reason: dto.reason,
          },
        },
      }),
      this.prisma.auditLog.create({
        data: {
          tenantId,
          requestId,
          entityType: 'REQUEST_RESOLUTION',
          entityId: requestId,
          action: 'REQUEST_REOPENED',
          actorId,
          beforeData: Prisma.JsonNull,
          afterData: {
            reason: dto.reason,
            status: updated.status,
          },
        },
      }),
    ]);

    return updated;
  }
}
