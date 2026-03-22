import { Injectable, Logger } from '@nestjs/common';
import { ConflictException } from '../../../common/exceptions/conflict.exception';
import { NotFoundException } from '../../../common/exceptions/not-found.exception';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateServiceTypeDto } from './dto/create-service-type.dto';
import { CreateSlaPolicyDto } from './dto/create-sla-policy.dto';
import { CreateWorkflowTransitionDto } from './dto/create-workflow-transition.dto';
import { ServiceTypeSettingResponseDto } from './dto/service-type-setting-response.dto';
import { SlaPolicySettingResponseDto } from './dto/sla-policy-setting-response.dto';
import { UpdateServiceTypeDto } from './dto/update-service-type.dto';
import { UpdateSlaPolicyDto } from './dto/update-sla-policy.dto';
import { UpdateWorkflowTransitionDto } from './dto/update-workflow-transition.dto';
import { WorkflowTransitionSettingResponseDto } from './dto/workflow-transition-setting-response.dto';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listServiceTypes(tenantId: string): Promise<ServiceTypeSettingResponseDto[]> {
    const items = await this.prisma.serviceType.findMany({
      where: { tenantId },
      orderBy: [{ isActive: 'desc' }, { code: 'asc' }],
    });

    return items.map(ServiceTypeSettingResponseDto.from);
  }

  async createServiceType(tenantId: string, dto: CreateServiceTypeDto): Promise<ServiceTypeSettingResponseDto> {
    const code = dto.code.trim().toUpperCase();
    const existing = await this.prisma.serviceType.findFirst({
      where: { tenantId, code },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('SERVICE_TYPE_CODE_EXISTS', `Service type code already exists: ${code}`);
    }

    const created = await this.prisma.serviceType.create({
      data: {
        tenantId,
        code,
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        isActive: dto.isActive ?? true,
      },
    });

    this.logger.log(`Service type created: id=${created.id}, tenantId=${tenantId}`);
    return ServiceTypeSettingResponseDto.from(created);
  }

  async updateServiceType(
    tenantId: string,
    id: string,
    dto: UpdateServiceTypeDto,
  ): Promise<ServiceTypeSettingResponseDto> {
    const existing = await this.prisma.serviceType.findFirst({
      where: { id, tenantId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('ServiceType', id);
    }

    const nextCode = dto.code?.trim().toUpperCase();
    if (nextCode) {
      const duplicated = await this.prisma.serviceType.findFirst({
        where: {
          tenantId,
          code: nextCode,
          id: { not: id },
        },
        select: { id: true },
      });
      if (duplicated) {
        throw new ConflictException('SERVICE_TYPE_CODE_EXISTS', `Service type code already exists: ${nextCode}`);
      }
    }

    const updated = await this.prisma.serviceType.update({
      where: { id },
      data: {
        ...(nextCode !== undefined && { code: nextCode }),
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.description !== undefined && { description: dto.description?.trim() || null }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });

    this.logger.log(`Service type updated: id=${id}, tenantId=${tenantId}`);
    return ServiceTypeSettingResponseDto.from(updated);
  }

  async deleteServiceType(tenantId: string, id: string): Promise<void> {
    const existing = await this.prisma.serviceType.findFirst({
      where: { id, tenantId },
      select: { id: true, code: true },
    });
    if (!existing) {
      throw new NotFoundException('ServiceType', id);
    }

    const linkedRequestCount = await this.prisma.serviceRequest.count({
      where: { tenantId, serviceTypeId: id },
    });
    if (linkedRequestCount > 0) {
      throw new ConflictException(
        'SERVICE_TYPE_IN_USE',
        `Cannot delete service type because it is linked to ${linkedRequestCount} request(s)`,
      );
    }

    await this.prisma.$transaction([
      this.prisma.slaPolicy.deleteMany({
        where: {
          tenantId,
          serviceTypeCode: existing.code,
        },
      }),
      this.prisma.workflowTransition.deleteMany({
        where: {
          tenantId,
          serviceTypeCode: existing.code,
        },
      }),
      this.prisma.serviceType.delete({ where: { id } }),
    ]);

    this.logger.log(`Service type deleted: id=${id}, tenantId=${tenantId}`);
  }

  async listSlaPolicies(tenantId: string): Promise<SlaPolicySettingResponseDto[]> {
    const items = await this.prisma.slaPolicy.findMany({
      where: { tenantId },
      orderBy: [{ isActive: 'desc' }, { serviceTypeCode: 'asc' }],
    });
    return items.map(SlaPolicySettingResponseDto.from);
  }

  async createSlaPolicy(tenantId: string, dto: CreateSlaPolicyDto): Promise<SlaPolicySettingResponseDto> {
    const serviceTypeCode = dto.serviceTypeCode.trim().toUpperCase();
    await this.assertServiceTypeCodeExists(tenantId, serviceTypeCode);

    const duplicated = await this.prisma.slaPolicy.findFirst({
      where: { tenantId, serviceTypeCode },
      select: { id: true },
    });
    if (duplicated) {
      throw new ConflictException(
        'SLA_POLICY_EXISTS',
        `SLA policy already exists for service type: ${serviceTypeCode}`,
      );
    }

    const created = await this.prisma.slaPolicy.create({
      data: {
        tenantId,
        serviceTypeCode,
        responseMinutes: dto.responseMinutes,
        resolutionMinutes: dto.resolutionMinutes,
        escalationAfterMinutes: dto.escalationAfterMinutes,
        isActive: true,
      },
    });

    this.logger.log(`SLA policy created: id=${created.id}, tenantId=${tenantId}`);
    return SlaPolicySettingResponseDto.from(created);
  }

  async updateSlaPolicy(tenantId: string, id: string, dto: UpdateSlaPolicyDto): Promise<SlaPolicySettingResponseDto> {
    const existing = await this.prisma.slaPolicy.findFirst({
      where: { id, tenantId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('SlaPolicy', id);
    }

    const normalized = this.normalizeSlaInput(dto);
    const nextCode = normalized.serviceTypeCode;
    if (nextCode) {
      await this.assertServiceTypeCodeExists(tenantId, nextCode);
      const duplicated = await this.prisma.slaPolicy.findFirst({
        where: {
          tenantId,
          serviceTypeCode: nextCode,
          id: { not: id },
        },
        select: { id: true },
      });
      if (duplicated) {
        throw new ConflictException('SLA_POLICY_EXISTS', `SLA policy already exists for service type: ${nextCode}`);
      }
    }

    const updated = await this.prisma.slaPolicy.update({
      where: { id },
      data: {
        ...(nextCode !== undefined && { serviceTypeCode: nextCode }),
        ...(normalized.responseMinutes !== undefined && { responseMinutes: normalized.responseMinutes }),
        ...(normalized.resolutionMinutes !== undefined && { resolutionMinutes: normalized.resolutionMinutes }),
        ...(normalized.escalationAfterMinutes !== undefined && {
          escalationAfterMinutes: normalized.escalationAfterMinutes,
        }),
      },
    });

    this.logger.log(`SLA policy updated: id=${id}, tenantId=${tenantId}`);
    return SlaPolicySettingResponseDto.from(updated);
  }

  async deleteSlaPolicy(tenantId: string, id: string): Promise<void> {
    const existing = await this.prisma.slaPolicy.findFirst({
      where: { id, tenantId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('SlaPolicy', id);
    }

    await this.prisma.slaPolicy.delete({ where: { id } });
    this.logger.log(`SLA policy deleted: id=${id}, tenantId=${tenantId}`);
  }

  async listWorkflowTransitions(tenantId: string): Promise<WorkflowTransitionSettingResponseDto[]> {
    const items = await this.prisma.workflowTransition.findMany({
      where: { tenantId },
      orderBy: [{ isActive: 'desc' }, { serviceTypeCode: 'asc' }, { fromStatus: 'asc' }],
    });
    return items.map(WorkflowTransitionSettingResponseDto.from);
  }

  async createWorkflowTransition(
    tenantId: string,
    dto: CreateWorkflowTransitionDto,
  ): Promise<WorkflowTransitionSettingResponseDto> {
    const serviceTypeCode = dto.serviceTypeCode.trim().toUpperCase();
    await this.assertServiceTypeCodeExists(tenantId, serviceTypeCode);

    const created = await this.prisma.workflowTransition.create({
      data: {
        tenantId,
        serviceTypeCode,
        fromStatus: dto.fromStatus,
        toStatus: dto.toStatus,
        allowedRoles: this.normalizeAllowedRoles(dto.allowedRoles),
        isActive: dto.isActive ?? true,
      },
    });

    this.logger.log(`Workflow transition created: id=${created.id}, tenantId=${tenantId}`);
    return WorkflowTransitionSettingResponseDto.from(created);
  }

  async updateWorkflowTransition(
    tenantId: string,
    id: string,
    dto: UpdateWorkflowTransitionDto,
  ): Promise<WorkflowTransitionSettingResponseDto> {
    const existing = await this.prisma.workflowTransition.findFirst({
      where: { id, tenantId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('WorkflowTransition', id);
    }

    const normalized = this.normalizeWorkflowInput(dto);
    const nextCode = normalized.serviceTypeCode;
    if (nextCode) {
      await this.assertServiceTypeCodeExists(tenantId, nextCode);
    }

    const updated = await this.prisma.workflowTransition.update({
      where: { id },
      data: {
        ...(nextCode !== undefined && { serviceTypeCode: nextCode }),
        ...(normalized.fromStatus !== undefined && { fromStatus: normalized.fromStatus }),
        ...(normalized.toStatus !== undefined && { toStatus: normalized.toStatus }),
        ...(normalized.allowedRoles !== undefined && { allowedRoles: normalized.allowedRoles }),
        ...(normalized.isActive !== undefined && { isActive: normalized.isActive }),
      },
    });

    this.logger.log(`Workflow transition updated: id=${id}, tenantId=${tenantId}`);
    return WorkflowTransitionSettingResponseDto.from(updated);
  }

  async deleteWorkflowTransition(tenantId: string, id: string): Promise<void> {
    const existing = await this.prisma.workflowTransition.findFirst({
      where: { id, tenantId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('WorkflowTransition', id);
    }

    await this.prisma.workflowTransition.delete({ where: { id } });
    this.logger.log(`Workflow transition deleted: id=${id}, tenantId=${tenantId}`);
  }

  private async assertServiceTypeCodeExists(tenantId: string, serviceTypeCode: string): Promise<void> {
    const serviceType = await this.prisma.serviceType.findFirst({
      where: { tenantId, code: serviceTypeCode },
      select: { id: true },
    });
    if (!serviceType) {
      throw new NotFoundException('ServiceType', serviceTypeCode);
    }
  }

  private normalizeSlaInput(
    dto: Partial<Pick<CreateSlaPolicyDto, 'serviceTypeCode' | 'responseMinutes' | 'resolutionMinutes' | 'escalationAfterMinutes'>>,
  ): {
    serviceTypeCode?: string;
    responseMinutes?: number;
    resolutionMinutes?: number;
    escalationAfterMinutes?: number;
  } {
    return {
      ...(dto.serviceTypeCode !== undefined && { serviceTypeCode: dto.serviceTypeCode.trim().toUpperCase() }),
      ...(dto.responseMinutes !== undefined && { responseMinutes: dto.responseMinutes }),
      ...(dto.resolutionMinutes !== undefined && { resolutionMinutes: dto.resolutionMinutes }),
      ...(dto.escalationAfterMinutes !== undefined && { escalationAfterMinutes: dto.escalationAfterMinutes }),
    };
  }

  private normalizeWorkflowInput(
    dto: Partial<Pick<CreateWorkflowTransitionDto, 'serviceTypeCode' | 'fromStatus' | 'toStatus' | 'allowedRoles' | 'isActive'>>,
  ): {
    serviceTypeCode?: string;
    fromStatus?: CreateWorkflowTransitionDto['fromStatus'];
    toStatus?: CreateWorkflowTransitionDto['toStatus'];
    allowedRoles?: string[];
    isActive?: boolean;
  } {
    return {
      ...(dto.serviceTypeCode !== undefined && { serviceTypeCode: dto.serviceTypeCode.trim().toUpperCase() }),
      ...(dto.fromStatus !== undefined && { fromStatus: dto.fromStatus }),
      ...(dto.toStatus !== undefined && { toStatus: dto.toStatus }),
      ...(dto.allowedRoles !== undefined && { allowedRoles: this.normalizeAllowedRoles(dto.allowedRoles) }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    };
  }

  private normalizeAllowedRoles(roles: string[]): string[] {
    const normalized = roles
      .map((role) => role.trim().toUpperCase())
      .filter((role) => role.length > 0);
    if (normalized.length === 0) {
      throw new ConflictException('ALLOWED_ROLES_REQUIRED', 'At least one allowed role is required');
    }
    return normalized;
  }
}
