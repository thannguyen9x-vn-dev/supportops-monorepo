import { useDialog } from "@supportops/ui";
import type { RequestAssignee } from "@supportops/types";
import { useCallback, useState } from "react";

import { requestService } from "@/features/service-ops/requests/services/request.service";
import { ApiError } from "@/lib/api";

type UseRequestAssignDialogParams = {
  assigneeId: string | null;
  onAssigned: () => void;
  requestId: string;
  tDetail: (key: string) => string;
  toastError: (message: string) => void;
  toastSuccess: (message: string) => void;
};

export function useRequestAssignDialog({
  assigneeId,
  onAssigned,
  requestId,
  tDetail,
  toastError,
  toastSuccess,
}: UseRequestAssignDialogParams) {
  const assignDialog = useDialog();
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [reassignMode, setReassignMode] = useState(false);
  const [assignableUsers, setAssignableUsers] = useState<RequestAssignee[]>([]);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState("");

  const openAssignDialog = useCallback(async (isReassign: boolean) => {
    setReassignMode(isReassign);
    setSelectedAssigneeId(assigneeId ?? "");
    assignDialog.open();
    setIsLoadingUsers(true);

    try {
      const { data } = await requestService.listAssignees();
      setAssignableUsers(data);
    } catch (error) {
      if (error instanceof ApiError) {
        toastError(error.error.message);
      } else {
        toastError(tDetail("feedback.loadAssigneesError"));
      }
    } finally {
      setIsLoadingUsers(false);
    }
  }, [assignDialog, assigneeId, tDetail, toastError]);

  const confirmAssign = useCallback(async (nextAssigneeId: string) => {
    if (!nextAssigneeId) return;
    try {
      await requestService.assign(requestId, { assigneeId: nextAssigneeId });
      toastSuccess(reassignMode ? tDetail("feedback.requestReassigned") : tDetail("feedback.requestAssigned"));
      assignDialog.close();
      onAssigned();
    } catch (error) {
      if (error instanceof ApiError) {
        toastError(error.error.message);
      } else {
        toastError(tDetail("feedback.actionFailed"));
      }
      throw error;
    }
  }, [assignDialog, onAssigned, reassignMode, requestId, tDetail, toastError, toastSuccess]);

  return {
    assignDialog,
    assignableUsers,
    confirmAssign,
    isLoadingUsers,
    openAssignDialog,
    reassignMode,
    selectedAssigneeId,
  };
}
