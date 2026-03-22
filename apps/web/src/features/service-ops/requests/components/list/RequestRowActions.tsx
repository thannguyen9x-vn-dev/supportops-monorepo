import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { EntityTableActionMenu } from "@/components/entity-actions";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type RequestRowActionsProps = {
  id: string;
  locale: string;
};

export function RequestRowActions({ id, locale }: RequestRowActionsProps) {
  const router = useRouter();
  const t = useTranslations("pages.requests.list");

  return (
    <EntityTableActionMenu
      actions={[
        {
          key: "view",
          label: t("actions.rowActions.view"),
          icon: <VisibilityOutlinedIcon fontSize="small" />,
          onClick: () => router.push(`/${locale}/requests/${id}`),
        },
        {
          key: "edit",
          label: t("actions.rowActions.edit"),
          icon: <EditOutlinedIcon fontSize="small" />,
          onClick: () => {},
        },
        {
          key: "assign",
          label: t("actions.rowActions.assign"),
          icon: <PersonAddAlt1OutlinedIcon fontSize="small" />,
          onClick: () => {},
        },
        {
          key: "cancel",
          label: t("actions.rowActions.cancelRequest"),
          icon: <RemoveCircleOutlineIcon fontSize="small" />,
          color: "error",
          divider: true,
          onClick: () => {},
        },
      ]}
    />
  );
}
