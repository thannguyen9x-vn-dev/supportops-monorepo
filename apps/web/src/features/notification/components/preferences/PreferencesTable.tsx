import {
  Button,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { NotificationEventType, type NotificationPreferenceItem } from "@supportops/types";
import { useTranslations } from "next-intl";

import { PreferenceRow } from "./PreferenceRow";

const EVENT_ORDER: NotificationEventType[] = [
  NotificationEventType.REQUEST_ASSIGNED,
  NotificationEventType.REQUEST_STATUS_CHANGED,
  NotificationEventType.REQUEST_COMMENTED,
  NotificationEventType.REQUEST_MENTIONED,
  NotificationEventType.REQUEST_CREATED,
  NotificationEventType.SLA_NEAR_BREACH_RESPONSE,
  NotificationEventType.SLA_NEAR_BREACH_RESOLUTION,
];

export function PreferencesTable({
  preferences,
  isLoading,
  isSaving,
  onToggle,
  onSave,
}: {
  preferences: NotificationPreferenceItem[];
  isLoading: boolean;
  isSaving: boolean;
  onToggle: (eventType: NotificationPreferenceItem["eventType"], channel: "inApp" | "email", checked: boolean) => void;
  onSave: () => Promise<void>;
}) {
  const t = useTranslations("notificationPreferences");

  if (isLoading) {
    return (
      <Stack alignItems="center" py={4}>
        <CircularProgress size={24} />
      </Stack>
    );
  }

  const sorted = EVENT_ORDER
    .map((eventType) => preferences.find((item) => item.eventType === eventType))
    .filter((item): item is NotificationPreferenceItem => Boolean(item));

  return (
    <Stack spacing={2}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t("columns.event")}</TableCell>
            <TableCell align="center">{t("columns.inApp")}</TableCell>
            <TableCell align="center">{t("columns.email")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map((item) => (
            <PreferenceRow
              item={item}
              key={item.eventType}
              label={t(`events.${item.eventType}`)}
              onToggle={onToggle}
            />
          ))}
        </TableBody>
      </Table>

      <Button disabled={isSaving} onClick={() => void onSave()} sx={{ alignSelf: "flex-end" }} variant="contained">
        {t("save")}
      </Button>
    </Stack>
  );
}
