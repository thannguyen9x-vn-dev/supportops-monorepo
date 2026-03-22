import { RequestDetailView } from "@/features/service-ops/requests/components/RequestDetailView";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RequestDetailView requestId={id} />;
}
