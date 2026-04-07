"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { knowledgeBaseService } from "../services/knowledge-base.service";

export function useKnowledgeBasePicker() {
  const [query, setQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["kb-picker", query],
    queryFn: () => knowledgeBaseService.search(query),
    enabled: query.length >= 2,
    staleTime: 30_000,
  });

  return {
    query,
    setQuery,
    results: data ?? [],
    isLoading,
  };
}
