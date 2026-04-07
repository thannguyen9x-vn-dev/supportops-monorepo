import { KnowledgeArticleDetailView } from "@/features/knowledge-base/components/KnowledgeArticleDetailView";

export default async function KnowledgeBaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <KnowledgeArticleDetailView id={id} />;
}
