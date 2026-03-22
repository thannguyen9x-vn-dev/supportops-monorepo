import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma, RequestStatus } from '@prisma/client';
import { PageMeta, pageMetaOf } from '../../../common/dto/page-meta.dto';
import { NotFoundException } from '../../../common/exceptions/not-found.exception';
import { PrismaService } from '../../../prisma/prisma.service';
import { RequestResponseDto } from '../request/dto/request-response.dto';
import { REQUEST_EVENTS } from '../request/events/request-events.constants';
import { RequestEscalatedEvent } from '../request/events/request.events';
import { RequestService } from '../request/request.service';
import { EscalationEventQueryDto } from './dto/escalation-event-query.dto';
import { EscalationEventResponseDto } from './dto/escalation-event-response.dto';
import { EscalationRuleResponseDto } from './dto/escalation-rule-response.dto';
import { TriggerEscalationDto } from './dto/trigger-escalation.dto';

@Injectable()
export class EscalationService {
  private static readonly DEFAULT_ESCALATION_MINUTES = 60;

  constructor(
    private readonly prisma: PrismaService,
    private readonly requestService: RequestService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async listRules(tenantId: string): Promise<EscalationRuleResponseDto[]> {
    const serviceTypes = await this.prisma.serviceType.findMany({
      where: { tenantId, isActive: true },
      select: { code: true },
      orderBy: { code: 'asc' },
    });

    const codes = serviceTypes.length > 0 ? serviceTypes.map((item) => item.code) : ['GENERAL'];

    return codes.map((code) => ({
      id: `escalation-rule-${code.toLowerCase()}`,
      serviceTypeCode: code,
      whenMinutesOverdue: EscalationService.DEFAULT_ESCALATION_MINUTES,
      targetStatus: RequestStatus.WAITING_EXTERNAL_VENDOR,
      notifyRoleCode: 'OPS_COORDINATOR',
    }));
  }

  async detailRule(tenantId: string, id: string): Promise<EscalationRuleResponseDto> {
    const serviceTypeCode = id.replace(/^escalation-rule-/i, '').trim().toUpperCase();
    if (!serviceTypeCode) {
      throw new NotFoundException('EscalationRule', id);
    }

    const serviceType = await this.prisma.serviceType.findFirst({
      where: {
        tenantId,
        code: serviceTypeCode,
        isActive: true,
      },
      select: { code: true },
    });

    if (!serviceType && serviceTypeCode !== 'GENERAL') {
      throw new NotFoundException('EscalationRule', id);
    }

    const code = serviceType?.code ?? 'GENERAL';

    return {
      id: `escalation-rule-${code.toLowerCase()}`,
      serviceTypeCode: code,
      whenMinutesOverdue: EscalationService.DEFAULT_ESCALATION_MINUTES,
      targetStatus: RequestStatus.WAITING_EXTERNAL_VENDOR,
      notifyRoleCode: 'OPS_COORDINATOR',
    };
  }

  async listEvents(
    tenantId: string,
    query: EscalationEventQueryDto,
  ): Promise<{ data: EscalationEventResponseDto[]; meta: PageMeta }> {
    const page = query.page ?? 1;
    const size = query.size ?? 20;
    const skip = (page - 1) * size;

    const where: Prisma.AuditLogWhereInput = {
      tenantId,
      action: { in: ['REQUEST_ESCALATED', 'REQUEST_AUTO_ESCALATED'] },
      ...(query.requestId ? { requestId: query.requestId } : {}),
      ...(query.isAuto === undefined
        ? {}
        : query.isAuto
          ? { action: 'REQUEST_AUTO_ESCALATED' }
          : { action: 'REQUEST_ESCALATED' }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: size,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: items.map((item) => EscalationEventResponseDto.from(item)),
      meta: pageMetaOf({ page, size, total }),
    };
  }

  async triggerManual(
    tenantId: string,
    actorId: string,
    permissions: string[],
    requestId: string,
    dto: TriggerEscalationDto,
  ): Promise<RequestResponseDto> {
    const updated = await this.requestService.updateStatus(tenantId, actorId, permissions, requestId, {
      status: RequestStatus.WAITING_EXTERNAL_VENDOR,
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        requestId,
        entityType: 'REQUEST_ESCALATION',
        entityId: requestId,
        action: 'REQUEST_ESCALATED',
        actorId,
        beforeData: Prisma.JsonNull,
        afterData: {
          status: updated.status,
          isAuto: false,
          reason: dto.reason ?? null,
        },
      },
    });

    await this.eventEmitter.emitAsync(
      REQUEST_EVENTS.ESCALATED,
      new RequestEscalatedEvent(
        tenantId,
        requestId,
        new Date(),
        actorId,
        dto.reason ?? null,
        false,
      ),
    );

    return updated;
  }
}
