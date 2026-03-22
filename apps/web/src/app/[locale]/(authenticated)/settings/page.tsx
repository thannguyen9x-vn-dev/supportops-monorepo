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
  const target = tab ? `/${locale}/account/profile?tab=${encodeURIComponent(tab)}` : `/${locale}/account/profile`;
  redirect(target);
}
