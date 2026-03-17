import { getTranslations } from "next-intl/server";

export default async function TeamPage() {
  const t = await getTranslations("pages");
  return <div>{t("teamComingSoon")}</div>;
}

