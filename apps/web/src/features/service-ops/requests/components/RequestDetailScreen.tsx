"use client";

import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { RequestAssignee, RequestComment, RequestWorkLog, ServiceRequest, UserRole } from "@supportops/types";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { SelectOptionField } from "@supportops/ui-form";
import { FormDialog } from "@supportops/ui-dialog";
import { useDialog } from "@supportops/ui";

import { EntityDetailLayout } from "@/components/entity-detail-layout";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { requestService } from "@/features/service-ops/requests/services/request.service";
import { ApiError } from "@/lib/api";

import styles from "./request-detail-screen.module.css";

type DetailProps = {
  requestId: string;
};

const REQUEST_ASSIGN_FORM_ID = "request-assign-form";

type RequestStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "TRIAGE"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "WAITING_EXTERNAL_VENDOR"
  | "REOPENED"
  | "CANCELLED";
type RequestPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "CRITICAL";
type CommentVisibility = "PUBLIC" | "INTERNAL";
type SlaState = "ON_TRACK" | "AT_RISK" | "BREACHED";

type HeaderAction =
  | "EDIT_DRAFT"
  | "SUBMIT"
  | "ASSIGN"
  | "REASSIGN"
  | "ASSIGN_TO_ME"
  | "START_PROGRESS"
  | "RESOLVE"
  | "CLOSE"
  | "REOPEN"
  | "ESCALATE"
  | "ADD_NOTE";

type TimelineEventType =
  | "REQUEST_CREATED"
  | "STATUS_CHANGED"
  | "ASSIGNED"
  | "REASSIGNED"
  | "SLA_WARNING"
  | "INTERNAL_NOTE"
  | "PUBLIC_COMMENT"
  | "RESOLUTION_SUBMITTED"
  | "REQUEST_CLOSED"
  | "REQUEST_REOPENED"
  | "ESCALATED"
  | "SYSTEM_RULE_TRIGGERED";

type RequestDetail = {
  id: string;
  requestCode: string;
  title: string;
  status: RequestStatus;
  priority: RequestPriority;
  updatedAtLabel: string;

  requester: {
    id: string;
    name: string;
  };

  assignee?: {
    id: string;
    name: string;
    roleLabel: string;
    etaLabel?: string;
    team?: string;
  };

  assignment: {
    queueLabel?: string;
    handoffHistory: Array<{
      id: string;
      from: string;
      to: string;
      at: string;
      by: string;
    }>;
  };

  relationship: {
    isRequester: boolean;
    isAssignee: boolean;
  };

  overview: {
    serviceType: string;
    category: string;
    location: string;
    asset?: string;
    createdAt: string;
    description: string;
  };

  attachments: Array<{
    id: string;
    fileName: string;
    fileSizeLabel: string;
    uploadedBy: string;
    uploadedAt: string;
    url: string;
  }>;

  sla: {
    assignmentSla?: {
      targetMinutes: number;
      remainingSeconds: number;
      state: SlaState;
    };
    resolutionSla?: {
      targetMinutes: number;
      remainingSeconds: number;
      state: SlaState;
    };
    escalationRules: string[];
  };

  metadata: {
    tenantName: string;
    sourceChannel?: string;
    impactLevel?: string;
    urgency?: string;
    serviceType?: string;
    asset?: string;
    location?: string;
    tags: string[];
  };

  timeline: Array<{
    id: string;
    type: TimelineEventType;
    title: string;
    description?: string;
    actorName?: string;
    actorType?: "USER" | "SYSTEM";
    visibility: CommentVisibility;
    createdAt: string;
  }>;

  comments: Array<{
    id: string;
    authorName: string;
    authorRoleLabel?: string;
    visibility: CommentVisibility;
    body: string;
    createdAt: string;
  }>;

  auditSummary?: Array<{
    id: string;
    summary: string;
    createdAt: string;
  }>;
};

type MetadataAccessLevel = "BASIC" | "LIMITED" | "FULL";

type ScenarioKey = "requesterResolved" | "coordinatorTriage" | "technicianInProgress";

type RequestDetailScenario = {
  key: ScenarioKey;
  label: string;
  role: UserRole;
  detail: RequestDetail;
};

type HeaderActionParams = {
  role: UserRole;
  status: RequestStatus;
  isRequester: boolean;
  isAssignee: boolean;
  hasAssignee: boolean;
};

type SectionVisibility = {
  showSlaDetails: boolean;
  showEscalationRules: boolean;
  showAuditSummary: boolean;
  showInternalNotes: boolean;
  metadataAccess: MetadataAccessLevel;
  metadataEditable: boolean;
};

const INTERNAL_ROLES: ReadonlySet<UserRole> = new Set(["OPS_COORDINATOR", "TECHNICIAN", "TENANT_ADMIN"]);
const REOPENABLE_STATUSES: ReadonlySet<RequestStatus> = new Set(["RESOLVED", "CLOSED"]);
const REQUEST_STATUSES: RequestStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "TRIAGE",
  "ASSIGNED",
  "IN_PROGRESS",
  "WAITING_EXTERNAL_VENDOR",
  "RESOLVED",
  "CLOSED",
  "REOPENED",
  "CANCELLED",
];

const HEADER_ACTION_LABELS: Record<HeaderAction, string> = {
  EDIT_DRAFT: "Edit draft",
  SUBMIT: "Submit",
  ASSIGN: "Assign",
  REASSIGN: "Reassign",
  ASSIGN_TO_ME: "Assign to me",
  START_PROGRESS: "Start progress",
  RESOLVE: "Resolve",
  CLOSE: "Close",
  REOPEN: "Reopen",
  ESCALATE: "Escalate",
  ADD_NOTE: "Add note",
};

const ROLE_LABELS: Record<UserRole, string> = {
  EMPLOYEE: "Requester",
  OPS_COORDINATOR: "Ops Coordinator",
  TECHNICIAN: "Technician",
  TENANT_ADMIN: "Tenant Admin",
};

const SLA_STATE_LABELS: Record<SlaState, string> = {
  ON_TRACK: "On track",
  AT_RISK: "At risk",
  BREACHED: "Breached",
};

