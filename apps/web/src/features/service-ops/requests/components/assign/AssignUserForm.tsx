import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import type { RequestAssignee } from "@supportops/types";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Avatar as UserAvatar } from "@supportops/ui-avatar";
import { SelectOptionField } from "@supportops/ui-form";

export function AssignUserForm({
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
  const { control, handleSubmit, reset } = useForm<{ assigneeId: string }>({
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
        label: member.fullName || member.email,
      })),
    [users],
  );
  const usersById = useMemo(() => new Map(users.map((member) => [member.id, member])), [users]);

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
        autocompleteProps={{
          renderOption: (props, option) => {
            const member = usersById.get(String(option.value));
            const displayName = member?.fullName || member?.email || option.label;
            const email = member?.email ?? "";

            return (
              <Box component="li" {...props} key={String(option.value)} sx={{ py: 0.75 }}>
                <Stack alignItems="center" direction="row" spacing={1}>
                  <UserAvatar name={displayName} size="xs" src={member?.avatarUrl ?? null} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography noWrap variant="body2">{displayName}</Typography>
                    <Typography color="text.secondary" noWrap variant="caption">{email}</Typography>
                  </Box>
                </Stack>
              </Box>
            );
          },
        }}
        control={control}
        disableClearable
        disabled={isLoadingUsers || isSubmitting || options.length === 0}
        hideEmptyHelperText
        label={t("assignDialog.assignee")}
        name="assigneeId"
        options={options}
        placeholder={t("assignDialog.assigneePlaceholder")}
        searchable
        rules={{ required: true }}
        size="small"
      />
      {isLoadingUsers ? (
        <Stack alignItems="center" direction="row" spacing={1}>
          <CircularProgress size={16} />
          <Typography color="text.secondary" variant="body2">{t("assignDialog.loadingUsers")}</Typography>
        </Stack>
      ) : null}
      {!isLoadingUsers && options.length === 0 ? <Alert severity="info">{t("assignDialog.emptyUsers")}</Alert> : null}
    </Stack>
  );
}
