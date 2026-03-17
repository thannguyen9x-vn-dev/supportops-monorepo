import { getTranslations } from "next-intl/server";

import { ServiceOpsPlaceholder } from "@/features/service-ops/components/ServiceOpsPlaceholder";

export default async function WorkflowSettingsPage() {
  const t = await getTranslations("pages.serviceOps");

  return (
    <ServiceOpsPlaceholder
      title={t("workflowConfig.title")}
      description={t("workflowConfig.description")}
      phase={t("phase4")}
    />
  );
}
