import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import PublishedWithChangesOutlinedIcon from "@mui/icons-material/PublishedWithChangesOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import UpgradeOutlinedIcon from "@mui/icons-material/UpgradeOutlined";
import WorkspacesOutlinedIcon from "@mui/icons-material/WorkspacesOutlined";
import type { RequestStatus } from "@supportops/types";
import type { ReactNode } from "react";
import type { useTranslations } from "next-intl";

import type { HeaderAction } from "../../types";

export const REQUEST_ROW_STATUS_BY_ACTION: Partial<Record<HeaderAction, RequestStatus>> = {
  SUBMIT: "SUBMITTED",
  START_PROGRESS: "IN_PROGRESS",
  RESOLVE: "RESOLVED",
  CLOSE: "CLOSED",
  REOPEN: "REOPENED",
  ESCALATE: "WAITING_EXTERNAL_VENDOR",
};

export const REQUEST_ROW_ICON_BY_ACTION: Partial<Record<HeaderAction, ReactNode>> = {
  EDIT_DRAFT: <EditOutlinedIcon fontSize="small" />,
  ASSIGN: <PersonAddAlt1OutlinedIcon fontSize="small" />,
  REASSIGN: <WorkspacesOutlinedIcon fontSize="small" />,
  ASSIGN_TO_ME: <PersonAddAlt1OutlinedIcon fontSize="small" />,
  SUBMIT: <PublishedWithChangesOutlinedIcon fontSize="small" />,
  START_PROGRESS: <PlayArrowOutlinedIcon fontSize="small" />,
  RESOLVE: <TaskAltOutlinedIcon fontSize="small" />,
  CLOSE: <TaskAltOutlinedIcon fontSize="small" />,
  REOPEN: <RestartAltOutlinedIcon fontSize="small" />,
  ESCALATE: <UpgradeOutlinedIcon fontSize="small" />,
};

const REQUEST_ROW_HEADER_ACTION_SET: ReadonlySet<HeaderAction> = new Set([
  "EDIT_DRAFT",
  "SUBMIT",
  "ASSIGN",
  "REASSIGN",
  "ASSIGN_TO_ME",
  "START_PROGRESS",
  "RESOLVE",
  "CLOSE",
  "REOPEN",
  "ESCALATE",
  "ADD_NOTE",
]);

export function isRequestHeaderAction(action: string): action is HeaderAction {
  return REQUEST_ROW_HEADER_ACTION_SET.has(action as HeaderAction);
}

export function resolveRequestRowActionLabel(
  action: HeaderAction,
  t: ReturnType<typeof useTranslations<"pages.requests.list">>,
): string {
  switch (action) {
    case "EDIT_DRAFT":
      return t("actions.rowActions.edit");
    case "ASSIGN":
      return t("actions.rowActions.assign");
    case "REASSIGN":
      return t("actions.rowActions.reassign");
    case "ASSIGN_TO_ME":
      return t("actions.rowActions.assignToMe");
    case "SUBMIT":
      return t("actions.rowActions.submit");
    case "START_PROGRESS":
      return t("actions.rowActions.startProgress");
    case "RESOLVE":
      return t("actions.rowActions.resolve");
    case "CLOSE":
      return t("actions.rowActions.close");
    case "REOPEN":
      return t("actions.rowActions.reopen");
    case "ESCALATE":
      return t("actions.rowActions.escalate");
    case "ADD_NOTE":
      return t("actions.rowActions.view");
  }
}