const BASE_REQUEST: Omit<RequestDetail, "status" | "relationship"> = {
  id: "req-2026-00124",
  requestCode: "REQ-2026-00124",
  title: "Office AC leaking at Floor 5 - Meeting Room C",
  priority: "HIGH",
  updatedAtLabel: "5 min ago",
  requester: {
    id: "user-requester",
    name: "Alex Nguyen",
  },
  assignee: {
    id: "user-assignee",
    name: "Linh Tran",
    roleLabel: "Assigned technician",
    etaLabel: "On-site in 10 minutes",
    team: "HVAC Specialist",
  },
  assignment: {
    queueLabel: "HVAC Ops Team",
    handoffHistory: [
      {
        id: "h1",
        from: "Unassigned",
        to: "Linh Tran",
        at: "09:12",
        by: "Thao Pham",
      },
      {
        id: "h2",
        from: "Linh Tran",
        to: "External Vendor · CoolAir Services",
        at: "09:50",
        by: "Thao Pham",
      },
    ],
  },
  overview: {
    serviceType: "Office Maintenance",
    category: "HVAC & Cooling",
    location: "HQ · Floor 5 · Meeting Room C",
    asset: "AC Unit · Daikin · MC-5C-03",
    createdAt: "16 Mar 2026 · 09:08",
    description:
      "AC unit in Meeting Room C is leaking water onto the table and floor. Leak has increased in the last 30 minutes and is starting to affect nearby power sockets. Please prioritize before the afternoon workshops start at 2pm.",
  },
  attachments: [
    {
      id: "a1",
      fileName: "Leak-photo-1.jpg",
      fileSizeLabel: "1.2 MB",
      uploadedBy: "Alex Nguyen",
      uploadedAt: "Today · 09:10",
      url: "#",
    },
    {
      id: "a2",
      fileName: "Room-C-floorplan.pdf",
      fileSizeLabel: "540 KB",
      uploadedBy: "Alex Nguyen",
      uploadedAt: "Today · 09:12",
      url: "#",
    },
  ],
  sla: {
    assignmentSla: {
      targetMinutes: 30,
      remainingSeconds: 730,
      state: "AT_RISK",
    },
    resolutionSla: {
      targetMinutes: 480,
      remainingSeconds: 24300,
      state: "ON_TRACK",
    },
    escalationRules: [
      "If unassigned > 2h, escalate to Ops Lead.",
      "If In Progress > 4h without update, notify Coordinator.",
      "If Resolution SLA < 1h remaining, page On-call Manager.",
    ],
  },
  metadata: {
    tenantName: "Acme Corp · Singapore",
    sourceChannel: "Email to ops@acme-corp.com",
    impactLevel: "Team-level · 6-20 people affected",
    urgency: "Today · before 2pm workshops",
    serviceType: "Office Maintenance",
    asset: "AC Unit · Daikin · MC-5C-03",
    location: "HQ · Floor 5 · Meeting Room C",
    tags: ["#office", "#hvac", "#floor-5", "#meeting-room"],
  },
  timeline: [
    {
      id: "e1",
      type: "REQUEST_CREATED",
      title: "Request created",
      description: "Alex Nguyen created the request",
      actorName: "Alex Nguyen",
      actorType: "USER",
      visibility: "PUBLIC",
      createdAt: "09:08",
    },
    {
      id: "e2",
      type: "STATUS_CHANGED",
      title: "Status changed: Submitted -> Triage",
      description: "Auto-triage moved the request into triage queue",
      actorName: "System · Rule: Office Maintenance · HQ · Floor 5",
      actorType: "SYSTEM",
      visibility: "PUBLIC",
      createdAt: "09:09",
    },
    {
      id: "e3",
      type: "ASSIGNED",
      title: "Assigned to technician",
      description: "Assigned to Linh Tran (HVAC team)",
      actorName: "Thao Pham · Ops Coordinator",
      actorType: "USER",
      visibility: "PUBLIC",
      createdAt: "09:12",
    },
    {
      id: "e4",
      type: "SLA_WARNING",
      title: "SLA warning · Assignment",
      description: "Assignment SLA at risk: 15 minutes remaining",
      actorName: "SLA Engine",
      actorType: "SYSTEM",
      visibility: "PUBLIC",
      createdAt: "09:20",
    },
    {
      id: "e5",
      type: "INTERNAL_NOTE",
      title: "Technician added an internal note",
      description: "Suspect clogged drain pipe. Will inspect on-site in 10 minutes.",
      actorName: "Linh Tran · Technician",
      actorType: "USER",
      visibility: "INTERNAL",
      createdAt: "09:22",
    },
    {
      id: "e6",
      type: "RESOLUTION_SUBMITTED",
      title: "Resolution submitted",
      description: "Drain pipe cleared and drip tray cleaned. Monitoring for 30 minutes.",
      actorName: "Linh Tran · Technician",
      actorType: "USER",
      visibility: "PUBLIC",
      createdAt: "10:05",
    },
  ],
  comments: [
    {
      id: "c1",
      authorName: "Alex Nguyen",
      authorRoleLabel: "Requester",
      visibility: "PUBLIC",
      body: "Water is still dripping every ~10 seconds. I moved laptops away but the floor is getting wet.",
      createdAt: "09:15",
    },
    {
      id: "c2",
      authorName: "Linh Tran",
      authorRoleLabel: "Technician",
      visibility: "INTERNAL",
      body: "Internal: suspect drain blockage. Bring wet vacuum and ladder.",
      createdAt: "09:21",
    },
  ],
  auditSummary: [
    {
      id: "au1",
      createdAt: "09:09",
      summary: "System - Status changed from Draft to Submitted.",
    },
    {
      id: "au2",
      createdAt: "09:12",
      summary: "Thao Pham - Assigned technician changed from Unassigned to Linh Tran.",
    },
    {
      id: "au3",
      createdAt: "10:05",
      summary: "Linh Tran - Status changed from In Progress to Resolved.",
    },
  ],
};

const REQUEST_DETAIL_SCENARIOS: Record<ScenarioKey, RequestDetailScenario> = {
  requesterResolved: {
    key: "requesterResolved",
    label: "Requester / Resolved",
    role: "EMPLOYEE",
    detail: {
      ...BASE_REQUEST,
      status: "RESOLVED",
      relationship: {
        isRequester: true,
        isAssignee: false,
      },
    },
  },
  coordinatorTriage: {
    key: "coordinatorTriage",
    label: "Coordinator / Triage",
    role: "OPS_COORDINATOR",
    detail: {
      ...BASE_REQUEST,
      status: "TRIAGE",
      relationship: {
        isRequester: false,
        isAssignee: false,
      },
    },
  },
  technicianInProgress: {
    key: "technicianInProgress",
    label: "Technician / In Progress",
    role: "TECHNICIAN",
    detail: {
      ...BASE_REQUEST,
      status: "IN_PROGRESS",
      relationship: {
        isRequester: false,
        isAssignee: true,
      },
    },
  },
};

function isInternalRole(role: UserRole): boolean {
  return INTERNAL_ROLES.has(role);
}

function canViewInternalNotes(role: UserRole): boolean {
  return isInternalRole(role);
}

function canAddInternalNote(role: UserRole): boolean {
  return isInternalRole(role);
}

function canViewAuditSummary(role: UserRole): boolean {
  return role !== "EMPLOYEE";
}

function canEditMetadata(role: UserRole): boolean {
  return role === "OPS_COORDINATOR" || role === "TENANT_ADMIN";
}

function canReopenRequest(params: {
  role: UserRole;
  status: RequestStatus;
  isRequester: boolean;
}): boolean {
  if (!REOPENABLE_STATUSES.has(params.status)) {
    return false;
  }

  if (params.role === "OPS_COORDINATOR" || params.role === "TENANT_ADMIN") {
    return true;
  }

  return params.role === "EMPLOYEE" && params.isRequester;
}

function canViewComment(role: UserRole, visibility: CommentVisibility): boolean {
  if (visibility === "PUBLIC") {
    return true;
  }

  return canViewInternalNotes(role);
}

