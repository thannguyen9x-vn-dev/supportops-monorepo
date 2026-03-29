import { Chip, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { KnowledgeArticleSummary, UserRole } from "@supportops/types";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export function KnowledgeBaseTable({
  items,
  role,
  userId,
  onDelete,
}: {
  items: KnowledgeArticleSummary[];
  role?: UserRole;
  userId?: string;
  onDelete: (id: string) => Promise<void>;
}) {
  const t = useTranslations("knowledgeBase");
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();

  if (items.length === 0) {
    return (
      <Typography color="text.secondary" variant="body2">
        {t("picker.empty")}
      </Typography>
    );
  }

  const canManageRole = role === "OPS_COORDINATOR" || role === "TENANT_ADMIN";

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>{t("form.title")}</TableCell>
          <TableCell>{t("form.category")}</TableCell>
          <TableCell>{t("statusLabel")}</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((item) => {
          const article = item as KnowledgeArticleSummary & { authorId?: string };
          const canManage = canManageRole || (role === "TECHNICIAN" && article.authorId === userId);
          return (
            <TableRow hover key={item.id} onClick={() => router.push(`/${locale}/knowledge-base/${item.id}`)}>
              <TableCell>{item.title}</TableCell>
              <TableCell>{item.category ?? "-"}</TableCell>
              <TableCell>
                <Chip
                  color={item.status === "PUBLISHED" ? "success" : "default"}
                  label={t(`status.${item.status}`)}
                  size="small"
                  variant="outlined"
                />
              </TableCell>
              <TableCell align="right">
                {canManage ? (
                  <>
                    <IconButton
                      onClick={(event) => {
                        event.stopPropagation();
                        router.push(`/${locale}/knowledge-base/${item.id}/edit`);
                      }}
                      size="small"
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={(event) => {
                        event.stopPropagation();
                        void onDelete(item.id);
                      }}
                      size="small"
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : null}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
