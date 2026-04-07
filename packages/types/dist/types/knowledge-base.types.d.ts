export type KnowledgeBaseStatus = "DRAFT" | "PUBLISHED";
export interface KnowledgeArticle {
    id: string;
    title: string;
    body: string;
    category: string | null;
    tags: string[];
    status: KnowledgeBaseStatus;
    authorId: string;
    authorName: string;
    createdAt: string;
    updatedAt: string;
}
export interface KnowledgeArticleSummary {
    id: string;
    title: string;
    category: string | null;
    tags: string[];
    status: KnowledgeBaseStatus;
    authorName: string;
    updatedAt: string;
}
export interface KnowledgeArticlePickerItem {
    id: string;
    title: string;
    slug: string;
}
//# sourceMappingURL=knowledge-base.types.d.ts.map