import { Avatar as MuiAvatar, Box, Button, Stack, Typography } from "@mui/material";

import { SectionCard } from "@/components/section-card";

import type { RequestDetail } from "../../types";

export function AttachmentsCard({ request }: { request: RequestDetail }) {
  return (
    <SectionCard cardSx={{ mt: 2 }} title="Attachments">
      <Stack spacing={1.25} sx={{ mt: 1.5 }}>
        {request.attachments.length === 0 ? (
          <Typography color="text.secondary" variant="body2">No attachments.</Typography>
        ) : (
          request.attachments.map((attachment) => (
            <Stack
              alignItems="center"
              direction="row"
              key={attachment.id}
              spacing={1}
              sx={{
                border: "1px solid var(--mui-palette-divider)",
                borderRadius: 1.5,
                p: 1,
              }}
            >
              <MuiAvatar sx={{ width: 30, height: 30 }}>•</MuiAvatar>
              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={600}>{attachment.fileName}</Typography>
                <Typography color="text.secondary" variant="body2">
                  {attachment.fileSizeLabel} · {attachment.uploadedBy} · {attachment.uploadedAt}
                </Typography>
              </Box>
              <Button href={attachment.url} size="small" variant="text">View</Button>
            </Stack>
          ))
        )}
      </Stack>
    </SectionCard>
  );
}
