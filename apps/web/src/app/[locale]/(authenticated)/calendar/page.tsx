import { getTranslations } from "next-intl/server";

export default async function CalendarPage() {
  const t = await getTranslations("pages");
  return <div>{t("calendarComingSoon")}</div>;
}

