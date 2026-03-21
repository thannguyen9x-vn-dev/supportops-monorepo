import { Injectable } from '@nestjs/common';
import { Prisma, RequestActivityType, RequestStatus } from '@prisma/client';
import { PageMeta, pageMetaOf } from '../../../common/dto/page-meta.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { RequestResponseDto } from '../request/dto/request-response.dto';
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

    await this.prisma.$transaction([
      this.prisma.requestActivity.create({
        data: {
          tenantId,
          requestId,
          type: RequestActivityType.SLA_BREACHED,
          title: 'Request escalated',
          description: dto.reason ?? 'Escalated by operator',
          actorId,
          metadata: {
            isAuto: false,
            reason: dto.reason ?? null,
          },
        },
      }),
      this.prisma.auditLog.create({
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
      }),
    ]);

    return updated;
  }
}
