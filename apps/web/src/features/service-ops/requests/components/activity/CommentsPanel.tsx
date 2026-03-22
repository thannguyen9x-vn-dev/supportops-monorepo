import { Box, Button, Checkbox, Chip, Divider, FormControlLabel, Stack, TextField, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Avatar as UserAvatar } from "@supportops/ui-avatar";
import type { UserRole } from "@supportops/types";
import { useMemo, useState } from "react";

import { SectionCard } from "@/components/section-card";

import type { CommentPayload, RequestDetail } from "../../types";
import { canViewComment } from "../../utils/requestAccess";

export function CommentsPanel({
  request,
  viewerRole,
  canCreateInternal,
  onSubmit,
  isSubmitting,
}: {
  request: RequestDetail;
  viewerRole: UserRole;
  canCreateInternal: boolean;
  onSubmit: (payload: CommentPayload) => Promise<void>;
  isSubmitting: boolean;
}) {
  const [comment, setComment] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);

  const visibleComments = useMemo(
    () => request.comments.filter((item) => canViewComment(viewerRole, item.visibility)),
    [request.comments, viewerRole],
  );

  const internalToggleVisible = canCreateInternal;

  const handleSubmit = async () => {
    const body = comment.trim();
    if (!body) return;

    await onSubmit({
      body,
      visibility: isInternalNote ? "INTERNAL" : "PUBLIC",
    });
    setComment("");
  };

  return (
    <SectionCard
      cardSx={{ mt: 2 }}
      headerRight={
        <Typography color="text.secondary" variant="caption">
          {internalToggleVisible ? "Visible to requester unless marked internal" : "Public comments only"}
        </Typography>
      }
      title="Comments"
    >
      <Stack spacing={1.5} sx={{ mt: 1.5 }}>
        {visibleComments.map((item) => (
          <Box key={item.id}>
            <Stack alignItems="center" direction="row" spacing={1}>
              <UserAvatar dimension={30} name={item.authorName} />
              <Typography fontWeight={600}>{item.authorName}</Typography>
              {item.authorRoleLabel ? <Chip label={item.authorRoleLabel} size="small" variant="outlined" /> : null}
              <Chip
                label={item.visibility === "INTERNAL" ? "Internal note" : "Public"}
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
              <Typography color="text.secondary" sx={{ ml: "auto" }} variant="body2">{item.createdAt}</Typography>
            </Stack>
            <Typography sx={{ ml: 5 }}>{item.body}</Typography>
          </Box>
        ))}
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Typography gutterBottom variant="body2">ADD COMMENT</Typography>
      <TextField
        minRows={3}
        multiline
        onChange={(event) => setComment(event.target.value)}
        placeholder="Type an update... Use @ to mention someone."
        value={comment}
      />

      <Stack alignItems="center" direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
        {internalToggleVisible ? (
          <FormControlLabel
            control={<Checkbox checked={isInternalNote} onChange={(event) => setIsInternalNote(event.target.checked)} />}
            label="Internal note"
            sx={{ m: 0 }}
          />
        ) : (
          <Typography color="text.secondary" variant="body2">Requester receives notifications for public comments.</Typography>
        )}

        <Button
          disabled={comment.trim().length === 0 || isSubmitting}
          onClick={() => void handleSubmit()}
          variant="contained"
        >
          Submit
        </Button>
      </Stack>
    </SectionCard>
  );
}
