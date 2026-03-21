import { Injectable } from '@nestjs/common';
import {
  CommentVisibility,
  MembershipStatus,
  Prisma,
  RequestActivityType,
  RequestImpactLevel,
  RequestPriority,
  RequestStatus,
  RequestUrgency,
  SlaHealth,
  SlaType,
  SourceChannel,
  UserStatus,
} from '@prisma/client';
import { PageMeta, pageMetaOf } from '../../../common/dto/page-meta.dto';
import { ConflictException } from '../../../common/exceptions/conflict.exception';
import { ForbiddenException } from '../../../common/exceptions/forbidden.exception';
import { NotFoundException } from '../../../common/exceptions/not-found.exception';
import { PrismaService } from '../../../prisma/prisma.service';
import { AssignRequestDto } from './dto/assign-request.dto';
import { CreateRequestDto, CreateRequestMode } from './dto/create-request.dto';
import { CreateRequestCommentDto } from './dto/create-request-comment.dto';
import { CreateRequestWorkLogDto } from './dto/create-request-work-log.dto';
import { RequestCommentResponseDto } from './dto/request-comment-response.dto';
import { RequestAssigneeResponseDto } from './dto/request-assignee-response.dto';
import { RequestQueryDto } from './dto/request-query.dto';
import { RequestResponseDto } from './dto/request-response.dto';
import { RequestWorkLogResponseDto } from './dto/request-work-log-response.dto';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto';

type RequestWithServiceType = Prisma.ServiceRequestGetPayload<{
  include: {
    serviceType: {
      select: {
        code: true;
        name: true;
      };
    };
  };
}>;

@Injectable()
export class RequestService {
  private static readonly ASSIGNMENT_SLA_MINUTES = 30;
  private static readonly RESOLUTION_SLA_MINUTES = 8 * 60;
  private static readonly ASSIGNABLE_ROLE_CODES = ['TECHNICIAN', 'OPS_COORDINATOR'] as const;

  constructor(private readonly prisma: PrismaService) {}

  async list(
    tenantId: string,
    requesterId: string,
    permissions: string[],
    query: RequestQueryDto,
  ): Promise<{ data: RequestResponseDto[]; meta: PageMeta }> {
    const page = query.page ?? 1;
    const size = query.size ?? 20;
    const skip = (page - 1) * size;

    const where: Prisma.ServiceRequestWhereInput = {
      tenantId,
      ...this.readScopeWhere(requesterId, permissions),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { requestCode: { contains: query.search, mode: 'insensitive' } },
              { title: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.serviceRequest.findMany({
        where,
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
      this.prisma.serviceRequest.count({ where }),
    ]);

    return {
      data: items.map((item) => RequestResponseDto.from(item)),
      meta: pageMetaOf({ page, size, total }),
    };
  }

  async create(tenantId: string, requesterId: string, dto: CreateRequestDto): Promise<RequestResponseDto> {
    const serviceTypeId = await this.resolveServiceTypeId(tenantId, dto);
    if (!serviceTypeId) {
      throw new ConflictException(
        'SERVICE_TYPE_REQUIRED',
        'Either serviceTypeId or serviceType/serviceTypeCode is required',
      );
    }

    const locationId = this.resolveLocationId(dto);
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
          serviceTypeId,
          status: requestStatus,
          priority: dto.priority ?? RequestPriority.MEDIUM,
          impactLevel: dto.impactLevel ?? RequestImpactLevel.MEDIUM,
          urgency: dto.urgency ?? RequestUrgency.MEDIUM,
          locationId,
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

      if (dto.attachmentFileIds && dto.attachmentFileIds.length > 0) {
        await tx.requestAttachment.createMany({
          data: dto.attachmentFileIds.map((fileId) => ({
            tenantId,
            requestId: createdRequest.id,
            uploadedFileId: fileId,
          })),
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
            preferredContact: dto.preferredContact ?? null,
            attachmentCount: dto.attachmentFileIds?.length ?? 0,
          },
        },
      });

      return createdRequest;
    });

