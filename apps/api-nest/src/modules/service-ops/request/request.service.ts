import { Injectable } from '@nestjs/common';
import {
  Prisma,
  RequestActivityType,
  RequestImpactLevel,
  RequestPriority,
  RequestStatus,
  RequestUrgency,
  SlaHealth,
  SlaType,
  SourceChannel,
} from '@prisma/client';
import { ConflictException } from '../../../common/exceptions/conflict.exception';
import { NotFoundException } from '../../../common/exceptions/not-found.exception';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateRequestDto, CreateRequestMode } from './dto/create-request.dto';
import { RequestResponseDto } from './dto/request-response.dto';

@Injectable()
export class RequestService {
  private static readonly ASSIGNMENT_SLA_MINUTES = 30;
  private static readonly RESOLUTION_SLA_MINUTES = 8 * 60;

  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, requesterId: string, dto: CreateRequestDto): Promise<RequestResponseDto> {
    const serviceType = await this.prisma.serviceType.findFirst({
      where: {
        id: dto.serviceTypeId,
        tenantId,
        isActive: true,
      },
      select: { id: true },
    });

    if (!serviceType) {
      throw new NotFoundException('ServiceType', dto.serviceTypeId);
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: requesterId,
        tenantId,
        isActive: true,
      },
      select: { id: true },
    });

    if (!user) {
      throw new ConflictException('INVALID_REQUESTER', 'Requester is not active in current tenant');
    }

    const now = new Date();
    const shouldSubmit = dto.mode === CreateRequestMode.SUBMIT;

    const created = await this.prisma.$transaction(async (tx) => {
      const requestCode = shouldSubmit ? await this.nextRequestCode(tx, tenantId, now) : null;
      const requestStatus = shouldSubmit ? RequestStatus.SUBMITTED : RequestStatus.DRAFT;

      const createdRequest = await tx.serviceRequest.create({
        data: {
          tenantId,
          requestCode,
          title: dto.title.trim(),
          description: dto.description.trim(),
          serviceTypeId: dto.serviceTypeId,
          status: requestStatus,
          priority: dto.priority ?? RequestPriority.MEDIUM,
          impactLevel: dto.impactLevel ?? RequestImpactLevel.MEDIUM,
          urgency: dto.urgency ?? RequestUrgency.MEDIUM,
          locationId: dto.locationId,
          assetId: dto.assetId ?? null,
          requesterId,
          sourceChannel: dto.sourceChannel ?? SourceChannel.WEB,
          isInternalOnly: dto.isInternalOnly ?? false,
          submittedAt: shouldSubmit ? now : null,
        },
      });

      await tx.requestActivity.create({
        data: {
          tenantId,
          requestId: createdRequest.id,
          type: RequestActivityType.REQUEST_CREATED,
          title: 'Request created',
          description: shouldSubmit ? 'Request created and submitted' : 'Request saved as draft',
          actorId: requesterId,
        },
      });

      if (shouldSubmit) {
        await tx.requestActivity.create({
          data: {
            tenantId,
            requestId: createdRequest.id,
            type: RequestActivityType.STATUS_CHANGED,
            title: 'Status changed: Draft -> Submitted',
            description: 'Requester submitted the request',
            actorId: requesterId,
            metadata: {
              from: RequestStatus.DRAFT,
              to: RequestStatus.SUBMITTED,
            },
          },
        });

        await tx.slaRecord.createMany({
          data: [
            {
              tenantId,
              requestId: createdRequest.id,
              type: SlaType.ASSIGNMENT,
              health: SlaHealth.ON_TRACK,
              targetAt: this.addMinutes(now, RequestService.ASSIGNMENT_SLA_MINUTES),
            },
            {
              tenantId,
              requestId: createdRequest.id,
              type: SlaType.RESOLUTION,
              health: SlaHealth.ON_TRACK,
              targetAt: this.addMinutes(now, RequestService.RESOLUTION_SLA_MINUTES),
            },
          ],
        });
      }

      await tx.auditLog.create({
        data: {
          tenantId,
          requestId: createdRequest.id,
          entityType: 'REQUEST',
          entityId: createdRequest.id,
          action: shouldSubmit ? 'REQUEST_SUBMITTED' : 'REQUEST_DRAFT_SAVED',
          actorId: requesterId,
          beforeData: Prisma.JsonNull,
          afterData: {
            status: createdRequest.status,
            requestCode: createdRequest.requestCode,
            title: createdRequest.title,
            serviceTypeId: createdRequest.serviceTypeId,
            priority: createdRequest.priority,
          },
        },
      });

      return createdRequest;
    });

    return RequestResponseDto.from(created);
  }

  private async nextRequestCode(tx: Prisma.TransactionClient, tenantId: string, now: Date): Promise<string> {
    const year = now.getUTCFullYear();

    const sequence = await tx.requestSequence.upsert({
      where: {
        tenantId_year: { tenantId, year },
      },
      create: {
        tenantId,
        year,
        lastNumber: 1,
      },
      update: {
        lastNumber: {
          increment: 1,
        },
      },
      select: {
        lastNumber: true,
      },
    });

    return `REQ-${year}-${String(sequence.lastNumber).padStart(5, '0')}`;
  }

  private addMinutes(base: Date, minutes: number): Date {
    return new Date(base.getTime() + minutes * 60_000);
  }
}
