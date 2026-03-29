"use client";

import { CircularProgress, Paper } from "@mui/material";

import { useAuth } from "@/features/auth/hooks/useAuth";

import { useKnowledgeBase } from "../hooks/useKnowledgeBase";
import { KnowledgeBaseHeader } from "./KnowledgeBaseHeader";
import { KnowledgeBaseTable } from "./KnowledgeBaseTable";

export function KnowledgeBaseView() {
  const { user } = useAuth();
  const kb = useKnowledgeBase();

  return (
    <>
      <KnowledgeBaseHeader onSearch={kb.setSearch} role={user?.role} search={kb.search} />
      <Paper sx={{ p: 2 }}>
        {kb.isLoading ? <CircularProgress size={24} /> : null}
        <KnowledgeBaseTable items={kb.items} onDelete={kb.remove} role={user?.role} userId={user?.id} />
      </Paper>
    </>
  );
}
