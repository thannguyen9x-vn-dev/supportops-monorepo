"use client";

import { Button } from "@mui/material";
import { useDialog } from "@supportops/ui";
import { useTranslations } from "next-intl";

import { useAuth } from "@/features/auth/hooks/useAuth";

import { ImportRequestModal } from "./ImportRequestModal";

const IMPORT_ROLES = new Set(["OPS_COORDINATOR", "TENANT_ADMIN"]);

export function ImportRequestButton(): React.JSX.Element | null {
  const t = useTranslations("pages.requests.list");
  const { user } = useAuth();
  const dialog = useDialog();

  if (!user || !IMPORT_ROLES.has(user.role)) {
    return null;
  }

  return (
    <>
      <Button onClick={dialog.open} variant="outlined">
        {t("import.button")}
      </Button>
      <ImportRequestModal onClose={dialog.close} open={dialog.isOpen} />
    </>
  );
}
