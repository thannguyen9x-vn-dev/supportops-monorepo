import { canAddInternalNote, canReopenRequest } from "./requestAccess";
import type { HeaderAction, HeaderActionParams } from "../types";

export function getHeaderActions(params: HeaderActionParams): HeaderAction[] {
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
      if (params.role === "TENANT_ADMIN") {
        actions.push("START_PROGRESS", "ASSIGN", "REASSIGN", "ESCALATE");
        addInternalNoteAction();
      } else if (params.role === "OPS_COORDINATOR") {
        actions.push("ASSIGN", "REASSIGN", "ESCALATE");
        addInternalNoteAction();
        if (params.isAssignee) {
          actions.push("START_PROGRESS");
        }
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
      if (params.role === "TENANT_ADMIN") {
        actions.push("RESOLVE", "REASSIGN", "ESCALATE");
        addInternalNoteAction();
      } else if (params.role === "OPS_COORDINATOR") {
        actions.push("REASSIGN", "ESCALATE");
        addInternalNoteAction();
        if (params.isAssignee) {
          actions.push("RESOLVE");
        }
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

    case "WAITING_EXTERNAL_VENDOR": {
      if (params.role === "TENANT_ADMIN") {
        actions.push("RESOLVE", "REASSIGN", "ADD_NOTE");
      } else if (params.role === "OPS_COORDINATOR") {
        actions.push("REASSIGN", "ADD_NOTE");
        if (params.isAssignee) {
          actions.push("RESOLVE");
        }
      } else if (params.role === "TECHNICIAN" && params.isAssignee) {
        actions.push("RESOLVE", "ADD_NOTE");
      }
      break;
    }

    case "REOPENED": {
      if (params.role === "TENANT_ADMIN") {
        actions.push("START_PROGRESS", "ASSIGN", "REASSIGN", "ESCALATE");
        addInternalNoteAction();
      } else if (params.role === "OPS_COORDINATOR") {
        actions.push("ASSIGN", "REASSIGN", "ESCALATE");
        addInternalNoteAction();
        if (params.isAssignee) {
          actions.push("START_PROGRESS");
        }
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
  const normalizedActions = params.hasAssignee
    ? uniqueActions.filter((action) => action !== "ASSIGN")
    : uniqueActions;

  if (params.role === "TECHNICIAN") {
    return normalizedActions.filter((action) => action !== "REASSIGN");
  }

  return normalizedActions;
}
