"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_AI_MODEL } from "@supportops/types";
import type { AiModelId } from "@supportops/types";
import { ApiError } from "@/lib/api";
import { aiSettingsService } from "../services/ai-settings.service";

export function useAiSettings() {
  const [defaultModel, setDefaultModel] = useState<AiModelId>(DEFAULT_AI_MODEL);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await aiSettingsService.get();
        setDefaultModel(data.defaultModel as AiModelId);
      } catch {
        setLoadError("Failed to load AI settings");
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const handleSave = useCallback(
    async (model: AiModelId) => {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);
      try {
        const { data } = await aiSettingsService.update({ defaultModel: model });
        setDefaultModel(data.defaultModel as AiModelId);
        setSaveSuccess(true);
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : "Failed to save AI settings";
        setSaveError(message);
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  return {
    defaultModel,
    isLoading,
    isSaving,
    loadError,
    saveSuccess,
    saveError,
    handleSave,
  };
}
