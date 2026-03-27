import { useDialog } from "@supportops/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { ApiError } from "@/lib/api";

import type { SettingsLoadState } from "../types";

interface UseSettingsCrudOptions<TItem, TFormValues> {
  queryKey: readonly unknown[];
  emptyForm: TFormValues;
  toFormValues: (item: TItem) => TFormValues;
  loadItems: () => Promise<TItem[]>;
  saveItem: (params: { editingId: string; values: TFormValues }) => Promise<TItem | null>;
  deleteItem: (id: string) => Promise<void>;
  getItemId: (item: TItem) => string;
  resetForm: (values: TFormValues) => void;
  loadErrorMessage: string;
  onSaveSuccess: () => void;
  onSaveError: () => void;
  onDeleteSuccess: () => void;
  onDeleteError: () => void;
}

interface UseSettingsCrudReturn<TItem, TFormValues> {
  dialog: ReturnType<typeof useDialog>;
  deleteDialog: ReturnType<typeof useDialog>;
  loadState: SettingsLoadState;
  items: TItem[];
  errorMessage: string | null;
  editingId: string;
  deletingId: string;
  isSubmitting: boolean;
  reloadItems: () => Promise<void>;
  openAddDialog: () => void;
  openEditDialog: (item: TItem) => void;
  closeDialog: () => void;
  save: (values: TFormValues) => Promise<void>;
  openDeleteDialog: (id: string) => void;
  confirmDelete: () => Promise<void>;
}

export function useSettingsCrud<TItem, TFormValues>({
  queryKey,
  emptyForm,
  toFormValues,
  loadItems,
  saveItem,
  deleteItem,
  getItemId,
  resetForm,
  loadErrorMessage,
  onSaveSuccess,
  onSaveError,
  onDeleteSuccess,
  onDeleteError,
}: UseSettingsCrudOptions<TItem, TFormValues>): UseSettingsCrudReturn<TItem, TFormValues> {
  const queryClient = useQueryClient();
  const dialog = useDialog();
  const deleteDialog = useDialog();
  const [deletingId, setDeletingId] = useState("");
  const [editingId, setEditingId] = useState("");

  const { data = [], status, error } = useQuery({
    queryKey,
    queryFn: loadItems,
  });

  const loadState = useMemo<SettingsLoadState>(() => {
    if (status === "pending") return "loading";
    if (status === "error") {
      if (error instanceof ApiError && error.status === 403) return "permissionDenied";
      return "error";
    }
    return data.length === 0 ? "empty" : "success";
  }, [status, error, data.length]);

  const errorMessage = status === "error" && !(error instanceof ApiError && error.status === 403)
    ? loadErrorMessage
    : null;

  const reloadItems = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const openAddDialog = useCallback(() => {
    setEditingId("");
    resetForm(emptyForm);
    dialog.open();
  }, [dialog, emptyForm, resetForm]);

  const openEditDialog = useCallback(
    (item: TItem) => {
      setEditingId(getItemId(item));
      resetForm(toFormValues(item));
      dialog.open();
    },
    [dialog, getItemId, resetForm, toFormValues],
  );

  const closeDialog = useCallback(() => {
    dialog.close();
    setEditingId("");
    resetForm(emptyForm);
  }, [dialog, emptyForm, resetForm]);

  const saveMutation = useMutation({
    mutationFn: (values: TFormValues) => saveItem({ editingId, values }),
    onSuccess: (saved) => {
      if (!saved) return;
      const savedId = getItemId(saved);
      queryClient.setQueryData<TItem[]>(queryKey, (current = []) => {
        const exists = current.some((item) => getItemId(item) === savedId);
        return exists
          ? current.map((item) => (getItemId(item) === savedId ? saved : item))
          : [saved, ...current];
      });
      onSaveSuccess();
      closeDialog();
    },
    onError: onSaveError,
  });

  const save = useCallback(
    async (values: TFormValues) => {
      try {
        await saveMutation.mutateAsync(values);
      } catch {
        // error handled by onError callback
      }
    },
    [saveMutation],
  );

  const deleteMutation = useMutation({
    mutationFn: () => deleteItem(deletingId),
    onSuccess: () => {
      queryClient.setQueryData<TItem[]>(queryKey, (current = []) =>
        current.filter((item) => getItemId(item) !== deletingId),
      );
      onDeleteSuccess();
      deleteDialog.close();
    },
    onError: onDeleteError,
  });

  const openDeleteDialog = useCallback(
    (id: string) => {
      setDeletingId(id);
      deleteDialog.open();
    },
    [deleteDialog],
  );

  const confirmDelete = useCallback(async () => {
    try {
      await deleteMutation.mutateAsync();
    } catch {
      // error handled by onError callback
    }
  }, [deleteMutation]);

  return {
    dialog,
    deleteDialog,
    loadState,
    items: data,
    errorMessage,
    editingId,
    deletingId,
    isSubmitting: saveMutation.isPending,
    reloadItems,
    openAddDialog,
    openEditDialog,
    closeDialog,
    save,
    openDeleteDialog,
    confirmDelete,
  };
}
