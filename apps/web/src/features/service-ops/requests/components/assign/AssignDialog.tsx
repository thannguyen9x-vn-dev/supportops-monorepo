import type { RequestAssignee } from "@supportops/types";
import { useTranslations } from "next-intl";
import type { UseDialogReturn } from "@supportops/ui";
import { FormDialog } from "@supportops/ui-dialog";

import { AssignUserForm } from "./AssignUserForm";

export const REQUEST_ASSIGN_FORM_ID = "request-assign-form";

export function AssignDialog({
  dialog,
  isLoadingUsers,
  isSubmitting,
  assignableUsers,
  reassignMode,
  selectedAssigneeId,
  onSubmit,
}: {
  dialog: UseDialogReturn;
  isLoadingUsers: boolean;
  isSubmitting: boolean;
  assignableUsers: RequestAssignee[];
  reassignMode: boolean;
  selectedAssigneeId: string;
  onSubmit: (assigneeId: string) => Promise<void>;
}) {
  const t = useTranslations("pages.requests.detail");

  return (
    <FormDialog
      cancelLabel={t("assignDialog.cancel")}
      dialog={dialog}
      formId={REQUEST_ASSIGN_FORM_ID}
      submitDisabled={isLoadingUsers || isSubmitting || assignableUsers.length === 0}
      submitLabel={reassignMode ? t("assignDialog.confirmReassign") : t("assignDialog.confirmAssign")}
      title={reassignMode ? t("assignDialog.titleReassign") : t("assignDialog.titleAssign")}
    >
      <AssignUserForm
        formId={REQUEST_ASSIGN_FORM_ID}
        isLoadingUsers={isLoadingUsers}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        selectedAssigneeId={selectedAssigneeId}
        users={assignableUsers}
      />
    </FormDialog>
  );
}