function canViewTimelineItem(role: UserRole, visibility: CommentVisibility): boolean {
  if (visibility === "PUBLIC") {
    return true;
  }

  return canViewInternalNotes(role);
}

function resolveMetadataAccessLevel(role: UserRole): MetadataAccessLevel {
  if (role === "OPS_COORDINATOR" || role === "TENANT_ADMIN") {
    return "FULL";
  }

  if (role === "TECHNICIAN") {
    return "LIMITED";
  }

  return "BASIC";
}

function getSectionVisibility(role: UserRole): SectionVisibility {
  return {
    showSlaDetails: role !== "EMPLOYEE",
    showEscalationRules: role !== "EMPLOYEE",
    showAuditSummary: canViewAuditSummary(role),
    showInternalNotes: canViewInternalNotes(role),
    metadataAccess: resolveMetadataAccessLevel(role),
    metadataEditable: canEditMetadata(role),
  };
}

function getHeaderActions(params: HeaderActionParams): HeaderAction[] {
  const actions: HeaderAction[] = [];

  const addInternalNoteAction = () => {
    if (canAddInternalNote(params.role)) {
      actions.push("ADD_NOTE");
    }
  };

  switch (params.status) {
    case "DRAFT": {
      const canEditDraft =
        params.role === "OPS_COORDINATOR" ||
        params.role === "TENANT_ADMIN" ||
        params.isRequester ||
        (params.role === "TECHNICIAN" && params.isRequester);

      if (canEditDraft) {
        actions.push("EDIT_DRAFT", "SUBMIT");
      }
      break;
    }

    case "SUBMITTED": {
      if (params.role === "OPS_COORDINATOR" || params.role === "TENANT_ADMIN") {
        actions.push("ASSIGN", "ESCALATE");
        addInternalNoteAction();
      }

      if (params.role === "TENANT_ADMIN") {
        actions.push("REASSIGN");
      }

      if ((params.role === "OPS_COORDINATOR" || params.role === "TECHNICIAN" || params.role === "TENANT_ADMIN") && !params.isAssignee) {
        actions.push("ASSIGN_TO_ME");
      }
      break;
    }

    case "TRIAGE": {
      if (params.role === "OPS_COORDINATOR" || params.role === "TENANT_ADMIN") {
        actions.push("ASSIGN");
        if (params.hasAssignee) {
          actions.push("REASSIGN");
        }
        actions.push("ESCALATE");
        addInternalNoteAction();
      }

      if ((params.role === "OPS_COORDINATOR" || params.role === "TECHNICIAN" || params.role === "TENANT_ADMIN") && !params.isAssignee) {
        actions.push("ASSIGN_TO_ME");
      }
      break;
    }

    case "ASSIGNED": {
      if (params.role === "OPS_COORDINATOR" || params.role === "TENANT_ADMIN") {
        actions.push("START_PROGRESS", "ASSIGN", "REASSIGN", "ESCALATE");
        addInternalNoteAction();
      }

      if (params.role === "TECHNICIAN" && params.isAssignee) {
        actions.push("START_PROGRESS");
        addInternalNoteAction();
      }

      if ((params.role === "TECHNICIAN" || params.role === "OPS_COORDINATOR") && !params.isAssignee) {
        actions.push("ASSIGN_TO_ME");
      }
      break;
    }

    case "IN_PROGRESS": {
      if (params.role === "OPS_COORDINATOR" || params.role === "TENANT_ADMIN") {
        actions.push("RESOLVE", "REASSIGN", "ESCALATE");
        addInternalNoteAction();
      }

      if (params.role === "TECHNICIAN" && params.isAssignee) {
        actions.push("RESOLVE");
        addInternalNoteAction();
      }
      break;
    }

    case "RESOLVED": {
      const canClose =
        (params.role === "EMPLOYEE" && params.isRequester) ||
        params.role === "OPS_COORDINATOR" ||
        params.role === "TENANT_ADMIN";

      if (canClose) {
        actions.push("CLOSE");
      }

      if (canReopenRequest({ role: params.role, status: params.status, isRequester: params.isRequester })) {
        actions.push("REOPEN");
      }

      addInternalNoteAction();
      break;
    }

    case "CLOSED": {
      if (canReopenRequest({ role: params.role, status: params.status, isRequester: params.isRequester })) {
        actions.push("REOPEN");
      }

      if (params.role === "TENANT_ADMIN") {
        addInternalNoteAction();
      }
      break;
    }

    default:
      break;
  }

  const uniqueActions = Array.from(new Set(actions));

  if (params.role === "TECHNICIAN") {
    return uniqueActions.filter((action) => action !== "REASSIGN");
  }

  return uniqueActions;
}

function resolveScenarioByRole(role?: UserRole): ScenarioKey {
  if (role === "EMPLOYEE") return "requesterResolved";
  if (role === "OPS_COORDINATOR") return "coordinatorTriage";
  if (role === "TECHNICIAN") return "technicianInProgress";
  if (role === "TENANT_ADMIN") return "coordinatorTriage";
  return "technicianInProgress";
}

