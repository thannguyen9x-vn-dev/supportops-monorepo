"use client";

import { Box, Button, Typography } from "@mui/material";
import { useTranslations } from "next-intl";

interface ReportsErrorProps {
  error: Error;
  reset: () => void;
}

export default function ReportsError({ error, reset }: ReportsErrorProps): React.JSX.Element {
  const t = useTranslations();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" color="error">
        {t("reports.errors.unexpected")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {error.message}
      </Typography>
      <Button onClick={reset} sx={{ mt: 2 }}>
        {t("reports.errors.tryAgain")}
      </Button>
    </Box>
  );
}
