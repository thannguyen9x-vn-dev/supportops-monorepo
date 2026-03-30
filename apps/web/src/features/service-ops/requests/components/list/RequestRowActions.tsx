import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import type { EntityAction } from "@/components/entity-actions";
import { EntityTableActionCell } from "@/components/entity-actions";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useMemo } from "react";

import type { RequestListItem } from "./request-list.types";
import { AssignDialog } from "../assign/AssignDialog";
import {
  isRequestHeaderAction,
  REQUEST_ROW_ICON_BY_ACTION,
  resolveRequestRowActionLabel,
} from "./requestRowActionConfig";
import { useRequestListRowActions } from "./useRequestListRowActions";

type RequestRowActionsProps = {
  request: Pick<RequestListItem, "id" | "assigneeId" | "allowedActions">;
  locale: string;
  onActionCompleted?: () => void;
};

export function RequestRowActions({ request, locale, onActionCompleted }: RequestRowActionsProps) {
  const router = useRouter();
  const t = useTranslations("pages.requests.list");
  const tDetail = useTranslations("pages.requests.detail");

  const handleNavigateToDetail = useCallback(() => {
    router.push(`/${locale}/requests/${request.id}`);
  }, [locale, request.id, router]);

  const {
    assignDialog,
    assignableUsers,
    handleAction,
    handleAssignConfirm,
    isLoadingUsers,
    isSubmitting,
    reassignMode,
    selectedAssigneeId,
  } = useRequestListRowActions({
    requestId: request.id,
    assigneeId: request.assigneeId,
    onActionCompleted,
    onNavigateToDetail: handleNavigateToDetail,
    tDetail,
  });

  const menuActions = useMemo<EntityAction[]>(() => {
    const headerActions = request.allowedActions
      .filter(isRequestHeaderAction)
      .filter((action) => action !== "ADD_NOTE");

    return [
      {
        key: "view",
        label: t("actions.rowActions.view"),
        icon: <VisibilityOutlinedIcon fontSize="small" />,
        onClick: handleNavigateToDetail,
      },
      ...headerActions.map((action) => ({
        key: action.toLowerCase(),
        label: resolveRequestRowActionLabel(action, t),
        icon: REQUEST_ROW_ICON_BY_ACTION[action],
        onClick: () => {
          void handleAction(action);
        },
      })),
    ];
  }, [handleAction, handleNavigateToDetail, request.allowedActions, t]);

  return (
    <>
      <EntityTableActionCell
        actions={menuActions}
        disabled={isSubmitting}
        tooltip={t("columns.actions")}
      />
      <AssignDialog
        assignableUsers={assignableUsers}
        dialog={assignDialog}
        isLoadingUsers={isLoadingUsers}
        isSubmitting={isSubmitting}
        onSubmit={handleAssignConfirm}
        reassignMode={reassignMode}
        selectedAssigneeId={selectedAssigneeId}
      />
    </>
  );
}
