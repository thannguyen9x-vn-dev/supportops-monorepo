import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CommentVisibility,
  MembershipStatus,
  Prisma,
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
import { RequestCommentQueryDto } from './dto/request-comment-query.dto';
import { RequestAssigneeResponseDto } from './dto/request-assignee-response.dto';
import { RequestQueryDto } from './dto/request-query.dto';
import { RequestResponseDto } from './dto/request-response.dto';
import { RequestTabCountsResponseDto } from './dto/request-tab-counts-response.dto';
import {
  RequestWorkflowActivityDto,
  RequestWorkflowActorDto,
  RequestWorkflowAttachmentDto,
  RequestWorkflowAssignmentHistoryDto,
  RequestWorkflowDetailResponseDto,
  RequestWorkflowSlaRecordDto,
} from './dto/request-workflow-detail-response.dto';
import { RequestWorkLogResponseDto } from './dto/request-work-log-response.dto';
import { UpdateRequestStatusDto } from './dto/update-request-status.dto';
import { REQUEST_EVENTS } from './events/request-events.constants';
import {
  RequestAssignedEvent,
  RequestCommentAddedEvent,
  RequestCreatedEvent,
  RequestStatusChangedEvent,
  RequestWorkLogAddedEvent,
} from './events/request.events';
import type { RequestTabKey, SortableRequestField } from './dto/request-query.dto';

type RequestWithServiceType = Prisma.ServiceRequestGetPayload<{
  include: {
    serviceType: {
      select: {
        code: true;
        name: true;
      };
    };
    slaRecords: {
      select: {
        health: true;
        targetAt: true;
      };
    };
    queue: {
      select: {
        name: true;
      };
    };
  };
}>;

type SystemRoleCode = 'EMPLOYEE' | 'OPS_COORDINATOR' | 'TECHNICIAN' | 'TENANT_ADMIN';

const WORKFLOW_ACTION_ORDER: Record<RequestStatus, string[]> = {
  [RequestStatus.DRAFT]: ['EDIT_DRAFT', 'SUBMIT'],
  [RequestStatus.SUBMITTED]: ['ASSIGN', 'REASSIGN', 'ESCALATE', 'ADD_NOTE', 'ASSIGN_TO_ME'],
  [RequestStatus.TRIAGE]: ['ASSIGN', 'REASSIGN', 'ESCALATE', 'ADD_NOTE', 'ASSIGN_TO_ME'],
  [RequestStatus.ASSIGNED]: ['START_PROGRESS', 'ASSIGN', 'REASSIGN', 'ESCALATE', 'ADD_NOTE', 'ASSIGN_TO_ME'],
  [RequestStatus.IN_PROGRESS]: ['RESOLVE', 'REASSIGN', 'ESCALATE', 'ADD_NOTE'],
  [RequestStatus.WAITING_EXTERNAL_VENDOR]: ['RESOLVE', 'REASSIGN', 'ADD_NOTE'],
  [RequestStatus.WAITING_FOR_CUSTOMER]: ['RESOLVE', 'REASSIGN', 'ADD_NOTE'],
  [RequestStatus.RESOLVED]: ['CLOSE', 'REOPEN', 'ADD_NOTE'],
  [RequestStatus.CLOSED]: ['REOPEN', 'ADD_NOTE'],
  [RequestStatus.REOPENED]: ['START_PROGRESS', 'ASSIGN', 'REASSIGN', 'ESCALATE', 'ADD_NOTE', 'ASSIGN_TO_ME'],
  [RequestStatus.CANCELLED]: [],
};