    return RequestResponseDto.from(created);
  }

  async detail(
    tenantId: string,
    requesterId: string,
    permissions: string[],
    requestId: string,
  ): Promise<RequestResponseDto> {
    const request = await this.findRequestById(tenantId, requesterId, permissions, requestId);
    return RequestResponseDto.from(request);
  }

  async listAssignees(tenantId: string): Promise<RequestAssigneeResponseDto[]> {
    const members = await this.prisma.membership.findMany({
      where: {
        tenantId,
        status: MembershipStatus.ACTIVE,
        roleCode: {
          in: [...RequestService.ASSIGNABLE_ROLE_CODES],
        },
        user: {
          isActive: true,
          status: UserStatus.ACTIVE,
        },
      },
      select: {
        userId: true,
        roleCode: true,
        user: {
          select: {
            email: true,
            fullName: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        user: {
          email: 'asc',
        },
      },
    });

    return members.map((member) => {
      const fallbackName = [member.user.firstName, member.user.lastName].filter(Boolean).join(' ').trim();
      return RequestAssigneeResponseDto.from({
        id: member.userId,
        email: member.user.email,
        fullName: member.user.fullName?.trim() || fallbackName || member.user.email,
        roleCode: member.roleCode,
      });
    });
  }

  async updateStatus(
    tenantId: string,
    actorId: string,
    permissions: string[],
    requestId: string,
    dto: UpdateRequestStatusDto,
  ): Promise<RequestResponseDto> {
    const request = await this.findRequestById(tenantId, actorId, permissions, requestId);

    if (request.status === dto.status) {
      throw new ConflictException('INVALID_STATUS_TRANSITION', 'Request is already in the target status');
    }

    if (!this.isStatusTransitionAllowed(request.status, dto.status)) {
      throw new ConflictException(
        'INVALID_STATUS_TRANSITION',
        `Cannot transition from ${request.status} to ${dto.status}`,
      );
    }

    if (!this.canTransitionStatus(permissions, actorId, request, dto.status)) {
      throw new ForbiddenException('You do not have permission to perform this status transition');
    }

    const now = new Date();

    const updated = await this.prisma.$transaction(async (tx) => {
      const updateData: Prisma.ServiceRequestUpdateInput = { status: dto.status };

      if (dto.status === RequestStatus.SUBMITTED) {
        if (!request.submittedAt) {
          updateData.submittedAt = now;
        }

        if (!request.requestCode) {
          updateData.requestCode = await this.nextRequestCode(tx, tenantId, now);
        }
      }

      if (dto.status === RequestStatus.ASSIGNED && !request.assignedAt) {
        updateData.assignedAt = now;
      }

      if (dto.status === RequestStatus.IN_PROGRESS && !request.startedAt) {
        updateData.startedAt = now;
      }

      if (dto.status === RequestStatus.RESOLVED && !request.resolvedAt) {
        updateData.resolvedAt = now;
      }

      if (dto.status === RequestStatus.CLOSED && !request.closedAt) {
        updateData.closedAt = now;
      }

      if (dto.status === RequestStatus.REOPENED) {
        updateData.resolvedAt = null;
        updateData.closedAt = null;
      }

      const updatedRequest = await tx.serviceRequest.update({
        where: { id: request.id },
        data: updateData,
        include: {
          serviceType: {
            select: {
              code: true,
              name: true,
            },
          },
        },
      });

      await tx.requestActivity.create({
        data: {
          tenantId,
          requestId: request.id,
          type: RequestActivityType.STATUS_CHANGED,
          title: `Status changed: ${request.status} -> ${dto.status}`,
          description: 'Request status was updated',
          actorId,
          metadata: {
            from: request.status,
            to: dto.status,
          },
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          requestId: request.id,
          entityType: 'REQUEST',
          entityId: request.id,
          action: 'REQUEST_STATUS_UPDATED',
          actorId,
          beforeData: {
            status: request.status,
            submittedAt: request.submittedAt,
            assignedAt: request.assignedAt,
            startedAt: request.startedAt,
            resolvedAt: request.resolvedAt,
            closedAt: request.closedAt,
          },
          afterData: {
            status: dto.status,
            submittedAt: updatedRequest.submittedAt,
            assignedAt: updatedRequest.assignedAt,
            startedAt: updatedRequest.startedAt,
            resolvedAt: updatedRequest.resolvedAt,
            closedAt: updatedRequest.closedAt,
          },
        },
      });

      return updatedRequest;
    });

    return RequestResponseDto.from(updated);
  }

  async addComment(
    tenantId: string,
    authorId: string,
    permissions: string[],
    requestId: string,
    dto: CreateRequestCommentDto,
  ): Promise<RequestCommentResponseDto> {
    await this.findRequestById(tenantId, authorId, permissions, requestId);

    const visibility = dto.visibility ?? CommentVisibility.PUBLIC;

    if (visibility === CommentVisibility.INTERNAL && !permissions.includes('comment.create.internal')) {
      throw new ForbiddenException('You do not have permission to create internal notes');
    }

    if (visibility === CommentVisibility.PUBLIC && !permissions.includes('comment.create.public')) {
      throw new ForbiddenException('You do not have permission to create public comments');
    }

    const body = dto.body.trim();
    if (!body) {
      throw new ConflictException('COMMENT_BODY_REQUIRED', 'Comment body is required');
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const comment = await tx.requestComment.create({
        data: {
          tenantId,
          requestId,
          authorId,
          visibility,
          body,
        },
      });

      await tx.requestActivity.create({
        data: {
          tenantId,
          requestId,
          type:
            visibility === CommentVisibility.INTERNAL
              ? RequestActivityType.INTERNAL_NOTE_ADDED
              : RequestActivityType.COMMENT_ADDED,
          title: visibility === CommentVisibility.INTERNAL ? 'Internal note added' : 'Comment added',
          description: body,
          actorId: authorId,
          metadata: {
            commentId: comment.id,
            visibility,
          },
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          requestId,
          entityType: 'REQUEST_COMMENT',
          entityId: comment.id,
          action: 'REQUEST_COMMENT_ADDED',
          actorId: authorId,
          beforeData: Prisma.JsonNull,
          afterData: {
            requestId,
            visibility,
          },
        },
      });

      return comment;
    });

    return RequestCommentResponseDto.from(created);
  }

  async addWorkLog(
    tenantId: string,
    authorId: string,
    permissions: string[],
    requestId: string,
    dto: CreateRequestWorkLogDto,
  ): Promise<RequestWorkLogResponseDto> {
    const request = await this.findRequestById(tenantId, authorId, permissions, requestId);

    if (!permissions.includes('request.start_work')) {
      throw new ForbiddenException('You do not have permission to add work logs');
    }

    const canReadAll = permissions.includes('request.read.all');
    if (!canReadAll && request.assigneeId !== authorId) {
      throw new ForbiddenException('Only the current assignee can add work logs to this request');
    }

    const content = dto.content.trim();
    if (!content) {
      throw new ConflictException('WORK_LOG_CONTENT_REQUIRED', 'Work log content is required');
    }

    if (dto.startedAt && dto.endedAt && dto.endedAt.getTime() < dto.startedAt.getTime()) {
      throw new ConflictException('WORK_LOG_TIME_INVALID', 'endedAt must be greater than or equal to startedAt');
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const workLog = await tx.workLog.create({
        data: {
          tenantId,
          requestId,
          authorId,
          content,
          minutesSpent: dto.minutesSpent,
          startedAt: dto.startedAt,
          endedAt: dto.endedAt,
        },
      });

      await tx.requestActivity.create({
        data: {
          tenantId,
          requestId,
          type: RequestActivityType.COMMENT_ADDED,
          title: 'Work log added',
          description: content,
          actorId: authorId,
          metadata: {
            workLogId: workLog.id,
            minutesSpent: workLog.minutesSpent,
          },
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          requestId,
          entityType: 'WORK_LOG',
          entityId: workLog.id,
          action: 'WORK_LOG_ADDED',
          actorId: authorId,
          beforeData: Prisma.JsonNull,
          afterData: {
            requestId,
            minutesSpent: workLog.minutesSpent,
            startedAt: workLog.startedAt,
            endedAt: workLog.endedAt,
          },
        },
      });

      return workLog;
    });

    return RequestWorkLogResponseDto.from(created);
  }

  async assign(
    tenantId: string,
    actorId: string,
    permissions: string[],
    requestId: string,
    dto: AssignRequestDto,
  ): Promise<RequestResponseDto> {
    const request = await this.findRequestById(tenantId, actorId, permissions, requestId);

    if (!request.assigneeId && !permissions.includes('request.assign')) {
      throw new ForbiddenException('You do not have permission to assign this request');
    }

    if (request.assigneeId && !permissions.includes('request.reassign')) {
      throw new ForbiddenException('You do not have permission to reassign this request');
    }

    const actorMembership = await this.prisma.membership.findFirst({
      where: {
        tenantId,
        userId: actorId,
        status: MembershipStatus.ACTIVE,
      },
      select: {
        roleCode: true,
      },
    });

    const assigneeMembership = await this.prisma.membership.findFirst({
      where: {
        tenantId,
        userId: dto.assigneeId,
        status: MembershipStatus.ACTIVE,
        user: {
          isActive: true,
          status: UserStatus.ACTIVE,
        },
      },
      select: {
        userId: true,
        roleCode: true,
      },
    });

    if (!assigneeMembership) {
      throw new NotFoundException('User', dto.assigneeId);
    }

    if (!this.canAssignToRole(actorMembership?.roleCode ?? null, assigneeMembership.roleCode ?? null)) {
      throw new ForbiddenException('You are not allowed to assign requests to this role');
    }

    if (request.assigneeId === dto.assigneeId) {
      return RequestResponseDto.from(request);
    }

    const now = new Date();

    const updated = await this.prisma.$transaction(async (tx) => {
      const nextStatus = this.resolveStatusOnAssign(request.status);
      const updatedRequest = await tx.serviceRequest.update({
        where: { id: request.id },
        data: {
          assigneeId: dto.assigneeId,
          assignedAt: request.assignedAt ?? now,
          ...(nextStatus ? { status: nextStatus } : {}),
        },
        include: {
          serviceType: {
            select: {
              code: true,
              name: true,
            },
          },
        },
      });

      await tx.assignmentHistory.create({
        data: {
          tenantId,
          requestId: request.id,
          fromAssigneeId: request.assigneeId,
          toAssigneeId: dto.assigneeId,
          changedById: actorId,
        },
      });

      await tx.requestActivity.create({
        data: {
          tenantId,
          requestId: request.id,
          type: request.assigneeId ? RequestActivityType.REASSIGNED : RequestActivityType.ASSIGNED,
          title: request.assigneeId ? 'Request reassigned' : 'Request assigned',
          description: request.assigneeId
            ? `Assignee updated from ${request.assigneeId} to ${dto.assigneeId}`
            : `Assigned to ${dto.assigneeId}`,
          actorId,
          metadata: {
            fromAssigneeId: request.assigneeId,
            toAssigneeId: dto.assigneeId,
          },
        },
      });

      if (nextStatus && nextStatus !== request.status) {
        await tx.requestActivity.create({
          data: {
            tenantId,
            requestId: request.id,
            type: RequestActivityType.STATUS_CHANGED,
            title: `Status changed: ${request.status} -> ${nextStatus}`,
            description: 'Status moved to ASSIGNED after assignment',
            actorId,
            metadata: {
              from: request.status,
              to: nextStatus,
            },
          },
        });
      }

      await tx.auditLog.create({
        data: {
          tenantId,
          requestId: request.id,
          entityType: 'REQUEST',
          entityId: request.id,
          action: request.assigneeId ? 'REQUEST_REASSIGNED' : 'REQUEST_ASSIGNED',
          actorId,
          beforeData: {
            assigneeId: request.assigneeId,
            status: request.status,
          },
          afterData: {
            assigneeId: dto.assigneeId,
            status: nextStatus ?? request.status,
          },
        },
      });

      return updatedRequest;
    });

    return RequestResponseDto.from(updated);
  }

  private async findRequestById(
    tenantId: string,
    requesterId: string,
    permissions: string[],
    requestId: string,
  ): Promise<RequestWithServiceType> {
    const request = await this.prisma.serviceRequest.findFirst({
      where: {
        tenantId,
        id: requestId,
        ...this.readScopeWhere(requesterId, permissions),
      },
      include: {
        serviceType: {
          select: {
            code: true,
            name: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('ServiceRequest', requestId);
    }

    return request;
  }

  private readScopeWhere(requesterId: string, permissions: string[]): Prisma.ServiceRequestWhereInput {
    const canReadAll = permissions.includes('request.read.all');
    const canReadAssigned = permissions.includes('request.start_work') && !canReadAll;

    if (canReadAll) {
      return {};
    }

    if (canReadAssigned) {
      return {
        OR: [{ requesterId }, { assigneeId: requesterId }],
      };
    }

    return { requesterId };
  }

  private isStatusTransitionAllowed(from: RequestStatus, to: RequestStatus): boolean {
    const allowed: Record<RequestStatus, RequestStatus[]> = {
      [RequestStatus.DRAFT]: [RequestStatus.SUBMITTED, RequestStatus.CANCELLED],
      [RequestStatus.SUBMITTED]: [RequestStatus.TRIAGE, RequestStatus.ASSIGNED, RequestStatus.CANCELLED],
      [RequestStatus.TRIAGE]: [RequestStatus.ASSIGNED, RequestStatus.IN_PROGRESS, RequestStatus.CANCELLED],
      [RequestStatus.ASSIGNED]: [RequestStatus.TRIAGE, RequestStatus.IN_PROGRESS, RequestStatus.CANCELLED],
      [RequestStatus.IN_PROGRESS]: [
        RequestStatus.WAITING_EXTERNAL_VENDOR,
        RequestStatus.RESOLVED,
        RequestStatus.ASSIGNED,
        RequestStatus.CANCELLED,
      ],
      [RequestStatus.WAITING_EXTERNAL_VENDOR]: [
        RequestStatus.IN_PROGRESS,
        RequestStatus.RESOLVED,
        RequestStatus.CANCELLED,
      ],
      [RequestStatus.RESOLVED]: [RequestStatus.CLOSED, RequestStatus.REOPENED],
      [RequestStatus.CLOSED]: [RequestStatus.REOPENED],
      [RequestStatus.REOPENED]: [RequestStatus.TRIAGE, RequestStatus.ASSIGNED, RequestStatus.IN_PROGRESS],
      [RequestStatus.CANCELLED]: [RequestStatus.REOPENED],
    };

    return allowed[from].includes(to);
  }

  private canTransitionStatus(
    permissions: string[],
    actorId: string,
    request: RequestWithServiceType,
    target: RequestStatus,
  ): boolean {
    const canReadAll = permissions.includes('request.read.all');
    const isRequester = request.requesterId === actorId;
    const isAssignee = request.assigneeId === actorId;

    if (target === RequestStatus.SUBMITTED) {
      return isRequester;
    }

    if (target === RequestStatus.ASSIGNED || target === RequestStatus.TRIAGE) {
      return permissions.includes('request.assign') || permissions.includes('request.reassign');
    }

    if (target === RequestStatus.IN_PROGRESS) {
      return permissions.includes('request.start_work') && (canReadAll || isAssignee);
    }

    if (target === RequestStatus.RESOLVED) {
      return permissions.includes('request.resolve') && (canReadAll || isAssignee);
    }

    if (target === RequestStatus.CLOSED) {
      return permissions.includes('request.close') && (canReadAll || isRequester);
    }

    if (target === RequestStatus.REOPENED) {
      return permissions.includes('request.reopen') && (canReadAll || isRequester);
    }

    if (target === RequestStatus.WAITING_EXTERNAL_VENDOR) {
      return permissions.includes('request.escalate') || permissions.includes('request.resolve');
    }

    if (target === RequestStatus.CANCELLED) {
      return canReadAll || isRequester;
    }

    return false;
  }

  private resolveStatusOnAssign(status: RequestStatus): RequestStatus | null {
    if (status === RequestStatus.SUBMITTED || status === RequestStatus.TRIAGE || status === RequestStatus.REOPENED) {
      return RequestStatus.ASSIGNED;
    }

    return null;
  }

  private canAssignToRole(actorRoleCode: string | null, assigneeRoleCode: string | null): boolean {
    if (!actorRoleCode || !assigneeRoleCode) {
      return false;
    }

    if (actorRoleCode === 'TENANT_ADMIN') {
      return this.isAssignableRoleCode(assigneeRoleCode);
    }

    if (actorRoleCode === 'OPS_COORDINATOR') {
      return this.isAssignableRoleCode(assigneeRoleCode);
    }

    return false;
  }

  private isAssignableRoleCode(roleCode: string): roleCode is (typeof RequestService.ASSIGNABLE_ROLE_CODES)[number] {
    return RequestService.ASSIGNABLE_ROLE_CODES.includes(
      roleCode as (typeof RequestService.ASSIGNABLE_ROLE_CODES)[number],
    );
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

  private resolveLocationId(dto: CreateRequestDto): string {
    const locationId = (dto.locationId ?? dto.location ?? '').trim();
    if (!locationId) {
      throw new ConflictException('LOCATION_REQUIRED', 'Either locationId or location is required');
    }

    return locationId;
  }

  private async resolveServiceTypeId(tenantId: string, dto: CreateRequestDto): Promise<string | null> {
    if (dto.serviceTypeId) {
      const serviceTypeById = await this.prisma.serviceType.findFirst({
        where: {
          id: dto.serviceTypeId,
          tenantId,
          isActive: true,
        },
        select: { id: true },
      });

      if (!serviceTypeById) {
        throw new NotFoundException('ServiceType', dto.serviceTypeId);
      }

      return serviceTypeById.id;
    }

    const rawCode = (dto.serviceTypeCode ?? dto.serviceType ?? '').trim();
    if (!rawCode) {
      return null;
    }

    const normalizedCode = rawCode.toUpperCase();
    const serviceTypeName = this.toServiceTypeName(rawCode);
    const serviceTypeByCode = await this.prisma.serviceType.upsert({
      where: {
        tenantId_code: {
          tenantId,
          code: normalizedCode,
        },
      },
      create: {
        tenantId,
        code: normalizedCode,
        name: serviceTypeName,
        isActive: true,
      },
      update: {
        isActive: true,
        name: serviceTypeName,
      },
      select: {
        id: true,
      },
    });

    return serviceTypeByCode.id;
  }

  private toServiceTypeName(rawCode: string): string {
    const normalized = rawCode.trim().replace(/[_-]+/g, ' ');
    if (!normalized) {
      return 'General Service';
    }

    return normalized
      .split(/\s+/)
      .map((token) => {
        const lower = token.toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      })
      .join(' ');
  }
}
