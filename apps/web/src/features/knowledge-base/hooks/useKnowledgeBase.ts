"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateKnowledgeArticleInput, UpdateKnowledgeArticleInput } from "@supportops/types";
import { useMemo, useState } from "react";

import { knowledgeBaseService } from "../services/knowledge-base.service";

export function useKnowledgeBase() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const listQuery = useQuery({
    queryKey: ["knowledge-base", search],
    queryFn: () => knowledgeBaseService.list({ q: search, page: 1, size: 30 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateKnowledgeArticleInput) => knowledgeBaseService.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["knowledge-base"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateKnowledgeArticleInput }) =>
      knowledgeBaseService.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["knowledge-base"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => knowledgeBaseService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["knowledge-base"] });
    },
  });

  const items = useMemo(() => listQuery.data?.items ?? [], [listQuery.data?.items]);

  return {
    items,
    isLoading: listQuery.isLoading,
    search,
    setSearch,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
}
