import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Button, Stack } from "@mui/material";

export function AssetDetailActions({
  canManage,
  isDeleting,
  onDelete,
  onEdit,
  t,
}: {
  canManage: boolean;
  isDeleting: boolean;
  onDelete: () => void;
  onEdit: () => void;
  t: (key: string) => string;
}) {
  if (!canManage) {
    return null;
  }

  return (
    <Stack
      alignItems={{ md: "center", xs: "flex-start" }}
      direction="row"
      flexWrap="wrap"
      justifyContent={{ md: "flex-end", xs: "flex-start" }}
      spacing={1}
      sx={{ pt: { md: 0.5, xs: 0 } }}
    >
      <Button onClick={onEdit} size="small" startIcon={<EditOutlinedIcon fontSize="small" />} sx={{ borderRadius: 1.5, px: 1.5 }} variant="outlined">
        {t("actions.edit")}
      </Button>
      <Button color="error" disabled={isDeleting} onClick={onDelete} size="small" startIcon={<DeleteOutlineIcon fontSize="small" />} sx={{ borderRadius: 1.5, px: 1.5 }} variant="outlined">
        {t("actions.delete")}
      </Button>
    </Stack>
  );
}
