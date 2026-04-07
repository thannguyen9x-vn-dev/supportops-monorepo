import { Box, Typography } from "@mui/material";
import { useTranslations } from "next-intl";

export function ReportsHeader(): React.JSX.Element {
  const t = useTranslations();

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" fontWeight={600}>
        {t("reports.pageTitle")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {t("reports.pageDescription")}
      </Typography>
    </Box>
  );
}
