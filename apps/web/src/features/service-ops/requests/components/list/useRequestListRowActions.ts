import { useCallback, useState } from "react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useToast } from "@/features/common/toast/useToast";
import { requestService } from "@/features/service-ops/requests/services/request.service";
import { ApiError } from "@/lib/api";

import {
  REQUEST_ROW_STATUS_BY_ACTION,
} from "./requestRowActionConfig";
import { useRequestAssignDialog } from "./useRequestAssignDialog";
import type { HeaderAction } from "../../types";

type UseRequestListRowActionsParams = {
  requestId: string;
  assigneeId: string | null;
  onActionCompleted?: () => void;
  onNavigateToDetail: () => void;
  tDetail: (key: string) => string;
};

export function useRequestListRowActions({
  requestId,
  assigneeId,
  onActionCompleted,
  onNavigateToDetail,
  tDetail,
}: UseRequestListRowActionsParams) {
  const { user } = useAuth();
  const toast = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    assignDialog,
    assignableUsers,
    confirmAssign,
    isLoadingUsers,
    openAssignDialog,
    reassignMode,
    selectedAssigneeId,
  } = useRequestAssignDialog({
    assigneeId,
    requestId,
    tDetail,
    onAssigned: () => onActionCompleted?.(),
    toastError: (message) => toast.error(message),
    toastSuccess: (message) => toast.success(message),
  });

  const handleAssignConfirm = useCallback(async (nextAssigneeId: string) => {
    setIsSubmitting(true);
    try {
      await confirmAssign(nextAssigneeId);
    } catch {
      // Error toast is handled inside useRequestAssignDialog.
    } finally {
      setIsSubmitting(false);
    }
  }, [confirmAssign]);

  const handleAction = useCallback(async (action: HeaderAction) => {
    const statusToUpdate = REQUEST_ROW_STATUS_BY_ACTION[action];
    const currentUserId = user?.id;

    if (action === "ASSIGN") {
      void openAssignDialog(false);
      return;
    }

    if (action === "REASSIGN") {
      void openAssignDialog(true);
      return;
    }

    if (action === "EDIT_DRAFT") {
      onNavigateToDetail();
      return;
    }

    setIsSubmitting(true);
    try {
      if (action === "ASSIGN_TO_ME") {
        if (!currentUserId) return;
        await requestService.assign(requestId, { assigneeId: currentUserId });
        toast.success(tDetail("feedback.assignedToYou"));
        onActionCompleted?.();
        return;
      }

      if (!statusToUpdate) return;

      await requestService.updateStatus(requestId, { status: statusToUpdate });
      toast.success(tDetail("feedback.statusUpdated"));
      onActionCompleted?.();
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.error.message);
      } else {
        toast.error(tDetail("feedback.actionFailed"));
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [onActionCompleted, onNavigateToDetail, openAssignDialog, requestId, tDetail, toast, user?.id]);

  return {
    assignDialog,
    assignableUsers,
    handleAction,
    handleAssignConfirm,
    isLoadingUsers,
    isSubmitting,
    reassignMode,
    selectedAssigneeId,
  };
}
