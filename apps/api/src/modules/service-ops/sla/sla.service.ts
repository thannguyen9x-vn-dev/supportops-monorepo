import { Injectable } from '@nestjs/common';
import { Prisma, SlaHealth } from '@prisma/client';
import { PageMeta, pageMetaOf } from '../../../common/dto/page-meta.dto';
import { NotFoundException } from '../../../common/exceptions/not-found.exception';
import { PrismaService } from '../../../prisma/prisma.service';
import { SlaPolicyResponseDto } from './dto/sla-policy-response.dto';
import { SlaViolationQueryDto } from './dto/sla-violation-query.dto';
import { SlaViolationResponseDto } from './dto/sla-violation-response.dto';

@Injectable()
export class SlaService {
  private static readonly ASSIGNMENT_RESPONSE_MINUTES = 30;
  private static readonly RESOLUTION_TARGET_MINUTES = 8 * 60;
  private static readonly ESCALATION_AFTER_MINUTES = 60;

  constructor(private readonly prisma: PrismaService) {}

  async listPolicies(tenantId: string): Promise<SlaPolicyResponseDto[]> {
    const serviceTypes = await this.prisma.serviceType.findMany({
      where: { tenantId, isActive: true },
      select: { code: true },
      orderBy: { code: 'asc' },
    });

    const codes = serviceTypes.length > 0 ? serviceTypes.map((item) => item.code) : ['GENERAL'];

    return codes.map((code) => ({
      id: `policy-${code.toLowerCase()}`,
      serviceTypeCode: code,
      responseMinutes: SlaService.ASSIGNMENT_RESPONSE_MINUTES,
      resolutionMinutes: SlaService.RESOLUTION_TARGET_MINUTES,
      escalationAfterMinutes: SlaService.ESCALATION_AFTER_MINUTES,
    }));
  }

  async detailPolicy(tenantId: string, id: string): Promise<SlaPolicyResponseDto> {
    const serviceTypeCode = id.replace(/^policy-/i, '').trim().toUpperCase();
    if (!serviceTypeCode) {
      throw new NotFoundException('SlaPolicy', id);
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
      throw new NotFoundException('SlaPolicy', id);
    }

    const code = serviceType?.code ?? 'GENERAL';

    return {
      id: `policy-${code.toLowerCase()}`,
      serviceTypeCode: code,
      responseMinutes: SlaService.ASSIGNMENT_RESPONSE_MINUTES,
      resolutionMinutes: SlaService.RESOLUTION_TARGET_MINUTES,
      escalationAfterMinutes: SlaService.ESCALATION_AFTER_MINUTES,
    };
  }

  async listViolations(
    tenantId: string,
    query: SlaViolationQueryDto,
  ): Promise<{ data: SlaViolationResponseDto[]; meta: PageMeta }> {
    const page = query.page ?? 1;
    const size = query.size ?? 20;
    const skip = (page - 1) * size;

    const where: Prisma.SlaRecordWhereInput = {
      tenantId,
      ...(query.type ? { type: query.type } : {}),
      ...(query.requestId ? { requestId: query.requestId } : {}),
      OR: [{ isBreached: true }, { health: SlaHealth.BREACHED }, { breachedAt: { not: null } }],
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.slaRecord.findMany({
        where,
        include: {
          request: {
            select: {
              requestCode: true,
              title: true,
              status: true,
            },
          },
        },
        orderBy: [{ breachedAt: 'desc' }, { updatedAt: 'desc' }],
        skip,
        take: size,
      }),
      this.prisma.slaRecord.count({ where }),
    ]);

    return {
      data: items.map((item) => SlaViolationResponseDto.from(item)),
      meta: pageMetaOf({ page, size, total }),
    };
  }
}
