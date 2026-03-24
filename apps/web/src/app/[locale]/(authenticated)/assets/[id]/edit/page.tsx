import { AssetFormView } from "@/features/service-ops/assets/components/AssetFormView";

export default async function AssetEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AssetFormView mode="edit" assetId={id} />;
}
