import { getTranslations } from "next-intl/server";

import { ServiceOpsPlaceholder } from "@/features/service-ops/components/ServiceOpsPlaceholder";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("pages.serviceOps");

  return (
    <ServiceOpsPlaceholder
      title={t("requestDetail.title", { id })}
      description={t("requestDetail.description")}
      phase={t("phase1")}
    />
  );
}
