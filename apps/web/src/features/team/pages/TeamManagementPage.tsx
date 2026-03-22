"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { FormDialog } from "@supportops/ui-dialog";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useDialog } from "@supportops/ui";
import { SelectOptionField, TextInputField } from "@supportops/ui-form";
import { useForm } from "react-hook-form";

import { useToast } from "@/features/common/toast/useToast";
import { EntityTableActionMenu } from "@/components/entity-actions";
import { EntityTable, useEntityTable, type EntityColumnDef } from "@/components/entity-table";
import { ConfirmSelectPopupAction } from "@/components/table-select";
import { EntityLayout } from "@/features/layout/components/EntityLayout/EntityLayout";
import { teamService, type TeamRoleCode, type TeamUser } from "@/features/team/services/team.service";
import { buildDepartmentOptions } from "@/shared/constants/departments";

const ROLE_OPTIONS: TeamRoleCode[] = ["EMPLOYEE", "OPS_COORDINATOR", "TECHNICIAN", "TENANT_ADMIN"];
const TEAM_INVITE_FORM_ID = "team-invite-form";

type InviteFormValues = {
  email: string;
  roleCode: TeamRoleCode | "";
};

function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleString();
}

export default function AdminUserPage() {
  const t = useTranslations("pages.teamAdmin");
  const toast = useToast();
  const inviteDialog = useDialog();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<TeamUser[]>([]);

  const {
    control: inviteControl,
    handleSubmit: handleInviteSubmit,
    reset: resetInviteForm,
    watch: watchInviteForm,
  } = useForm<InviteFormValues>({
    defaultValues: {
      email: "",
      roleCode: "",
    },
  });

  const hasUsers = users.length > 0;

  const loadUsers = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      const { data } = await teamService.listUsers();
      setUsers(data);
    } catch {
      toast.error(t("loadError"));
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [t, toast]);

  useEffect(() => {
    void loadUsers(true);
  }, [loadUsers]);

  const roleLabelMap = useMemo(
    () => ({
      EMPLOYEE: t("roles.EMPLOYEE"),
      OPS_COORDINATOR: t("roles.OPS_COORDINATOR"),
      TECHNICIAN: t("roles.TECHNICIAN"),
      TENANT_ADMIN: t("roles.TENANT_ADMIN"),
    }),
    [t],
  );

  const roleOptions = useMemo(
    () => ROLE_OPTIONS.map((roleCode) => ({ value: roleCode, label: roleLabelMap[roleCode] })),
    [roleLabelMap],
  );

  const inviteEmail = watchInviteForm("email");
  const inviteRole = watchInviteForm("roleCode");
  const canSubmitInvite = Boolean(inviteEmail?.trim()) && Boolean(inviteRole) && !submitting;

  const handleInvite = async (values: InviteFormValues) => {
    const email = values.email.trim();
    if (!email) return;
    if (!values.roleCode) return;

    setSubmitting(true);
    try {
      await teamService.inviteUser({
        email,
        roleCode: values.roleCode,
      });
      resetInviteForm({ email: "", roleCode: "" });
      toast.success(t("inviteSuccess"));
      inviteDialog.close();
      await loadUsers(false);
    } catch {
      toast.error(t("inviteError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = useCallback(async (userId: string, nextRole: TeamRoleCode) => {
    const previousUsers = users;
    setUsers((current) =>
      current.map((user) =>
        user.id === userId
          ? { ...user, roleCode: nextRole }
          : user,
      ),
    );
    setSubmitting(true);
    try {
      await teamService.updateRole(userId, nextRole);
      toast.success(t("roleUpdated"));
      void loadUsers(false);
    } catch {
      setUsers(previousUsers);
      toast.error(t("roleUpdateError"));
    } finally {
      setSubmitting(false);
    }
  }, [t, toast, users, loadUsers]);

  const handleDepartmentChange = useCallback(async (userId: string, nextDepartment: string) => {
    const previousUsers = users;
    const normalizedDepartment = nextDepartment.trim();
    const nextValue = normalizedDepartment ? normalizedDepartment : null;

    setUsers((current) =>
      current.map((user) =>
        user.id === userId
          ? { ...user, department: nextValue }
          : user,
      ),
    );
    setSubmitting(true);
    try {
      await teamService.updateDepartment(userId, normalizedDepartment);
      toast.success(t("departmentUpdated"));
      void loadUsers(false);
    } catch {
      setUsers(previousUsers);
      toast.error(t("departmentUpdateError"));
    } finally {
      setSubmitting(false);
    }
  }, [t, toast, users, loadUsers]);

  const handleDeactivate = useCallback(async (userId: string) => {
    const previousUsers = users;
    setUsers((current) =>
      current.map((user) =>
        user.id === userId
          ? { ...user, userStatus: "DEACTIVATED", isActive: false }
          : user,
      ),
    );
    setSubmitting(true);
    try {
      await teamService.deactivateUser(userId);
      toast.success(t("deactivateSuccess"));
      void loadUsers(false);
    } catch {
      setUsers(previousUsers);
      toast.error(t("deactivateError"));
    } finally {
      setSubmitting(false);
    }
  }, [t, toast, users, loadUsers]);

  const handleReactivate = useCallback(async (userId: string) => {
    const previousUsers = users;
    setUsers((current) =>
      current.map((user) =>
        user.id === userId
          ? { ...user, userStatus: "ACTIVE", isActive: true }
          : user,
      ),
    );
    setSubmitting(true);
    try {
      await teamService.reactivateUser(userId);
      toast.success(t("reactivateSuccess"));
      void loadUsers(false);
    } catch {
      setUsers(previousUsers);
      toast.error(t("reactivateError"));
    } finally {
      setSubmitting(false);
    }
  }, [t, toast, users, loadUsers]);

  const userColumns = useMemo<EntityColumnDef<TeamUser>[]>(
    () => [
      {
        accessorKey: "email",
        header: t("table.email"),
        size: 320,
        cell: ({ row }) => row.original.email,
      },
      {
        accessorKey: "fullName",
        header: t("table.name"),
        size: 180,
        sortable: true,
        cell: ({ row }) => row.original.fullName || "-",
      },
      {
        accessorKey: "department",
        header: t("table.department"),
        size: 260,
        minSize: 200,
        maxSize: 520,
        sortable: true,
        resizable: true,
        cell: ({ row }) => (
          <ConfirmSelectPopupAction
            cancelLabel={t("form.cancel")}
            disabled={submitting}
            onSubmit={async (nextValue) => {
              if (Array.isArray(nextValue)) return;
              await handleDepartmentChange(row.original.id, nextValue);
            }}
            options={buildDepartmentOptions(row.original.department)}
            submitLabel={t("table.updateDepartment")}
            title={t("form.department")}
            triggerLabel={row.original.department || "-"}
            triggerSx={{ minWidth: 180, justifyContent: "space-between" }}
            value={row.original.department ?? ""}
          />
        ),
      },
      {
        id: "roleCode",
        accessorKey: "roleCode",
        header: t("table.role"),
        size: 360,
        sortable: true,
        cell: ({ row }) => {
          const currentRole = (row.original.roleCode ?? "EMPLOYEE") as TeamRoleCode;
          const currentRoleLabel = roleLabelMap[currentRole];
          return (
            <ConfirmSelectPopupAction
              cancelLabel={t("form.cancel")}
              disabled={submitting}
              onSubmit={async (nextValue) => {
                if (Array.isArray(nextValue)) return;
                await handleRoleChange(row.original.id, nextValue as TeamRoleCode);
              }}
              options={roleOptions}
              submitLabel={t("table.updateRole")}
              title={t("form.role")}
              triggerLabel={currentRoleLabel}
              triggerSx={{ minWidth: 220, justifyContent: "space-between" }}
              value={currentRole}
            />
          );
        },
      },
      {
        accessorKey: "membershipStatus",
        header: t("table.membership"),
        size: 190,
        minSize: 150,
        sortable: true,
        cell: ({ row }) => (
          <Chip
            color={row.original.membershipStatus === "ACTIVE" ? "success" : "default"}
            label={row.original.membershipStatus ?? "-"}
            size="small"
            variant="outlined"
          />
        ),
      },
      {
        accessorKey: "lastLoginAt",
        header: t("table.lastLogin"),
        size: 220,
        sortable: true,
        cell: ({ row }) => formatDateTime(row.original.lastLoginAt),
      },
      {
        id: "actions",
        header: t("table.actions"),
        size: 90,
        minSize: 90,
        maxSize: 90,
        sortable: false,
        hideable: false,
        resizable: false,
        cell: ({ row }) => {
          const canDeactivate = row.original.userStatus !== "DEACTIVATED";
          return (
            <EntityTableActionMenu
              actions={[
                canDeactivate
                  ? {
                      key: "deactivate",
                      label: t("table.deactivate"),
                      icon: <BlockOutlinedIcon fontSize="small" />,
                      color: "error",
                      onClick: () => {
                        void handleDeactivate(row.original.id);
                      },
                    }
                  : {
                      key: "reactivate",
                      label: t("table.reactivate"),
                      icon: <CheckCircleOutlineIcon fontSize="small" />,
                      onClick: () => {
                        void handleReactivate(row.original.id);
                      },
                    },
              ]}
            />
          );
        },
      },
    ],
    [handleDeactivate, handleDepartmentChange, handleReactivate, handleRoleChange, roleOptions, submitting, t, roleLabelMap],
  );

  const userTable = useEntityTable<TeamUser, Record<string, never>>({
    data: users,
    columns: userColumns,
    rowId: "id",
    initialFilters: {},
    rowDensity: "comfortable",
    defaultColumn: { size: 180, minSize: 120, maxSize: 640 },
    pinnedColumns: {
      left: ["email"],
      right: ["actions"],
    },
    columnOrderStorageKey: "team-admin-users-table-column-order",
    columnSizingStorageKey: "team-admin-users-table-column-sizing-v3",
  });

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ minHeight: 280 }}>
        <CircularProgress size={28} />
        <Typography color="text.secondary" variant="body2">{t("loading")}</Typography>
      </Stack>
    );
  }

  return (
    <EntityLayout
      headerActions={(
        <Button
          disabled={submitting}
          onClick={() => {
            resetInviteForm({ email: "", roleCode: "" });
            inviteDialog.open();
          }}
          variant="contained"
        >
          {t("form.invite")}
        </Button>
      )}
      headerLeft={(
        <Stack spacing={0.5}>
          <Typography sx={{ fontSize: 32, lineHeight: 1.2, fontWeight: 700 }} variant="h5">{t("title")}</Typography>
          <Typography color="text.secondary" variant="body2">{t("subtitle")}</Typography>
        </Stack>
      )}
    >
      <FormDialog
        dialog={inviteDialog}
        formId={TEAM_INVITE_FORM_ID}
        submitDisabled={!canSubmitInvite}
        submitLabel={t("form.invite")}
        title={t("form.dialogTitle")}
      >
        <Stack
          component="form"
          id={TEAM_INVITE_FORM_ID}
          onSubmit={(event) => {
            event.preventDefault();
            void handleInviteSubmit(async (values) => {
              await handleInvite(values);
            })();
          }}
          spacing={2}
        >
          <TextInputField
            control={inviteControl}
            fullWidth
            hideEmptyHelperText
            label={t("form.email")}
            name="email"
            placeholder={t("form.emailPlaceholder")}
            rules={{
              required: true,
              pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            }}
            size="small"
          />
          <SelectOptionField
            control={inviteControl}
            hideEmptyHelperText
            label={t("form.role")}
            name="roleCode"
            options={roleOptions}
            placeholder={t("form.rolePlaceholder")}
            rules={{ required: true }}
            size="small"
          />
        </Stack>
      </FormDialog>

      <Card variant="outlined">
        <CardContent>
          <Typography sx={{ mb: 1.5 }} variant="h6">{t("table.title")}</Typography>
          {!hasUsers ? (
            <Alert severity="info">{t("table.empty")}</Alert>
          ) : (
            <EntityTable
              entityTable={userTable}
              hideFilters
            />
          )}
        </CardContent>
      </Card>
    </EntityLayout>
  );
}
