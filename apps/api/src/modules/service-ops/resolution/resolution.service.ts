import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma, RequestStatus } from '@prisma/client';
import { RequestService } from '../request/request.service';
import { RequestResponseDto } from '../request/dto/request-response.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConfirmResolutionDto } from './dto/confirm-resolution.dto';
import { ReopenResolutionDto } from './dto/reopen-resolution.dto';
import { REQUEST_EVENTS } from '../request/events/request-events.constants';
import { RequestResolutionReopenedEvent, RequestResolutionSubmittedEvent } from '../request/events/request.events';

@Injectable()
export class ResolutionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly requestService: RequestService,
    private readonly eventEmitter: EventEmitter2,
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

    await this.prisma.auditLog.create({
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
    });

    await this.eventEmitter.emitAsync(
      REQUEST_EVENTS.RESOLUTION_SUBMITTED,
      new RequestResolutionSubmittedEvent(
        tenantId,
        requestId,
        actorId,
        dto.summary,
        dto.notes ?? null,
        closeImmediately,
      ),
    );

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

    await this.prisma.auditLog.create({
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
    });

    await this.eventEmitter.emitAsync(
      REQUEST_EVENTS.RESOLUTION_REOPENED,
      new RequestResolutionReopenedEvent(tenantId, requestId, actorId, dto.reason),
    );

    return updated;
  }
}
