"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateCannedResponseInput, UpdateCannedResponseInput } from "@supportops/types";
import { useMemo, useState } from "react";

import { cannedResponseService } from "../services/canned-response.service";

export function useCannedResponses() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const list = useQuery({
    queryKey: ["canned-responses", search],
    queryFn: () => cannedResponseService.list({ q: search }),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCannedResponseInput) => cannedResponseService.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["canned-responses"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCannedResponseInput }) =>
      cannedResponseService.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["canned-responses"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cannedResponseService.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["canned-responses"] });
    },
  });

  return {
    items: useMemo(() => list.data?.items ?? [], [list.data?.items]),
    isLoading: list.isLoading,
    search,
    setSearch,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
}
