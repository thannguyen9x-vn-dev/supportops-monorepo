import { redirect } from "next/navigation";

export default async function LegacySettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { locale } = await params;
  const { tab } = await searchParams;

  if (tab === "general" || tab === "notifications" || tab === "security" || tab === "sessions") {
    redirect(`/${locale}/account/profile?tab=${encodeURIComponent(tab)}`);
  }

  if (tab === "sla") {
    redirect(`/${locale}/settings/sla`);
  }

  if (tab === "service-types") {
    redirect(`/${locale}/settings/service-types`);
  }

  redirect(`/${locale}/settings/workflow`);
}