function formatRemainingTime(seconds: number): string {
  const safeSeconds = Math.max(0, seconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function formatTargetMinutes(targetMinutes: number): string {
  if (targetMinutes >= 60 && targetMinutes % 60 === 0) {
    return `${targetMinutes / 60} hours`;
  }

  return `${targetMinutes} min`;
}

function resolveSlaSummaryState(sla: RequestDetail["sla"]): SlaState {
  const states: SlaState[] = [];
  if (sla.assignmentSla) {
    states.push(sla.assignmentSla.state);
  }
  if (sla.resolutionSla) {
    states.push(sla.resolutionSla.state);
  }

  if (states.includes("BREACHED")) {
    return "BREACHED";
  }
  if (states.includes("AT_RISK")) {
    return "AT_RISK";
  }
  return "ON_TRACK";
}

function eventIcon(type: TimelineEventType) {
  switch (type) {
    case "REQUEST_CREATED":
      return <PersonOutlineIcon fontSize="small" />;
    case "STATUS_CHANGED":
      return <ChevronRightIcon fontSize="small" />;
    case "ASSIGNED":
    case "REASSIGNED":
      return <AssignmentIndOutlinedIcon fontSize="small" />;
    case "SLA_WARNING":
      return <ErrorOutlineIcon color="warning" fontSize="small" />;
    case "INTERNAL_NOTE":
    case "PUBLIC_COMMENT":
      return <RateReviewOutlinedIcon fontSize="small" />;
    case "RESOLUTION_SUBMITTED":
      return <CheckCircleOutlineIcon color="success" fontSize="small" />;
    case "ESCALATED":
      return <ReportProblemOutlinedIcon color="error" fontSize="small" />;
    default:
      return <PersonOutlineIcon fontSize="small" />;
  }
}

function SlaStateChip({ state }: { state: SlaState }) {
  return (
    <Chip
      label={SLA_STATE_LABELS[state]}
      size="small"
      sx={(theme) => {
        if (state === "BREACHED") {
          return {
            borderColor: "transparent",
            backgroundColor: alpha(theme.palette.error.main, 0.18),
            color: theme.palette.error.dark,
          };
        }

        if (state === "AT_RISK") {
          return {
            borderColor: "transparent",
            backgroundColor: alpha(theme.palette.warning.main, 0.2),
            color: theme.palette.warning.dark,
          };
        }

        return {
          borderColor: "transparent",
          backgroundColor: alpha(theme.palette.success.main, 0.16),
          color: theme.palette.success.dark,
        };
      }}
      variant="outlined"
    />
  );
}

function StatusChip({ status }: { status: RequestStatus }) {
  const t = useTranslations("pages.requests.detail");

  return (
    <Chip
      label={t(`statusLabels.${status}`)}
      size="small"
      sx={(theme) => {
        if (status === "IN_PROGRESS") {
          return {
            borderColor: "transparent",
            backgroundColor: alpha(theme.palette.info.main, 0.16),
            color: theme.palette.info.dark,
          };
        }

        if (status === "RESOLVED") {
          return {
            borderColor: "transparent",
            backgroundColor: alpha(theme.palette.success.main, 0.16),
            color: theme.palette.success.dark,
          };
        }

        if (status === "TRIAGE" || status === "ASSIGNED") {
          return {
            borderColor: "transparent",
            backgroundColor: alpha(theme.palette.warning.main, 0.18),
            color: theme.palette.warning.dark,
          };
        }

        return {
          borderColor: "transparent",
          backgroundColor: alpha(theme.palette.grey[500], 0.12),
          color: theme.palette.text.primary,
        };
      }}
      variant="outlined"
    />
  );
}

function PriorityChip({ priority }: { priority: RequestPriority }) {
  const t = useTranslations("pages.requests.detail");

  return (
    <Chip
      label={t(`priorityLabels.${priority}`)}
      size="small"
      sx={(theme) => {
        if (priority === "CRITICAL") {
          return {
            borderColor: "transparent",
            backgroundColor: alpha(theme.palette.error.main, 0.22),
            color: theme.palette.error.dark,
          };
        }

        if (priority === "HIGH") {
          return {
            borderColor: "transparent",
            backgroundColor: alpha(theme.palette.error.main, 0.15),
            color: theme.palette.error.dark,
          };
        }

        if (priority === "MEDIUM") {
          return {
            borderColor: "transparent",
            backgroundColor: alpha(theme.palette.warning.main, 0.18),
            color: theme.palette.warning.dark,
          };
        }

        return {
          borderColor: "transparent",
          backgroundColor: alpha(theme.palette.success.main, 0.14),
          color: theme.palette.success.dark,
        };
      }}
      variant="outlined"
    />
  );
}

function RequestSummary({
  request,
  t,
}: {
  request: RequestDetail;
  t: ReturnType<typeof useTranslations<"pages.requests.detail">>;
}) {
  const summaryState = resolveSlaSummaryState(request.sla);
  const summaryRemaining = request.sla.resolutionSla?.remainingSeconds ?? request.sla.assignmentSla?.remainingSeconds ?? 0;

  return (
    <Stack spacing={1}>
      <Stack alignItems="center" direction="row" spacing={1}>
        <Typography fontWeight={500} variant="h5">{request.title}</Typography>
        <Typography color="text.secondary" fontWeight={500} variant="h5">
          {request.requestCode}
        </Typography>
      </Stack>

      <Typography color="text.secondary" sx={{ mt: 0.25 }} variant="body1">
        {t("header.subtitle", {
          updatedAgo: request.updatedAtLabel,
          requester: request.requester.name,
          role: ROLE_LABELS.EMPLOYEE,
        })}
      </Typography>

      <Stack alignItems="center" direction="row" flexWrap="wrap" spacing={1} sx={{ mt: 0.25 }}>
        <StatusChip status={request.status} />
        <PriorityChip priority={request.priority} />
        <Chip
          label={`${SLA_STATE_LABELS[summaryState]} · ${formatRemainingTime(summaryRemaining)} left`}
          size="small"
          sx={(theme) => ({
            borderColor: "transparent",
            backgroundColor: alpha(theme.palette.success.main, 0.16),
            color: theme.palette.success.dark,
          })}
          variant="outlined"
        />
      </Stack>
    </Stack>
  );
}

function RequestHeaderActions({
  headerActions,
  onAction,
  isSubmitting,
}: {
  headerActions: HeaderAction[];
  onAction: (action: HeaderAction) => void;
  isSubmitting: boolean;
}) {
  return (
    <Stack
      alignItems={{ md: "center", xs: "flex-start" }}
      direction="row"
      flexWrap="wrap"
      justifyContent={{ md: "flex-end", xs: "flex-start" }}
      spacing={1}
      sx={{ pt: { md: 0.5, xs: 0 } }}
    >
      {headerActions.map((action, index) => (
        <Button
          key={action}
          disabled={isSubmitting}
          onClick={() => onAction(action)}
          size="small"
          sx={{ borderRadius: 1.5, px: 1.5 }}
          variant={index === 0 ? "contained" : "outlined"}
        >
          {HEADER_ACTION_LABELS[action]}
        </Button>
      ))}
      <IconButton aria-label="More request actions" size="small" sx={{ borderRadius: 1.5 }}>
        <MoreHorizIcon fontSize="small" />
      </IconButton>
    </Stack>
  );
}

function RequestOverviewCard({ request }: { request: RequestDetail }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack alignItems="center" direction="row" justifyContent="space-between">
          <Typography className={styles.sectionTitle}>REQUEST OVERVIEW</Typography>
          <Typography color="text.secondary" fontWeight={600}>{request.requestCode}</Typography>
        </Stack>

        <Grid container spacing={2} sx={{ mt: 0.25 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography color="text.secondary" variant="body2">Service type</Typography>
            <Typography>{request.overview.serviceType}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography color="text.secondary" variant="body2">Category</Typography>
            <Typography>{request.overview.category}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography color="text.secondary" variant="body2">Location</Typography>
            <Typography>{request.overview.location}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography color="text.secondary" variant="body2">Asset</Typography>
            <Typography>{request.overview.asset ?? "-"}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography color="text.secondary" variant="body2">Created at</Typography>
            <Typography>{request.overview.createdAt}</Typography>
          </Grid>
        </Grid>

        <Typography sx={{ mt: 2 }} variant="body2">DESCRIPTION</Typography>
        <Box className={styles.descriptionBox}>{request.overview.description}</Box>
      </CardContent>
    </Card>
  );
}

function AttachmentsCard({ request }: { request: RequestDetail }) {
  return (
    <Card sx={{ mt: 2 }} variant="outlined">
      <CardContent>
        <Stack alignItems="center" direction="row" justifyContent="space-between">
          <Typography className={styles.sectionTitle}>ATTACHMENTS</Typography>
        </Stack>

        <Stack spacing={1.25} sx={{ mt: 1.5 }}>
          {request.attachments.map((attachment) => (
            <Stack
              alignItems="center"
              direction="row"
              key={attachment.id}
              spacing={1}
              sx={{
                border: "1px solid var(--mui-palette-divider)",
                borderRadius: 1.5,
                p: 1,
              }}
            >
              <Avatar sx={{ width: 30, height: 30 }}>•</Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={600}>{attachment.fileName}</Typography>
                <Typography color="text.secondary" variant="body2">
                  {attachment.fileSizeLabel} · {attachment.uploadedBy} · {attachment.uploadedAt}
                </Typography>
              </Box>
              <Button href={attachment.url} size="small" variant="text">View</Button>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

function AssignmentCard({
  request,
  headerActions,
  role,
  onAssign,
  onAssignToMe,
  isSubmitting,
}: {
  request: RequestDetail;
  headerActions: HeaderAction[];
  role: UserRole;
  onAssign: (reassign: boolean) => void;
  onAssignToMe: () => void;
  isSubmitting: boolean;
}) {
  const showAssignToMe = headerActions.includes("ASSIGN_TO_ME");
  const showAssign = headerActions.includes("ASSIGN");
  const showReassign = headerActions.includes("REASSIGN");

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack alignItems="center" direction="row" justifyContent="space-between">
          <Typography className={styles.sectionTitle}>ASSIGNMENT</Typography>
          {request.assignment.queueLabel ? <Chip label={request.assignment.queueLabel} size="small" variant="outlined" /> : null}
        </Stack>

        {request.assignee ? (
          <Stack direction="row" spacing={1.25} sx={{ mt: 1.25 }}>
            <Avatar>{request.assignee.name.slice(0, 1)}</Avatar>
            <Box>
              <Stack alignItems="center" direction="row" spacing={0.75}>
                <Typography fontWeight={600}>{request.assignee.name}</Typography>
                <Chip color="success" label={request.assignee.roleLabel} size="small" variant="outlined" />
              </Stack>
              <Typography color="text.secondary" variant="body2">
                {[request.assignee.etaLabel, request.assignee.team].filter(Boolean).join(" · ")}
              </Typography>
            </Box>
          </Stack>
        ) : (
          <Typography color="text.secondary" sx={{ mt: 1.25 }} variant="body2">No assignee yet.</Typography>
        )}

        {role === "EMPLOYEE" ? null : (
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
            {showAssignToMe ? (
              <Button disabled={isSubmitting} fullWidth onClick={onAssignToMe} size="small" variant="outlined">
                Assign to me
              </Button>
            ) : null}
            {showAssign ? (
              <Button disabled={isSubmitting} fullWidth onClick={() => onAssign(false)} size="small" variant="outlined">
                Assign
              </Button>
            ) : null}
            {showReassign ? (
              <Button disabled={isSubmitting} fullWidth onClick={() => onAssign(true)} size="small" variant="outlined">
                Reassign
              </Button>
            ) : null}
          </Stack>
        )}

        <Typography className={styles.sectionTitle} sx={{ mt: 2 }}>HANDOFF HISTORY</Typography>
        <Stack spacing={1} sx={{ mt: 1 }}>
          {request.assignment.handoffHistory.map((item) => (
            <Box key={item.id}>
              <Typography fontWeight={600} variant="body2">{`${item.from} -> ${item.to}`}</Typography>
              <Typography color="text.secondary" variant="body2">{item.at} · by {item.by}</Typography>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

function SlaCard({
  request,
  visibility,
}: {
  request: RequestDetail;
  visibility: SectionVisibility;
}) {
  const summaryState = resolveSlaSummaryState(request.sla);

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack alignItems="center" direction="row" justifyContent="space-between">
          <Typography className={styles.sectionTitle}>SLA</Typography>
          <SlaStateChip state={summaryState} />
        </Stack>

        {visibility.showSlaDetails ? (
          <>
            {request.sla.assignmentSla ? (
              <Box className={styles.sideBlock}>
                <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
                  <Typography color="text.secondary" variant="body2">Assignment SLA</Typography>
                  <Typography color="text.secondary" variant="body2">Target: {formatTargetMinutes(request.sla.assignmentSla.targetMinutes)}</Typography>
                </Stack>
                <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
                  <Typography fontWeight={600}>{formatRemainingTime(request.sla.assignmentSla.remainingSeconds)} remaining</Typography>
                  <SlaStateChip state={request.sla.assignmentSla.state} />
                </Stack>
              </Box>
            ) : null}

            {request.sla.resolutionSla ? (
              <Box className={styles.sideBlock}>
                <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
                  <Typography color="text.secondary" variant="body2">Resolution SLA</Typography>
                  <Typography color="text.secondary" variant="body2">Target: {formatTargetMinutes(request.sla.resolutionSla.targetMinutes)}</Typography>
                </Stack>
                <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
                  <Typography fontWeight={600}>{formatRemainingTime(request.sla.resolutionSla.remainingSeconds)} remaining</Typography>
                  <SlaStateChip state={request.sla.resolutionSla.state} />
                </Stack>
              </Box>
            ) : null}

            {visibility.showEscalationRules ? (
              <>
                <Typography className={styles.sectionTitle} sx={{ mt: 2 }}>Escalation rules</Typography>
                <Box component="ul" sx={{ m: 0, mt: 0.5, pl: 2.5 }}>
                  {request.sla.escalationRules.map((rule) => (
                    <Typography component="li" key={rule} variant="body2">{rule}</Typography>
                  ))}
                </Box>
              </>
            ) : null}
          </>
        ) : (
          <Box className={styles.sideBlock}>
            <Typography color="text.secondary" variant="body2">Resolution SLA</Typography>
            <Typography fontWeight={600}>{formatRemainingTime(request.sla.resolutionSla?.remainingSeconds ?? 0)} remaining</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function MetadataCard({
  request,
  visibility,
}: {
  request: RequestDetail;
  visibility: SectionVisibility;
}) {
  const rows: Array<{ key: string; label: string; value?: string; editable?: boolean; minAccess: MetadataAccessLevel }> = [
    { key: "tenant", label: "Tenant", value: request.metadata.tenantName, minAccess: "BASIC" },
    { key: "serviceType", label: "Service type", value: request.metadata.serviceType, minAccess: "BASIC" },
    { key: "location", label: "Location", value: request.metadata.location, minAccess: "BASIC" },
    { key: "source", label: "Source channel", value: request.metadata.sourceChannel, minAccess: "LIMITED" },
    {
      key: "impact",
      label: "Impact level",
      value: request.metadata.impactLevel,
      editable: visibility.metadataEditable,
      minAccess: "LIMITED",
    },
    {
      key: "urgency",
      label: "Urgency",
      value: request.metadata.urgency,
      editable: visibility.metadataEditable,
      minAccess: "LIMITED",
    },
    { key: "asset", label: "Asset", value: request.metadata.asset, minAccess: "FULL" },
  ];

  const canReadRow = (rowAccess: MetadataAccessLevel) => {
    if (visibility.metadataAccess === "FULL") return true;
    if (visibility.metadataAccess === "LIMITED") return rowAccess === "LIMITED" || rowAccess === "BASIC";
    return rowAccess === "BASIC";
  };

  const visibleRows = rows.filter((row) => canReadRow(row.minAccess));

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack alignItems="center" direction="row" justifyContent="space-between">
          <Typography className={styles.sectionTitle}>REQUEST METADATA</Typography>
          {visibility.metadataAccess === "BASIC" ? null : (
            <Typography color="text.secondary" variant="caption">Internal view</Typography>
          )}
        </Stack>

        <Stack spacing={1} sx={{ mt: 1.25 }}>
          {visibleRows.map((row) => (
            <Box key={row.key}>
              <Typography color="text.secondary" variant="body2">{row.label}</Typography>
              <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
                <Typography>{row.value ?? "-"}</Typography>
                {row.editable ? <Chip color="primary" label="Editable" size="small" variant="outlined" /> : null}
              </Stack>
            </Box>
          ))}

          <Box>
            <Typography color="text.secondary" variant="body2">Tags</Typography>
            <Stack direction="row" flexWrap="wrap" spacing={0.75} sx={{ mt: 0.5 }}>
              {request.metadata.tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" variant="outlined" />
              ))}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ActivityTimeline({
  request,
  viewerRole,
}: {
  request: RequestDetail;
  viewerRole: UserRole;
}) {
  const visibleEvents = request.timeline.filter((event) => canViewTimelineItem(viewerRole, event.visibility));
  const latestEventId = visibleEvents.at(-1)?.id;

  return (
    <Card sx={{ mt: 2 }} variant="outlined">
      <CardContent>
        <Stack alignItems="center" direction="row" justifyContent="space-between">
          <Typography className={styles.sectionTitle}>ACTIVITY TIMELINE</Typography>
          <Typography color="text.secondary" variant="caption">All times in local timezone</Typography>
        </Stack>

        <Stack className={styles.timelineWrap} spacing={2} sx={{ mt: 1.5 }}>
          {visibleEvents.map((event) => (
            <Box className={styles.timelineItem} key={event.id}>
              <Avatar className={styles.timelineAvatar}>{eventIcon(event.type)}</Avatar>
              <Box sx={{ flex: 1 }}>
                <Stack alignItems="center" direction="row" spacing={1}>
                  <Typography fontWeight={600}>{event.title}</Typography>
                  {latestEventId === event.id ? <Chip color="success" label="Latest update" size="small" variant="outlined" /> : null}
                  {event.visibility === "INTERNAL" ? <Chip label="Internal" size="small" variant="outlined" /> : null}
                </Stack>
                {event.description ? <Typography>{event.description}</Typography> : null}
                {event.actorName ? (
                  <Typography color="text.secondary" variant="body2">{event.actorName}</Typography>
                ) : null}
              </Box>
              <Typography color="text.secondary" variant="body2">{event.createdAt}</Typography>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

function CommentsPanel({
  request,
  viewerRole,
  canCreateInternal,
  onSubmit,
  isSubmitting,
}: {
  request: RequestDetail;
  viewerRole: UserRole;
  canCreateInternal: boolean;
  onSubmit: (payload: { body: string; visibility: CommentVisibility }) => Promise<void>;
  isSubmitting: boolean;
}) {
  const [comment, setComment] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);

  const visibleComments = useMemo(
    () => request.comments.filter((item) => canViewComment(viewerRole, item.visibility)),
    [request.comments, viewerRole],
  );

  const internalToggleVisible = canCreateInternal;

  const handleSubmit = async () => {
    const body = comment.trim();
    if (!body) return;

    await onSubmit({
      body,
      visibility: isInternalNote ? "INTERNAL" : "PUBLIC",
    });
    setComment("");
  };

  return (
    <Card sx={{ mt: 2 }} variant="outlined">
      <CardContent>
        <Stack alignItems="center" direction="row" justifyContent="space-between">
          <Typography className={styles.sectionTitle}>COMMENTS</Typography>
          <Typography color="text.secondary" variant="caption">
            {internalToggleVisible ? "Visible to requester unless marked internal" : "Public comments only"}
          </Typography>
        </Stack>

        <Stack spacing={1.5} sx={{ mt: 1.5 }}>
          {visibleComments.map((item) => (
            <Box key={item.id}>
              <Stack alignItems="center" direction="row" spacing={1}>
                <Avatar sx={{ width: 30, height: 30 }}>{item.authorName.slice(0, 2).toUpperCase()}</Avatar>
                <Typography fontWeight={600}>{item.authorName}</Typography>
                {item.authorRoleLabel ? <Chip label={item.authorRoleLabel} size="small" variant="outlined" /> : null}
                <Chip
                  label={item.visibility === "INTERNAL" ? "Internal note" : "Public"}
                  size="small"
                  sx={
                    item.visibility === "INTERNAL"
                      ? (theme) => ({
                          backgroundColor: alpha(theme.palette.warning.main, 0.18),
                          color: theme.palette.warning.dark,
                        })
                      : (theme) => ({
                          backgroundColor: alpha(theme.palette.success.main, 0.16),
                          color: theme.palette.success.dark,
                        })
                  }
                  variant="outlined"
                />
                <Typography color="text.secondary" sx={{ ml: "auto" }} variant="body2">{item.createdAt}</Typography>
              </Stack>
              <Typography sx={{ ml: 5 }}>{item.body}</Typography>
            </Box>
          ))}
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Typography gutterBottom variant="body2">ADD COMMENT</Typography>
        <TextField
          minRows={3}
          multiline
          onChange={(event) => setComment(event.target.value)}
          placeholder="Type an update... Use @ to mention someone."
          value={comment}
        />

        <Stack alignItems="center" direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
          {internalToggleVisible ? (
            <FormControlLabel
              control={
                <Checkbox
                  checked={isInternalNote}
                  onChange={(event) => setIsInternalNote(event.target.checked)}
                />
              }
              label="Internal note"
              sx={{ m: 0 }}
            />
          ) : (
            <Typography color="text.secondary" variant="body2">Requester receives notifications for public comments.</Typography>
          )}

          <Button
            disabled={comment.trim().length === 0 || isSubmitting}
            onClick={() => void handleSubmit()}
            variant="contained"
          >
            Submit
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

function WorkLogPanel({
  logs,
  onSubmit,
  isSubmitting,
}: {
  logs: RequestWorkLog[];
  onSubmit: (payload: { content: string; minutesSpent?: number }) => Promise<void>;
  isSubmitting: boolean;
}) {
  const t = useTranslations("pages.requests.detail");
  const [content, setContent] = useState("");
  const [minutes, setMinutes] = useState<string>("15");

  const handleSubmit = async () => {
    const normalizedContent = content.trim();
    const parsedMinutes = Number(minutes);
    const minutesSpent = Number.isFinite(parsedMinutes) && parsedMinutes > 0 ? parsedMinutes : undefined;
    if (!normalizedContent) return;

    await onSubmit({ content: normalizedContent, minutesSpent });
    setContent("");
  };

  return (
    <Card sx={{ mt: 2 }} variant="outlined">
      <CardContent>
        <Typography className={styles.sectionTitle}>{t("workLog.sectionTitle")}</Typography>
        <Stack spacing={1} sx={{ mt: 1 }}>
          {logs.length === 0 ? (
            <Typography color="text.secondary" variant="body2">{t("workLog.empty")}</Typography>
          ) : (
            logs.map((item) => (
              <Box key={item.id}>
                <Typography fontWeight={600} variant="body2">{item.content}</Typography>
                <Typography color="text.secondary" variant="body2">
                  {item.minutesSpent ? `${item.minutesSpent} min` : t("workLog.noDuration")} · {new Date(item.createdAt).toLocaleString()}
                </Typography>
              </Box>
            ))
          )}
        </Stack>

        <Divider sx={{ my: 2 }} />
        <Typography gutterBottom variant="body2">{t("workLog.addTitle")}</Typography>
        <TextField
          minRows={2}
          multiline
          onChange={(event) => setContent(event.target.value)}
          placeholder={t("workLog.placeholder")}
          value={content}
        />
        <Stack alignItems="center" direction="row" spacing={1} sx={{ mt: 1 }}>
          <TextField
            label={t("workLog.minutes")}
            onChange={(event) => setMinutes(event.target.value)}
            size="small"
            type="number"
            value={minutes}
          />
          <Button
            disabled={content.trim().length === 0 || isSubmitting}
            onClick={() => void handleSubmit()}
            variant="contained"
          >
            {t("workLog.add")}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

function AuditSummaryCard({ request }: { request: RequestDetail }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack alignItems="center" direction="row" justifyContent="space-between">
          <Typography className={styles.sectionTitle}>AUDIT SUMMARY</Typography>
          <Typography color="text.secondary" variant="caption">Immutable log</Typography>
        </Stack>
        <Stack spacing={0.9} sx={{ mt: 1.25 }}>
          {(request.auditSummary ?? []).map((item) => (
            <Typography key={item.id} variant="body2">
              <strong>{item.createdAt}</strong> · {item.summary}
            </Typography>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

function AssignUserForm({
  users,
  selectedAssigneeId,
  isLoadingUsers,
  isSubmitting,
  formId,
  onSubmit,
}: {
  users: RequestAssignee[];
  selectedAssigneeId: string;
  isLoadingUsers: boolean;
  isSubmitting: boolean;
  formId: string;
  onSubmit: (assigneeId: string) => Promise<void>;
}) {
  const t = useTranslations("pages.requests.detail");
  const {
    control,
    handleSubmit,
    reset,
  } = useForm<{ assigneeId: string }>({
    defaultValues: {
      assigneeId: selectedAssigneeId,
    },
  });

  useEffect(() => {
    reset({ assigneeId: selectedAssigneeId });
  }, [reset, selectedAssigneeId]);

  const options = useMemo(
    () =>
      users.map((member) => ({
        value: member.id,
        label: `${member.fullName || member.email} (${member.roleCode ?? "EMPLOYEE"})`,
      })),
    [users],
  );

  return (
    <Stack
      component="form"
      id={formId}
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit(async ({ assigneeId }) => {
          await onSubmit(assigneeId);
        })();
      }}
      spacing={1.5}
    >
      <SelectOptionField
        control={control}
        disableClearable
        disabled={isLoadingUsers || isSubmitting || options.length === 0}
        hideEmptyHelperText
        label={t("assignDialog.assignee")}
        name="assigneeId"
        options={options}
        placeholder={t("assignDialog.assigneePlaceholder")}
        rules={{ required: true }}
        size="small"
      />
      {isLoadingUsers ? (
        <Stack alignItems="center" direction="row" spacing={1}>
          <CircularProgress size={16} />
          <Typography color="text.secondary" variant="body2">{t("assignDialog.loadingUsers")}</Typography>
        </Stack>
      ) : null}
      {!isLoadingUsers && options.length === 0 ? (
        <Alert severity="info">{t("assignDialog.emptyUsers")}</Alert>
      ) : null}
    </Stack>
  );
}

export function RequestDetailScreen({ requestId }: DetailProps) {
  const { locale } = useParams<{ locale: string }>();
  const t = useTranslations("pages.requests.detail");
  const { user } = useAuth();
  const assignDialog = useDialog();
  const fallbackScenario = REQUEST_DETAIL_SCENARIOS[resolveScenarioByRole(user?.role)];
  const role = user?.role ?? fallbackScenario.role;

  const [serviceRequest, setServiceRequest] = useState<ServiceRequest | null>(null);
  const [comments, setComments] = useState<RequestComment[]>([]);
  const [workLogs, setWorkLogs] = useState<RequestWorkLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [mutationSuccess, setMutationSuccess] = useState<string | null>(null);
  const [reassignMode, setReassignMode] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [assignableUsers, setAssignableUsers] = useState<RequestAssignee[]>([]);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState("");

  const refreshDetail = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    setComments([]);
    setWorkLogs([]);
    try {
      const { data } = await requestService.detail(requestId);
      setServiceRequest(data);
    } catch (error) {
      if (error instanceof ApiError) {
        setLoadError(error.error.message);
      } else {
        setLoadError(t("feedback.loadDetailError"));
      }
    } finally {
      setIsLoading(false);
    }
  }, [requestId, t]);

  useEffect(() => {
    void refreshDetail();
  }, [refreshDetail]);

  const request = useMemo<RequestDetail>(() => {
    if (!serviceRequest) {
      return {
        ...fallbackScenario.detail,
        id: requestId,
        requestCode: fallbackScenario.detail.requestCode,
        comments: comments.map((item) => ({
          id: item.id,
          authorName: item.authorId,
          visibility: item.visibility,
          body: item.body,
          createdAt: new Date(item.createdAt).toLocaleString(),
        })),
      };
    }

    const sourcePriority = serviceRequest.priority as RequestPriority;
    const safePriority = sourcePriority === "URGENT" || sourcePriority === "HIGH" || sourcePriority === "MEDIUM" || sourcePriority === "LOW"
      ? sourcePriority
      : "MEDIUM";

    const sourceStatus = serviceRequest.status as RequestStatus;
    const safeStatus: RequestStatus = REQUEST_STATUSES.includes(sourceStatus) ? sourceStatus : "TRIAGE";

    const requesterName = user && serviceRequest.requesterId === user.id
      ? `${user.firstName} ${user.lastName}`.trim()
      : serviceRequest.requesterId;
    const assigneeName = user && serviceRequest.assigneeId === user.id
      ? `${user.firstName} ${user.lastName}`.trim()
      : serviceRequest.assigneeId ?? undefined;

    const timelineFromWorkLogs = workLogs.map((item) => ({
      id: `wl-${item.id}`,
      type: "PUBLIC_COMMENT" as const,
      title: t("workLog.timelineTitle"),
      description: item.content,
      actorName: item.authorId,
      actorType: "USER" as const,
      visibility: "INTERNAL" as CommentVisibility,
      createdAt: new Date(item.createdAt).toLocaleString(),
    }));

    return {
      ...fallbackScenario.detail,
      id: serviceRequest.id,
      requestCode: serviceRequest.requestCode ?? serviceRequest.id,
      title: serviceRequest.title,
      status: safeStatus,
      priority: safePriority,
      updatedAtLabel: new Date(serviceRequest.updatedAt).toLocaleString(),
      requester: {
        id: serviceRequest.requesterId,
        name: requesterName || serviceRequest.requesterId,
      },
      assignee: serviceRequest.assigneeId
        ? {
            id: serviceRequest.assigneeId,
            name: assigneeName || serviceRequest.assigneeId,
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
      metadata: {
        ...fallbackScenario.detail.metadata,
        tenantName: user?.tenantName ?? fallbackScenario.detail.metadata.tenantName,
        sourceChannel: serviceRequest.sourceChannel,
        impactLevel: serviceRequest.impactLevel,
        urgency: serviceRequest.urgency,
        serviceType: serviceRequest.serviceTypeName ?? serviceRequest.serviceTypeCode ?? serviceRequest.serviceTypeId,
        asset: serviceRequest.assetId ?? undefined,
        location: serviceRequest.locationId,
      },
      comments: comments.map((item) => ({
        id: item.id,
        authorName: item.authorId,
        visibility: item.visibility,
        body: item.body,
        createdAt: new Date(item.createdAt).toLocaleString(),
      })),
      timeline: [...fallbackScenario.detail.timeline, ...timelineFromWorkLogs],
      assignment: {
        queueLabel: fallbackScenario.detail.assignment.queueLabel,
        handoffHistory: fallbackScenario.detail.assignment.handoffHistory,
      },
    };
  }, [comments, fallbackScenario.detail, requestId, serviceRequest, t, user, workLogs]);

  const sectionVisibility = getSectionVisibility(role);
  const headerActions = getHeaderActions({
    role,
    status: request.status,
    isRequester: request.relationship.isRequester,
    isAssignee: request.relationship.isAssignee,
    hasAssignee: Boolean(request.assignee),
  });

  const extractError = (error: unknown, fallback: string): string => {
    if (error instanceof ApiError) return error.error.message;
    return fallback;
  };

  const executeMutation = async (runner: () => Promise<void>, successMessage: string) => {
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
  };

  const handleHeaderAction = (action: HeaderAction) => {
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
    }, t("feedback.statusUpdated"));
  };

  const handleAssign = async (reassign: boolean) => {
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
  };

  const handleAssignToMe = async () => {
    if (!serviceRequest || !user?.id) return;
    await executeMutation(async () => {
      const { data } = await requestService.assign(serviceRequest.id, { assigneeId: user.id });
      setServiceRequest(data);
    }, t("feedback.assignedToYou"));
  };

  const handleCommentSubmit = async (payload: { body: string; visibility: CommentVisibility }) => {
    if (!serviceRequest) return;
    await executeMutation(async () => {
      const { data } = await requestService.addComment(serviceRequest.id, payload);
      setComments((current) => [...current, data]);
    }, t("feedback.commentAdded"));
  };

  const handleWorkLogSubmit = async (payload: { content: string; minutesSpent?: number }) => {
    if (!serviceRequest) return;
    await executeMutation(async () => {
      const { data } = await requestService.addWorkLog(serviceRequest.id, payload);
      setWorkLogs((current) => [...current, data]);
    }, t("feedback.workLogAdded"));
  };

  const handleAssignConfirm = async (assigneeId: string) => {
    if (!serviceRequest || !assigneeId) return;

    await executeMutation(async () => {
      const { data } = await requestService.assign(serviceRequest.id, { assigneeId });
      setServiceRequest(data);
      assignDialog.close();
    }, reassignMode ? t("feedback.requestReassigned") : t("feedback.requestAssigned"));
  };

  return (
    <Box className={styles.pageWrap}>
      <EntityDetailLayout
        backLabel={t("header.backToList")}
        backButtonAriaLabel={t("header.backToList")}
        backButtonMode="icon"
        breadcrumbs={[
          { label: t("header.breadcrumbs.requests"), href: `/${locale}/requests/list` },
          { label: request.requestCode },
        ]}
        fallbackHref={`/${locale}/requests/list`}
        topDividerBleed={1.5}
        summaryLeft={<RequestSummary request={request} t={t} />}
        summaryRight={
          <RequestHeaderActions
            headerActions={headerActions}
            isSubmitting={isSubmitting}
            onAction={handleHeaderAction}
          />
        }
      >
        {isLoading ? (
          <Stack alignItems="center" direction="row" spacing={1}>
            <CircularProgress size={18} />
            <Typography color="text.secondary" variant="body2">{t("feedback.loadingDetail")}</Typography>
          </Stack>
        ) : null}
        {loadError ? (
          <Alert
            action={<Button color="inherit" onClick={() => void refreshDetail()} size="small">{t("feedback.retry")}</Button>}
            severity="error"
            sx={{ mt: 1 }}
          >
            {loadError}
          </Alert>
        ) : null}
        {mutationError ? <Alert severity="error" sx={{ mt: 1 }}>{mutationError}</Alert> : null}
        {mutationSuccess ? <Alert severity="success" sx={{ mt: 1 }}>{mutationSuccess}</Alert> : null}

        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <RequestOverviewCard request={request} />
            <AttachmentsCard request={request} />
            <ActivityTimeline request={request} viewerRole={role} />
            <CommentsPanel
              canCreateInternal={sectionVisibility.showInternalNotes}
              isSubmitting={isSubmitting}
              onSubmit={handleCommentSubmit}
              request={request}
              viewerRole={role}
            />
            <WorkLogPanel
              isSubmitting={isSubmitting}
              logs={workLogs}
              onSubmit={handleWorkLogSubmit}
            />
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={2}>
              <AssignmentCard
                headerActions={headerActions}
                isSubmitting={isSubmitting}
                onAssign={handleAssign}
                onAssignToMe={handleAssignToMe}
                request={request}
                role={role}
              />
              <SlaCard request={request} visibility={sectionVisibility} />
              <MetadataCard request={request} visibility={sectionVisibility} />
              {sectionVisibility.showAuditSummary ? <AuditSummaryCard request={request} /> : null}
            </Stack>
          </Grid>
        </Grid>
      </EntityDetailLayout>
      <FormDialog
        cancelLabel={t("assignDialog.cancel")}
        dialog={assignDialog}
        formId={REQUEST_ASSIGN_FORM_ID}
        submitDisabled={isLoadingUsers || isSubmitting || assignableUsers.length === 0}
        submitLabel={reassignMode ? t("assignDialog.confirmReassign") : t("assignDialog.confirmAssign")}
        title={reassignMode ? t("assignDialog.titleReassign") : t("assignDialog.titleAssign")}
      >
        <AssignUserForm
          formId={REQUEST_ASSIGN_FORM_ID}
          isLoadingUsers={isLoadingUsers}
          isSubmitting={isSubmitting}
          onSubmit={handleAssignConfirm}
          selectedAssigneeId={selectedAssigneeId}
          users={assignableUsers}
        />
      </FormDialog>
    </Box>
  );
}
