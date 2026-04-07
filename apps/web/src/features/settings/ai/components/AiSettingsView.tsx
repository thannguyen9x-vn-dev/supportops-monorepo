"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { AI_MODEL_OPTIONS } from "@supportops/types";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { AiModelId } from "@/features/ai-assistant/types";
import { useAiSettings } from "../hooks/useAiSettings";

export function AiSettingsView() {
  const t = useTranslations("pages.ai");
  const { defaultModel, isLoading, isSaving, loadError, saveSuccess, saveError, handleSave } =
    useAiSettings();
  const [selected, setSelected] = useState<AiModelId | null>(null);

  const currentModel = selected ?? defaultModel;

  const handleChange = (e: SelectChangeEvent<string>) => {
    setSelected(e.target.value as AiModelId);
  };

  const handleSubmit = () => {
    void handleSave(currentModel);
    setSelected(null);
  };

  if (loadError) {
    return <Alert severity="error">{loadError}</Alert>;
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {t("title")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("description")}
            </Typography>
          </Box>

          {isLoading ? (
            <Skeleton variant="rectangular" height={40} width={280} />
          ) : (
            <FormControl sx={{ maxWidth: 320 }}>
              <Select
                value={currentModel}
                onChange={handleChange}
                disabled={isSaving}
                size="small"
              >
                {AI_MODEL_OPTIONS.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2">{option.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({option.hint})
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{t("modelHelperText")}</FormHelperText>
            </FormControl>
          )}

          {saveSuccess && <Alert severity="success">{t("saveSuccess")}</Alert>}
          {saveError && <Alert severity="error">{saveError}</Alert>}

          <Box>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isLoading || isSaving}
              startIcon={isSaving ? <CircularProgress size={14} color="inherit" /> : undefined}
            >
              {isSaving ? t("saving") : t("save")}
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
