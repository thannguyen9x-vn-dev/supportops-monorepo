import { RequestDetailScreen } from "@/features/service-ops/requests/components/RequestDetailScreen";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RequestDetailScreen requestId={id} />;
}
