import { getTranslations } from "next-intl/server";

import { ServiceOpsPlaceholder } from "@/features/service-ops/components/ServiceOpsPlaceholder";

export default async function ServiceTypeSettingsPage() {
  const t = await getTranslations("pages.serviceOps");

  return (
    <ServiceOpsPlaceholder
      title={t("serviceTypes.title")}
      description={t("serviceTypes.description")}
      phase={t("phase4")}
    />
  );
}
