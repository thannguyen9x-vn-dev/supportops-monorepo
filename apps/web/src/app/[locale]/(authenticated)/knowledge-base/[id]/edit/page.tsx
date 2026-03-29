import { KnowledgeArticleEditView } from "@/features/knowledge-base/components/KnowledgeArticleEditView";

export default async function KnowledgeBaseEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <KnowledgeArticleEditView id={id} />;
}
