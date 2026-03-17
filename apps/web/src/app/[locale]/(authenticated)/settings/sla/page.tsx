import { getTranslations } from "next-intl/server";

import { ServiceOpsPlaceholder } from "@/features/service-ops/components/ServiceOpsPlaceholder";

export default async function SlaSettingsPage() {
  const t = await getTranslations("pages.serviceOps");

  return (
    <ServiceOpsPlaceholder
      title={t("slaPolicy.title")}
      description={t("slaPolicy.description")}
      phase={t("phase3")}
    />
  );
}
