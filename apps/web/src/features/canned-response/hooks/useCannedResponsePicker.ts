"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { cannedResponseService } from "../services/canned-response.service";

export function useCannedResponsePicker() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["canned-response-picker", query],
    queryFn: () => cannedResponseService.search(query),
    enabled: isOpen && query.length >= 1,
    staleTime: 60_000,
  });

  return {
    results: data ?? [],
    isOpen,
    setIsOpen,
    query,
    setQuery,
  };
}