@Injectable()
export class RequestService {
  private static readonly ASSIGNMENT_SLA_MINUTES = 30;
  private static readonly RESOLUTION_SLA_MINUTES = 8 * 60;
  private static readonly ESCALATION_AFTER_MINUTES = 60;
  private static readonly ASSIGNABLE_ROLE_CODES = ['TECHNICIAN', 'OPS_COORDINATOR'] as const;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async list(
    tenantId: string,
    requesterId: string,
    permissions: string[],
    query: RequestQueryDto,
  ): Promise<{ data: RequestResponseDto[]; meta: PageMeta }> {
    const page = query.page ?? 1;
    const size = query.size ?? 20;
    const skip = (page - 1) * size;
    const where = this.buildListWhere(tenantId, requesterId, permissions, query);
    const tabWhere = this.buildTabWhere(query.tab);
    const finalWhere: Prisma.ServiceRequestWhereInput =
      Object.keys(tabWhere).length > 0
        ? {
            AND: [where, tabWhere],
          }
        : where;

    const actorRoleCode = await this.resolveActiveRoleCode(tenantId, requesterId);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.serviceRequest.findMany({
        where: finalWhere,
        include: {
          serviceType: {
            select: {
              code: true,
              name: true,
            },
          },
          slaRecords: {
            select: {
              health: true,
              targetAt: true,
            },
            orderBy: {
              targetAt: 'asc',
            },
          },
          queue: {
            select: {
              name: true,
            },
          },
        },
        orderBy: this.buildOrderBy(query.sortBy, query.sortOrder),
        skip,
        take: size,
      }),
      this.prisma.serviceRequest.count({ where: finalWhere }),
    ]);

    return {
      data: items.map((item) =>
        RequestResponseDto.from(item, {
          allowedActions: this.resolveWorkflowAllowedActions(permissions, requesterId, item, actorRoleCode),
        }),
      ),
      meta: pageMetaOf({ page, size, total }),
    };
  }

  async listTabCounts(
    tenantId: string,
    requesterId: string,
    permissions: string[],
    query: RequestQueryDto,
  ): Promise<RequestTabCountsResponseDto> {
    const where = this.buildListWhere(tenantId, requesterId, permissions, {
      ...query,
      tab: undefined,
    });

    const [allRequests, submittedTriage, unassigned, slaRisk, escalated, closed] = await this.prisma.$transaction([
      this.prisma.serviceRequest.count({ where }),
      this.prisma.serviceRequest.count({
        where: {
          ...where,
          status: { in: [RequestStatus.SUBMITTED, RequestStatus.TRIAGE] },
        },
      }),
      this.prisma.serviceRequest.count({
        where: {
          ...where,
          assigneeId: null,
        },
      }),
      this.prisma.serviceRequest.count({
        where: {
          ...where,
          slaRecords: {
            some: {
              health: { in: [SlaHealth.AT_RISK, SlaHealth.BREACHED] },
            },
          },
        },
      }),
      this.prisma.serviceRequest.count({
        where: {
          ...where,
          status: RequestStatus.WAITING_EXTERNAL_VENDOR,
        },
      }),
      this.prisma.serviceRequest.count({
        where: {
          ...where,
          status: RequestStatus.CLOSED,
        },
      }),
    ]);

    return {
      allRequests,
      submittedTriage,
      unassigned,
      slaRisk,
      escalated,
      closed,
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

      if (shouldSubmit) {
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

    await this.eventEmitter.emitAsync(
      REQUEST_EVENTS.CREATED,
      new RequestCreatedEvent(tenantId, created.id, requesterId, shouldSubmit),
    );

    if (shouldSubmit) {
      await this.eventEmitter.emitAsync(
        REQUEST_EVENTS.STATUS_CHANGED,
        new RequestStatusChangedEvent(
          tenantId,
          created.id,
          RequestStatus.DRAFT,
          RequestStatus.SUBMITTED,
          requesterId,
          'Requester submitted the request',
        ),
      );
    }

    const hydratedRequest = await this.prisma.serviceRequest.findFirst({
      where: {
        tenantId,
        id: created.id,
      },
      include: {
        serviceType: {
          select: {
            code: true,
            name: true,
          },
        },
        slaRecords: {
          select: {
            health: true,
            targetAt: true,
          },
          orderBy: {
            targetAt: 'asc',
          },
        },
        queue: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!hydratedRequest) {
      throw new NotFoundException('ServiceRequest', created.id);
    }

    return RequestResponseDto.from(hydratedRequest);
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

  async detailWorkflow(
    tenantId: string,
    requesterId: string,
    permissions: string[],
    requestId: string,
  ): Promise<RequestWorkflowDetailResponseDto> {
    const request = await this.findRequestById(tenantId, requesterId, permissions, requestId);
    const canReadInternal = permissions.includes('comment.read.internal');
    const actorRoleCode = await this.resolveActiveRoleCode(tenantId, requesterId);
    const canViewInternalEvents = actorRoleCode === 'OPS_COORDINATOR' || actorRoleCode === 'TENANT_ADMIN';

    const commentWhere: Prisma.RequestCommentWhereInput = canReadInternal
      ? { tenantId, requestId }
      : {
          OR: [
            { tenantId, requestId, visibility: CommentVisibility.PUBLIC },
            { tenantId, requestId, authorId: requesterId },
          ],
        };

    const [comments, workLogs, assignmentHistory, slaRecords, activities, attachments] = await this.prisma.$transaction([
      this.prisma.requestComment.findMany({
        where: commentWhere,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.workLog.findMany({
        where: { tenantId, requestId },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.assignmentHistory.findMany({
        where: { tenantId, requestId },
        orderBy: { changedAt: 'desc' },
      }),
      this.prisma.slaRecord.findMany({
        where: { tenantId, requestId },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.requestActivity.findMany({
        where: { tenantId, requestId },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.requestAttachment.findMany({
        where: { tenantId, requestId },
        include: {
          uploadedFile: {
            select: {
              id: true,
              fileName: true,
              fileUrl: true,
              mimeType: true,
              sizeBytes: true,
              uploadedById: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const actorIds = new Set<string>();
    actorIds.add(request.requesterId);
    if (request.assigneeId) {
      actorIds.add(request.assigneeId);
    }

    comments.forEach((item) => actorIds.add(item.authorId));
    workLogs.forEach((item) => actorIds.add(item.authorId));
    assignmentHistory.forEach((item) => {
      actorIds.add(item.changedById);
      if (item.fromAssigneeId) actorIds.add(item.fromAssigneeId);
      if (item.toAssigneeId) actorIds.add(item.toAssigneeId);
    });
    activities.forEach((item) => {
      if (item.actorId) actorIds.add(item.actorId);
    });
    attachments.forEach((item) => {
      actorIds.add(item.uploadedFile.uploadedById);
    });

    const actors =
      actorIds.size > 0
        ? await this.prisma.user.findMany({
            where: {
              tenantId,
              id: {
                in: Array.from(actorIds),
              },
            },
          })
        : [];

    const serviceTypeCode = request.serviceType?.code ?? 'GENERAL';
    const queueLabel = request.queue?.name ?? null;
    const tags = [
      `service:${serviceTypeCode.toLowerCase()}`,
      `status:${request.status.toLowerCase()}`,
      `priority:${request.priority.toLowerCase()}`,
      `channel:${request.sourceChannel.toLowerCase()}`,
      ...(request.locationId ? [`location:${request.locationId.toLowerCase()}`] : []),
      ...(request.assetId ? [`asset:${request.assetId.toLowerCase()}`] : []),
      ...(request.isInternalOnly ? ['visibility:internal'] : ['visibility:public']),
    ];
    const escalationRules = [
      `If overdue > ${RequestService.ESCALATION_AFTER_MINUTES} min, move to WAITING_EXTERNAL_VENDOR and notify OPS_COORDINATOR (${serviceTypeCode}).`,
    ];
    const allowedActions = this.resolveWorkflowAllowedActions(permissions, requesterId, request, actorRoleCode);
    const canAddWorkLog = this.canAddWorkLog(permissions, requesterId, request);
    const mappedActivities = activities.map((item) => RequestWorkflowActivityDto.from(item));
    const visibleActivities = canViewInternalEvents
      ? mappedActivities
      : mappedActivities.filter((item) => item.visibility === CommentVisibility.PUBLIC);

    return {
      request: RequestResponseDto.from(request),
      comments: comments.map((item) => RequestCommentResponseDto.from(item)),
      workLogs: workLogs.map((item) => RequestWorkLogResponseDto.from(item)),
      assignmentHistory: assignmentHistory.map((item) => RequestWorkflowAssignmentHistoryDto.from(item)),
      slaRecords: slaRecords.map((item) => RequestWorkflowSlaRecordDto.from(item)),
      activities: visibleActivities,
      attachments: attachments.map((item) => RequestWorkflowAttachmentDto.from(item)),
      actors: actors.map((item) => RequestWorkflowActorDto.from(item)),
      queueLabel,
      tags,
      escalationRules,
      allowedActions,
      canAddWorkLog,
    };
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
            avatarUrl: true,
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
        avatarUrl: member.user.avatarUrl ?? null,
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

    const actorRoleCode = this.normalizeSystemRoleCode(actorMembership?.roleCode);
    if (!actorRoleCode) {
      throw new ForbiddenException('Unable to resolve active role for status transition');
    }

    if (request.status === dto.status) {
      throw new ConflictException('INVALID_STATUS_TRANSITION', 'Request is already in the target status');
    }

    if (!this.isStatusTransitionAllowed(request.status, dto.status)) {
      throw new ConflictException(
        'INVALID_STATUS_TRANSITION',
        `Cannot transition from ${request.status} to ${dto.status}`,
      );
    }

    if (!this.canTransitionStatus(permissions, actorId, request, dto.status, actorRoleCode)) {
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

    await this.eventEmitter.emitAsync(
      REQUEST_EVENTS.STATUS_CHANGED,
      new RequestStatusChangedEvent(
        tenantId,
        request.id,
        request.status,
        dto.status,
        actorId,
        'Request status was updated',
      ),
    );

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

    await this.eventEmitter.emitAsync(
      REQUEST_EVENTS.COMMENT_ADDED,
      new RequestCommentAddedEvent(
        tenantId,
        requestId,
        authorId,
        body,
        visibility,
        created.id,
      ),
    );

    return RequestCommentResponseDto.from(created);
  }

  async listComments(
    tenantId: string,
    actorId: string,
    permissions: string[],
    requestId: string,
    query: RequestCommentQueryDto,
  ): Promise<{ data: RequestCommentResponseDto[]; meta: PageMeta }> {
    await this.findRequestById(tenantId, actorId, permissions, requestId);

    const page = query.page ?? 1;
    const size = query.size ?? 20;
    const skip = (page - 1) * size;

    const canReadInternal = permissions.includes('comment.read.internal');
    const visibilityFilter: Prisma.RequestCommentWhereInput[] = canReadInternal
      ? [{ requestId, tenantId }]
      : [
          { requestId, tenantId, visibility: CommentVisibility.PUBLIC },
          { requestId, tenantId, authorId: actorId },
        ];

    const where: Prisma.RequestCommentWhereInput = {
      OR: visibilityFilter,
      ...(query.visibility ? { visibility: query.visibility } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.requestComment.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        skip,
        take: size,
      }),
      this.prisma.requestComment.count({ where }),
    ]);

    return {
      data: items.map((item) => RequestCommentResponseDto.from(item)),
      meta: pageMetaOf({ page, size, total }),
    };
  }

  async addWorkLog(
    tenantId: string,
    authorId: string,
    permissions: string[],
    requestId: string,
    dto: CreateRequestWorkLogDto,
  ): Promise<RequestWorkLogResponseDto> {
    const request = await this.findRequestById(tenantId, authorId, permissions, requestId);

    if (!this.canAddWorkLog(permissions, authorId, request)) {
      throw new ForbiddenException('You do not have permission to add work logs for this request');
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

    await this.eventEmitter.emitAsync(
      REQUEST_EVENTS.WORK_LOG_ADDED,
      new RequestWorkLogAddedEvent(
        tenantId,
        requestId,
        authorId,
        content,
        created.id,
        created.minutesSpent,
      ),
    );

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
    const nextStatus = this.resolveStatusOnAssign(request.status);

    const updated = await this.prisma.$transaction(async (tx) => {
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

    await this.eventEmitter.emitAsync(
      REQUEST_EVENTS.ASSIGNED,
      new RequestAssignedEvent(tenantId, request.id, dto.assigneeId, actorId, request.assigneeId),
    );

    if (nextStatus && nextStatus !== request.status) {
      await this.eventEmitter.emitAsync(
        REQUEST_EVENTS.STATUS_CHANGED,
        new RequestStatusChangedEvent(
          tenantId,
          request.id,
          request.status,
          nextStatus,
          actorId,
          'Status moved to ASSIGNED after assignment',
        ),
      );
    }

    return RequestResponseDto.from(updated);
  }

  async unassign(
    tenantId: string,
    actorId: string,
    permissions: string[],
    requestId: string,
  ): Promise<RequestResponseDto> {
    const request = await this.findRequestById(tenantId, actorId, permissions, requestId);

    if (!request.assigneeId) {
      return RequestResponseDto.from(request);
    }

    if (!permissions.includes('request.reassign')) {
      throw new ForbiddenException('You do not have permission to unassign this request');
    }

    const nextStatus = this.resolveStatusOnUnassign(request.status);
    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.serviceRequest.update({
        where: { id: request.id },
        data: {
          assigneeId: null,
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
          toAssigneeId: null,
          changedById: actorId,
          reason: 'Request unassigned',
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          requestId: request.id,
          entityType: 'REQUEST',
          entityId: request.id,
          action: 'REQUEST_UNASSIGNED',
          actorId,
          beforeData: {
            assigneeId: request.assigneeId,
            status: request.status,
          },
          afterData: {
            assigneeId: null,
            status: nextStatus ?? request.status,
          },
        },
      });

      return updatedRequest;
    });

    await this.eventEmitter.emitAsync(
      REQUEST_EVENTS.ASSIGNED,
      new RequestAssignedEvent(tenantId, request.id, null, actorId, request.assigneeId),
    );

    if (nextStatus && nextStatus !== request.status) {
      await this.eventEmitter.emitAsync(
        REQUEST_EVENTS.STATUS_CHANGED,
        new RequestStatusChangedEvent(
          tenantId,
          request.id,
          request.status,
          nextStatus,
          actorId,
          'Status moved after unassignment',
        ),
      );
    }

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
        slaRecords: {
          select: {
            health: true,
            targetAt: true,
          },
          orderBy: {
            targetAt: 'asc',
          },
        },
        queue: {
          select: {
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

  private buildListWhere(
    tenantId: string,
    requesterId: string,
    permissions: string[],
    query: RequestQueryDto,
  ): Prisma.ServiceRequestWhereInput {
    const startOfTodayUtc = new Date();
    startOfTodayUtc.setUTCHours(0, 0, 0, 0);

    const serviceTypeCode = query.serviceTypeCode?.trim().toUpperCase();
    const locationId = query.locationId?.trim();

    return {
      tenantId,
      ...this.readScopeWhere(requesterId, permissions),
      ...(query.status ? { status: query.status } : {}),
      ...(serviceTypeCode ? { serviceType: { code: serviceTypeCode } } : {}),
      ...(query.assigneeId ? { assigneeId: query.assigneeId } : {}),
      ...(locationId ? { locationId } : {}),
      ...(query.slaHealth ? { slaRecords: { some: { health: query.slaHealth } } } : {}),
      ...(query.updatedToday ? { updatedAt: { gte: startOfTodayUtc } } : {}),
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
  }

  private buildOrderBy(
    sortBy: SortableRequestField | undefined,
    sortOrder: 'asc' | 'desc' | undefined,
  ): Prisma.ServiceRequestOrderByWithRelationInput {
    const dir = sortOrder ?? 'desc';
    switch (sortBy) {
      case 'serviceType':
        return { serviceType: { name: dir } };
      case 'assignee':
        return { assignee: { fullName: dir } };
      case 'location':
        return { locationId: dir };
      default:
        return { [sortBy ?? 'updatedAt']: dir };
    }
  }

  private buildTabWhere(tab?: RequestTabKey): Prisma.ServiceRequestWhereInput {
    if (tab === 'submittedTriage') {
      return { status: { in: [RequestStatus.SUBMITTED, RequestStatus.TRIAGE] } };
    }
    if (tab === 'unassigned') {
      return { assigneeId: null };
    }
    if (tab === 'slaRisk') {
      return { slaRecords: { some: { health: { in: [SlaHealth.AT_RISK, SlaHealth.BREACHED] } } } };
    }
    if (tab === 'escalated') {
      return { status: RequestStatus.WAITING_EXTERNAL_VENDOR };
    }
    if (tab === 'closed') {
      return { status: RequestStatus.CLOSED };
    }

    return {};
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
      [RequestStatus.WAITING_FOR_CUSTOMER]: [
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
    actorRoleCode: SystemRoleCode,
  ): boolean {
    const canReadAll = permissions.includes('request.read.all');
    const isRequester = request.requesterId === actorId;
    const isAssignee = request.assigneeId === actorId;
    const isTenantAdmin = actorRoleCode === 'TENANT_ADMIN';
    const isOpsCoordinator = actorRoleCode === 'OPS_COORDINATOR';
    const isTechnician = actorRoleCode === 'TECHNICIAN';
    const isEmployee = actorRoleCode === 'EMPLOYEE';

    if (target === RequestStatus.SUBMITTED) {
      return (isEmployee || isTenantAdmin) && isRequester;
    }

    if (target === RequestStatus.ASSIGNED || target === RequestStatus.TRIAGE) {
      return (isOpsCoordinator || isTenantAdmin) &&
        (permissions.includes('request.assign') || permissions.includes('request.reassign'));
    }

    if (target === RequestStatus.IN_PROGRESS) {
      return (isTechnician || isTenantAdmin) && permissions.includes('request.start_work') && (canReadAll || isAssignee);
    }

    if (target === RequestStatus.RESOLVED) {
      return (isTechnician || isTenantAdmin) && permissions.includes('request.resolve') && (canReadAll || isAssignee);
    }

    if (target === RequestStatus.CLOSED) {
      if (!(isEmployee || isOpsCoordinator || isTenantAdmin)) {
        return false;
      }
      return permissions.includes('request.close') && (canReadAll || isRequester);
    }

    if (target === RequestStatus.REOPENED) {
      if (!(isEmployee || isOpsCoordinator || isTenantAdmin)) {
        return false;
      }
      return permissions.includes('request.reopen') && (canReadAll || isRequester);
    }

    if (target === RequestStatus.WAITING_EXTERNAL_VENDOR) {
      return (isOpsCoordinator || isTenantAdmin) &&
        (permissions.includes('request.escalate') || permissions.includes('request.resolve'));
    }

    if (target === RequestStatus.CANCELLED) {
      if (isTenantAdmin) {
        return true;
      }
      return isEmployee && isRequester;
    }

    return false;
  }

  private canAddWorkLog(
    permissions: string[],
    actorId: string,
    request: RequestWithServiceType,
  ): boolean {
    const canStartWork = permissions.includes('request.start_work');
    const canReadAll = permissions.includes('request.read.all');
    if (!canStartWork && !canReadAll) {
      return false;
    }

    if (canReadAll) {
      return true;
    }

    return request.assigneeId === actorId;
  }

  private normalizeSystemRoleCode(roleCode: string | null | undefined): SystemRoleCode | null {
    if (
      roleCode === 'EMPLOYEE' ||
      roleCode === 'OPS_COORDINATOR' ||
      roleCode === 'TECHNICIAN' ||
      roleCode === 'TENANT_ADMIN'
    ) {
      return roleCode;
    }

    return null;
  }

  private resolveStatusOnAssign(status: RequestStatus): RequestStatus | null {
    if (status === RequestStatus.SUBMITTED || status === RequestStatus.TRIAGE || status === RequestStatus.REOPENED) {
      return RequestStatus.ASSIGNED;
    }

    return null;
  }

  private resolveStatusOnUnassign(status: RequestStatus): RequestStatus | null {
    if (
      status === RequestStatus.ASSIGNED ||
      status === RequestStatus.IN_PROGRESS ||
      status === RequestStatus.WAITING_EXTERNAL_VENDOR
    ) {
      return RequestStatus.TRIAGE;
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

  private resolveWorkflowAllowedActions(
    permissions: string[],
    actorId: string,
    request: RequestWithServiceType,
    actorRoleCode: SystemRoleCode | null,
  ): string[] {
    if (!actorRoleCode) {
      return [];
    }

    const actionOrder = WORKFLOW_ACTION_ORDER[request.status] ?? [];
    if (actionOrder.length === 0) {
      return [];
    }

    const canReadAll = permissions.includes('request.read.all');
    const isRequester = request.requesterId === actorId;
    const isAssignee = request.assigneeId === actorId;
    const hasAssignee = Boolean(request.assigneeId);
    const canAssign = permissions.includes('request.assign');
    const canReassign = permissions.includes('request.reassign');
    const canManageAssignment = actorRoleCode === 'OPS_COORDINATOR' || actorRoleCode === 'TENANT_ADMIN';
    const canSelfAssignRole = this.canAssignToRole(actorRoleCode, actorRoleCode);
    const canTransitionTo = (target: RequestStatus) =>
      this.isStatusTransitionAllowed(request.status, target) &&
      this.canTransitionStatus(permissions, actorId, request, target, actorRoleCode);

    return actionOrder.filter((action) => {
      switch (action) {
        case 'EDIT_DRAFT':
        case 'SUBMIT':
          return canTransitionTo(RequestStatus.SUBMITTED);
        case 'ASSIGN':
          return !hasAssignee && canManageAssignment && canAssign;
        case 'REASSIGN':
          return hasAssignee && canManageAssignment && canReassign;
        case 'ASSIGN_TO_ME':
          return !isAssignee && canSelfAssignRole && (canAssign || canReassign);
        case 'START_PROGRESS':
          return canTransitionTo(RequestStatus.IN_PROGRESS);
        case 'RESOLVE':
          return canTransitionTo(RequestStatus.RESOLVED);
        case 'CLOSE':
          return canTransitionTo(RequestStatus.CLOSED);
        case 'REOPEN':
          return canTransitionTo(RequestStatus.REOPENED);
        case 'ESCALATE':
          return canTransitionTo(RequestStatus.WAITING_EXTERNAL_VENDOR);
        case 'ADD_NOTE':
          return permissions.includes('comment.create.internal') && (canReadAll || isAssignee || isRequester);
        default:
          return false;
      }
    });
  }

  private async resolveActiveRoleCode(tenantId: string, userId: string): Promise<SystemRoleCode | null> {
    const membership = await this.prisma.membership.findFirst({
      where: {
        tenantId,
        userId,
        status: MembershipStatus.ACTIVE,
      },
      select: {
        roleCode: true,
      },
    });

    return this.normalizeSystemRoleCode(membership?.roleCode);
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
