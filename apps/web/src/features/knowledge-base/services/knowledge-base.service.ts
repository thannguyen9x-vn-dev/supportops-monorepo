import type {
  CreateKnowledgeArticleInput,
  KnowledgeArticle,
  KnowledgeArticlePickerItem,
  KnowledgeArticleSummary,
  KnowledgeBaseStatus,
  PageMeta,
  UpdateKnowledgeArticleInput,
} from "@supportops/types";
import { KNOWLEDGE_BASE_ENDPOINTS } from "@supportops/types";

import { apiClient } from "@/lib/api";

export interface KnowledgeBaseListQuery {
  page?: number;
  size?: number;
  q?: string;
  status?: KnowledgeBaseStatus;
  tag?: string;
  category?: string;
}

export interface KnowledgeBaseListResult {
  items: KnowledgeArticleSummary[];
  meta: PageMeta;
}

export const knowledgeBaseService = {
  async list(query: KnowledgeBaseListQuery): Promise<KnowledgeBaseListResult> {
    const response = await apiClient.get<KnowledgeArticleSummary[]>(KNOWLEDGE_BASE_ENDPOINTS.list, {
      params: {
        page: query.page ?? 1,
        size: query.size ?? 20,
        q: query.q,
        status: query.status,
        tag: query.tag,
        category: query.category,
      },
    });

    return {
      items: response.data,
      meta: response.meta ?? {
        page: query.page ?? 1,
        size: query.size ?? 20,
        total: response.data.length,
        totalPages: 1,
      },
    };
  },

  async search(query: string): Promise<KnowledgeArticlePickerItem[]> {
    const response = await apiClient.get<KnowledgeArticlePickerItem[]>(KNOWLEDGE_BASE_ENDPOINTS.search, {
      params: { q: query },
    });
    return response.data;
  },

  async detail(id: string): Promise<KnowledgeArticle> {
    const response = await apiClient.get<KnowledgeArticle>(KNOWLEDGE_BASE_ENDPOINTS.detail(id));
    return response.data;
  },

  async create(data: CreateKnowledgeArticleInput): Promise<KnowledgeArticle> {
    const response = await apiClient.post<KnowledgeArticle>(KNOWLEDGE_BASE_ENDPOINTS.create, data);
    return response.data;
  },

  async update(id: string, data: UpdateKnowledgeArticleInput): Promise<KnowledgeArticle> {
    const response = await apiClient.put<KnowledgeArticle>(KNOWLEDGE_BASE_ENDPOINTS.update(id), data);
    return response.data;
  },

  async publish(id: string): Promise<KnowledgeArticle> {
    const response = await apiClient.patch<KnowledgeArticle>(KNOWLEDGE_BASE_ENDPOINTS.publish(id));
    return response.data;
  },

  async unpublish(id: string): Promise<KnowledgeArticle> {
    const response = await apiClient.patch<KnowledgeArticle>(KNOWLEDGE_BASE_ENDPOINTS.unpublish(id));
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(KNOWLEDGE_BASE_ENDPOINTS.delete(id));
  },
};
