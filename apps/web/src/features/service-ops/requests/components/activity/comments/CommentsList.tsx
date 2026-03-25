import { Box, Chip, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Avatar as UserAvatar } from "@supportops/ui-avatar";
import { useTranslations } from "next-intl";

import type { RequestDetail } from "../../../types";

interface CommentsListProps {
  comments: RequestDetail["comments"];
}

export function CommentsList({ comments }: CommentsListProps) {
  const t = useTranslations("pages.requests.detail");

  if (comments.length === 0) {
    return (
      <Typography color="text.secondary" variant="body2">
        {t("comments.empty")}
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {comments.map((item) => (
        <Box key={item.id}>
          <Stack alignItems="center" direction="row" spacing={1}>
            <UserAvatar dimension={30} name={item.authorName} />
            <Typography fontWeight={600}>{item.authorName}</Typography>
            {item.authorRoleLabel ? <Chip label={item.authorRoleLabel} size="small" variant="outlined" /> : null}
            <Chip
              label={item.visibility === "INTERNAL" ? t("comments.internalBadge") : t("comments.publicBadge")}
              size="small"
              sx={
                item.visibility === "INTERNAL"
                  ? (theme) => ({
                      backgroundColor: alpha(theme.palette.warning.main, 0.18),
                      color: theme.palette.warning.dark,
                    })
                  : (theme) => ({
                      backgroundColor: alpha(theme.palette.success.main, 0.16),
                      color: theme.palette.success.dark,
                    })
              }
              variant="outlined"
            />
            <Typography color="text.secondary" sx={{ ml: "auto" }} variant="body2">
              {item.createdAt}
            </Typography>
          </Stack>
          <Typography sx={{ ml: 5 }}>{item.body}</Typography>
        </Box>
      ))}
    </Stack>
  );
}
