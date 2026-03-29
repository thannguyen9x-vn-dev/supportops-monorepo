import { Switch, TableCell, TableRow, Typography } from "@mui/material";
import type { NotificationPreferenceItem } from "@supportops/types";

export function PreferenceRow({
  item,
  label,
  onToggle,
}: {
  item: NotificationPreferenceItem;
  label: string;
  onToggle: (eventType: NotificationPreferenceItem["eventType"], channel: "inApp" | "email", checked: boolean) => void;
}) {
  return (
    <TableRow>
      <TableCell>
        <Typography variant="body2">{label}</Typography>
      </TableCell>
      <TableCell align="center">
        <Switch
          checked={item.inApp}
          onChange={(event) => onToggle(item.eventType, "inApp", event.target.checked)}
        />
      </TableCell>
      <TableCell align="center">
        <Switch
          checked={item.email}
          onChange={(event) => onToggle(item.eventType, "email", event.target.checked)}
        />
      </TableCell>
    </TableRow>
  );
}
