import type {
  AssignmentHistoryEntry,
  RequestAssignee,
  RequestComment,
  RequestSlaRecord,
  RequestWorkLog,
  RequestWorkflowActivity,
  RequestWorkflowActor,
  RequestWorkflowAttachment,
  ServiceRequest,
  UserRole,
} from "@supportops/types";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDialog } from "@supportops/ui";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { requestService } from "@/features/service-ops/requests/services/request.service";
import { ApiError } from "@/lib/api";

import { REQUEST_STATUSES } from "../types";
import type {
  CommentPayload,
  HeaderAction,
  RequestDetail,
  RequestPriority,
  RequestStatus,
  WorkLogPayload,
} from "../types";

const DEFAULT_ROLE: UserRole = "EMPLOYEE";

function formatBytes(sizeBytes: number): string {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${(sizeBytes / 1024).toFixed(1)} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function mapActivityType(eventType: RequestWorkflowActivity["eventType"]): RequestDetail["timeline"][number]["type"] {
  switch (eventType) {
    case "REQUEST_CREATED":
      return "REQUEST_CREATED";
    case "STATUS_CHANGED":
      return "STATUS_CHANGED";
    case "REQUEST_ASSIGNED":
      return "ASSIGNED";
    case "REQUEST_REASSIGNED":
      return "REASSIGNED";
    case "COMMENT_ADDED":
      return "PUBLIC_COMMENT";
    case "WORK_LOG_ADDED":
      return "INTERNAL_NOTE";
    case "SLA_AT_RISK":
    case "SLA_BREACHED":
      return "SLA_WARNING";
    case "REQUEST_RESOLVED":
      return "RESOLUTION_SUBMITTED";
    case "REQUEST_CLOSED":
      return "REQUEST_CLOSED";
    case "REQUEST_REOPENED":
      return "REQUEST_REOPENED";
    case "REQUEST_ESCALATED":
      return "ESCALATED";
    default:
      return "SYSTEM_RULE_TRIGGERED";
  }
}

function createEmptyRequestDetail(requestId: string, tenantName?: string): RequestDetail {
  return {
    id: requestId,
    requestCode: requestId,
    title: "",
    status: "TRIAGE",
    priority: "MEDIUM",
    updatedAtLabel: "-",
    requester: {
      id: "",
      name: "-",
    },
    assignee: undefined,
    assignment: {
      queueLabel: undefined,
      handoffHistory: [],
    },
    relationship: {
      isRequester: false,
      isAssignee: false,
    },
    overview: {
      serviceType: "-",
      category: "-",
      location: "-",
      asset: undefined,
      createdAt: "-",
      description: "",
    },
    attachments: [],
    sla: {
      assignmentSla: undefined,
      resolutionSla: undefined,
      escalationRules: [],
    },
    metadata: {
      tenantName: tenantName ?? "-",
      sourceChannel: undefined,
      impactLevel: undefined,
      urgency: undefined,
      serviceType: undefined,
      asset: undefined,
      location: undefined,
      tags: [],
    },
    timeline: [],
    comments: [],
    auditSummary: [],
  };
}

export function useRequestDetail(requestId: string) {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const t = useTranslations("pages.requests.detail");
  const { user } = useAuth();
  const assignDialog = useDialog();

  const role = user?.role ?? DEFAULT_ROLE;

  const [serviceRequest, setServiceRequest] = useState<ServiceRequest | null>(null);
  const [comments, setComments] = useState<RequestComment[]>([]);
  const [workLogs, setWorkLogs] = useState<RequestWorkLog[]>([]);
  const [assignmentHistory, setAssignmentHistory] = useState<AssignmentHistoryEntry[]>([]);
  const [slaRecords, setSlaRecords] = useState<RequestSlaRecord[]>([]);
  const [activities, setActivities] = useState<RequestWorkflowActivity[]>([]);
  const [attachments, setAttachments] = useState<RequestWorkflowAttachment[]>([]);
  const [actors, setActors] = useState<RequestWorkflowActor[]>([]);
  const [queueLabel, setQueueLabel] = useState<string | null>(null);
  const [workflowTags, setWorkflowTags] = useState<string[]>([]);
  const [escalationRules, setEscalationRules] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [mutationSuccess, setMutationSuccess] = useState<string | null>(null);
  const [reassignMode, setReassignMode] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [assignableUsers, setAssignableUsers] = useState<RequestAssignee[]>([]);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState("");

  const isAccessDeniedError = useCallback((error: ApiError) => {
    if (error.status === 403) return true;
    if (error.status !== 404) return false;

    return (
      error.code === "NOT_FOUND" &&
      typeof error.message === "string" &&
      error.message.toLowerCase().includes("servicerequest not found")
    );
  }, []);

  const refreshDetail = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    setComments([]);
    setWorkLogs([]);
    setAssignmentHistory([]);
    setSlaRecords([]);
    setActivities([]);
    setAttachments([]);
    setActors([]);
    setQueueLabel(null);
    setWorkflowTags([]);
    setEscalationRules([]);
    try {
      const { data } = await requestService.detailWorkflow(requestId);
      setServiceRequest(data.request);
      setComments(data.comments);
      setWorkLogs(data.workLogs);
      setAssignmentHistory(data.assignmentHistory);
      setSlaRecords(data.slaRecords);
      setActivities(data.activities);
      setAttachments(data.attachments);
      setActors(data.actors);
      setQueueLabel(data.queueLabel);
      setWorkflowTags(data.tags);
      setEscalationRules(data.escalationRules);
    } catch (error) {
      if (error instanceof ApiError) {
        if (isAccessDeniedError(error)) {
          router.replace(`/${locale}/access-denied`);
          return;
        }
        setLoadError(error.error.message);
      } else {
        setLoadError(t("feedback.loadDetailError"));
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAccessDeniedError, locale, requestId, router, t]);

  useEffect(() => {
    void refreshDetail();
  }, [refreshDetail]);

  const request = useMemo<RequestDetail>(() => {
    if (!serviceRequest) {
      return createEmptyRequestDetail(requestId, user?.tenantName);
    }

    const actorMap = new Map(actors.map((item) => [item.id, item] as const));
    const resolveActorName = (id?: string | null): string | undefined => {
      if (!id) return undefined;
      return actorMap.get(id)?.fullName ?? id;
    };

    const sourcePriority = serviceRequest.priority as RequestPriority;
    const safePriority =
      sourcePriority === "URGENT" ||
      sourcePriority === "HIGH" ||
      sourcePriority === "MEDIUM" ||
      sourcePriority === "LOW"
        ? sourcePriority
        : "MEDIUM";

    const sourceStatus = serviceRequest.status as RequestStatus;
    const safeStatus: RequestStatus = REQUEST_STATUSES.includes(sourceStatus) ? sourceStatus : "TRIAGE";

    const requesterProfile = actorMap.get(serviceRequest.requesterId);
    const assigneeProfile = serviceRequest.assigneeId ? actorMap.get(serviceRequest.assigneeId) : undefined;

    const handoffHistory = assignmentHistory.map((item) => ({
      id: item.id,
      from: resolveActorName(item.fromAssigneeId) ?? "Unassigned",
      to: resolveActorName(item.toAssigneeId) ?? "Unassigned",
      at: new Date(item.changedAt).toLocaleString(),
      by: resolveActorName(item.changedById) ?? item.changedById,
    }));

    const activityTimeline = activities.map((item) => ({
      id: item.id,
      type: mapActivityType(item.eventType),
      title: item.title,
      description: item.description ?? undefined,
      actorName: resolveActorName(item.actorId),
      actorType: item.actorType,
      visibility: item.visibility,
      createdAt: new Date(item.createdAt).toLocaleString(),
    }));

    const assignmentSlaRecord = slaRecords.find((item) => item.type === "ASSIGNMENT");
    const resolutionSlaRecord = slaRecords.find((item) => item.type === "RESOLUTION");
    const now = Date.now();
    const toRemainingSeconds = (targetAt: string) =>
      Math.max(0, Math.floor((new Date(targetAt).getTime() - now) / 1000));
    const toTargetMinutes = (targetAt: string) =>
      Math.max(0, Math.round((new Date(targetAt).getTime() - new Date(serviceRequest.createdAt).getTime()) / 60_000));
    const mapSlaState = (health: RequestSlaRecord["health"]) => {
      if (health === "AT_RISK") return "AT_RISK" as const;
      if (health === "BREACHED") return "BREACHED" as const;
      return "ON_TRACK" as const;
    };

    return {
      ...createEmptyRequestDetail(requestId, user?.tenantName),
      id: serviceRequest.id,
      requestCode: serviceRequest.requestCode ?? serviceRequest.id,
      title: serviceRequest.title,
      status: safeStatus,
      priority: safePriority,
      updatedAtLabel: new Date(serviceRequest.updatedAt).toLocaleString(),
      requester: {
        id: serviceRequest.requesterId,
        name: requesterProfile?.fullName ?? serviceRequest.requesterId,
        email: requesterProfile?.email,
        avatarUrl: requesterProfile?.avatarUrl,
      },
      assignee: serviceRequest.assigneeId
        ? {
            id: serviceRequest.assigneeId,
            name: assigneeProfile?.fullName ?? serviceRequest.assigneeId,
            email: assigneeProfile?.email,
            avatarUrl: assigneeProfile?.avatarUrl,
            roleLabel: t("assignment.assigneeRole"),
          }
        : undefined,
      relationship: {
        isRequester: serviceRequest.requesterId === user?.id,
        isAssignee: serviceRequest.assigneeId === user?.id,
      },
      overview: {
        serviceType: serviceRequest.serviceTypeName ?? serviceRequest.serviceTypeCode ?? serviceRequest.serviceTypeId,
        category: serviceRequest.serviceTypeCode ?? serviceRequest.serviceTypeId,
        location: serviceRequest.locationId,
        asset: serviceRequest.assetId ?? undefined,
        createdAt: new Date(serviceRequest.createdAt).toLocaleString(),
        description: serviceRequest.description,
      },
      attachments: attachments.map((item) => ({
        id: item.id,
        fileName: item.fileName,
        fileSizeLabel: formatBytes(item.sizeBytes),
        uploadedBy: resolveActorName(item.uploadedById) ?? item.uploadedById,
        uploadedAt: new Date(item.createdAt).toLocaleString(),
        url: item.fileUrl,
      })),
      metadata: {
        tenantName: user?.tenantName ?? "-",
        sourceChannel: serviceRequest.sourceChannel,
        impactLevel: serviceRequest.impactLevel,
        urgency: serviceRequest.urgency,
        serviceType: serviceRequest.serviceTypeName ?? serviceRequest.serviceTypeCode ?? serviceRequest.serviceTypeId,
        asset: serviceRequest.assetId ?? undefined,
        location: serviceRequest.locationId,
        tags: workflowTags,
      },
      comments: comments.map((item) => ({
        id: item.id,
        authorName: resolveActorName(item.authorId) ?? item.authorId,
        visibility: item.visibility,
        body: item.body,
        createdAt: new Date(item.createdAt).toLocaleString(),
      })),
      timeline: activityTimeline,
      assignment: {
        queueLabel: queueLabel ?? serviceRequest.queueLabel ?? undefined,
        handoffHistory,
      },
      sla: {
        assignmentSla: assignmentSlaRecord
          ? {
              targetMinutes: toTargetMinutes(assignmentSlaRecord.targetAt),
              remainingSeconds: toRemainingSeconds(assignmentSlaRecord.targetAt),
              state: mapSlaState(assignmentSlaRecord.health),
            }
          : undefined,
        resolutionSla: resolutionSlaRecord
          ? {
              targetMinutes: toTargetMinutes(resolutionSlaRecord.targetAt),
              remainingSeconds: toRemainingSeconds(resolutionSlaRecord.targetAt),
              state: mapSlaState(resolutionSlaRecord.health),
            }
          : undefined,
        escalationRules,
      },
      auditSummary: [],
    };
  }, [actors, assignmentHistory, attachments, comments, requestId, serviceRequest, slaRecords, t, user, activities, queueLabel, workflowTags, escalationRules]);

  const extractError = useCallback((error: unknown, fallback: string): string => {
    if (error instanceof ApiError) return error.error.message;
    return fallback;
  }, []);

  const executeMutation = useCallback(async (runner: () => Promise<void>, successMessage: string) => {
    setIsSubmitting(true);
    setMutationError(null);
    setMutationSuccess(null);
    try {
      await runner();
      setMutationSuccess(successMessage);
    } catch (error) {
      setMutationError(extractError(error, t("feedback.actionFailed")));
    } finally {
      setIsSubmitting(false);
    }
  }, [extractError, t]);

  const handleAssign = useCallback(async (reassign: boolean) => {
    if (!serviceRequest) return;

    setReassignMode(reassign);
    setSelectedAssigneeId(serviceRequest.assigneeId ?? "");
    assignDialog.open();
    setIsLoadingUsers(true);
    try {
      const { data } = await requestService.listAssignees();
      setAssignableUsers(data);
    } catch (error) {
      setMutationError(extractError(error, t("feedback.loadAssigneesError")));
    } finally {
      setIsLoadingUsers(false);
    }
  }, [assignDialog, extractError, serviceRequest, t]);

  const handleAssignToMe = useCallback(async () => {
    if (!serviceRequest || !user?.id) return;

    await executeMutation(async () => {
      const { data } = await requestService.assign(serviceRequest.id, { assigneeId: user.id });
      setServiceRequest(data);
      await refreshDetail();
    }, t("feedback.assignedToYou"));
  }, [executeMutation, refreshDetail, serviceRequest, t, user?.id]);

  const handleCommentSubmit = useCallback(async (payload: CommentPayload) => {
    if (!serviceRequest) return;

    await executeMutation(async () => {
      const { data } = await requestService.addComment(serviceRequest.id, payload);
      setComments((current) => [...current, data]);
      await refreshDetail();
    }, t("feedback.commentAdded"));
  }, [executeMutation, refreshDetail, serviceRequest, t]);

  const handleWorkLogSubmit = useCallback(async (payload: WorkLogPayload) => {
    if (!serviceRequest) return;

    await executeMutation(async () => {
      const { data } = await requestService.addWorkLog(serviceRequest.id, payload);
      setWorkLogs((current) => [...current, data]);
      await refreshDetail();
    }, t("feedback.workLogAdded"));
  }, [executeMutation, refreshDetail, serviceRequest, t]);

  const handleAssignConfirm = useCallback(async (assigneeId: string) => {
    if (!serviceRequest || !assigneeId) return;

    await executeMutation(async () => {
      const { data } = await requestService.assign(serviceRequest.id, { assigneeId });
      setServiceRequest(data);
      assignDialog.close();
      await refreshDetail();
    }, reassignMode ? t("feedback.requestReassigned") : t("feedback.requestAssigned"));
  }, [assignDialog, executeMutation, reassignMode, refreshDetail, serviceRequest, t]);

  const handleHeaderAction = useCallback((action: HeaderAction) => {
    if (!serviceRequest) return;

    const statusMap: Partial<Record<HeaderAction, RequestStatus>> = {
      SUBMIT: "SUBMITTED",
      START_PROGRESS: "IN_PROGRESS",
      RESOLVE: "RESOLVED",
      CLOSE: "CLOSED",
      REOPEN: "REOPENED",
      ESCALATE: "WAITING_EXTERNAL_VENDOR",
    };

    if (action === "ASSIGN") {
      void handleAssign(false);
      return;
    }
    if (action === "REASSIGN") {
      void handleAssign(true);
      return;
    }
    if (action === "ASSIGN_TO_ME") {
      void handleAssignToMe();
      return;
    }
    if (action === "ADD_NOTE") {
      setMutationSuccess(t("feedback.addNoteHint"));
      return;
    }

    const targetStatus = statusMap[action];
    if (!targetStatus) return;

    void executeMutation(async () => {
      const { data } = await requestService.updateStatus(serviceRequest.id, { status: targetStatus });
      setServiceRequest(data);
      await refreshDetail();
    }, t("feedback.statusUpdated"));
  }, [executeMutation, handleAssign, handleAssignToMe, refreshDetail, serviceRequest, t]);

  return {
    request,
    role,
    workLogs,
    isLoading,
    isSubmitting,
    loadError,
    mutationError,
    mutationSuccess,
    reassignMode,
    isLoadingUsers,
    assignableUsers,
    selectedAssigneeId,
    assignDialog,
    handleHeaderAction,
    handleCommentSubmit,
    handleWorkLogSubmit,
    handleAssign,
    handleAssignToMe,
    handleAssignConfirm,
    refreshDetail,
  };
}
