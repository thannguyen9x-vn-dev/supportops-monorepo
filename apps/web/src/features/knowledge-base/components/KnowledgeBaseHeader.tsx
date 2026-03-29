import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { Button, Stack, TextField, Typography } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import type { UserRole } from "@supportops/types";
import { useTranslations } from "next-intl";

export function KnowledgeBaseHeader({
  search,
  onSearch,
  role,
}: {
  search: string;
  onSearch: (value: string) => void;
  role?: UserRole;
}) {
  const t = useTranslations("knowledgeBase");
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();

  const canCreate = role === "TECHNICIAN" || role === "OPS_COORDINATOR" || role === "TENANT_ADMIN";

  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2 }}>
      <Stack sx={{ flex: 1 }}>
        <Typography variant="h5">{t("title")}</Typography>
      </Stack>
      <TextField
        onChange={(event) => onSearch(event.target.value)}
        placeholder={t("search")}
        size="small"
        sx={{ minWidth: 260 }}
        value={search}
      />
      {canCreate ? (
        <Button
          onClick={() => router.push(`/${locale}/knowledge-base/new`)}
          startIcon={<AddOutlinedIcon />}
          variant="contained"
        >
          {t("new")}
        </Button>
      ) : null}
    </Stack>
  );
}
