import { Card, CardContent, Chip, Stack, Typography } from "@mui/material";

type ServiceOpsPlaceholderProps = {
  title: string;
  description: string;
  phase: string;
};

export function ServiceOpsPlaceholder({ title, description, phase }: ServiceOpsPlaceholderProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h5">{title}</Typography>
            <Chip label={phase} size="small" color="primary" />
          </Stack>
          <Typography color="text.secondary">{description}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
