import { useDialog } from "@supportops/ui";
import { useCallback, useEffect, useState } from "react";

import { ApiError } from "@/lib/api";

import type { SettingsLoadState } from "../types";

interface UseSettingsCrudOptions<TItem, TFormValues> {
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
  const dialog = useDialog();
  const deleteDialog = useDialog();
  const [deletingId, setDeletingId] = useState("");
  const [loadState, setLoadState] = useState<SettingsLoadState>("loading");
  const [items, setItems] = useState<TItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState("");

  const reloadItems = useCallback(async () => {
    setLoadState("loading");
    setErrorMessage(null);
    try {
      const data = await loadItems();
      setItems(data);
      setLoadState(data.length === 0 ? "empty" : "success");
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        setLoadState("permissionDenied");
        return;
      }
      setLoadState("error");
      setErrorMessage(loadErrorMessage);
    }
  }, [loadItems, loadErrorMessage]);

  useEffect(() => {
    void reloadItems();
  }, [reloadItems]);

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

  const save = useCallback(
    async (values: TFormValues) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
        const saved = await saveItem({ editingId, values });
        if (!saved) {
          return;
        }
        const savedId = getItemId(saved);
        setItems((current) => {
          const exists = current.some((item) => getItemId(item) === savedId);
          if (exists) {
            return current.map((item) => (getItemId(item) === savedId ? saved : item));
          }
          return [saved, ...current];
        });
        setLoadState("success");
        onSaveSuccess();
        closeDialog();
      } catch {
        onSaveError();
      } finally {
        setIsSubmitting(false);
      }
    },
    [closeDialog, editingId, getItemId, isSubmitting, onSaveError, onSaveSuccess, saveItem],
  );

  const openDeleteDialog = useCallback(
    (id: string) => {
      setDeletingId(id);
      deleteDialog.open();
    },
    [deleteDialog],
  );

  const confirmDelete = useCallback(async () => {
    try {
      await deleteItem(deletingId);
      let nextLength = 0;
      setItems((current) => {
        const next = current.filter((item) => getItemId(item) !== deletingId);
        nextLength = next.length;
        return next;
      });
      setLoadState(nextLength === 0 ? "empty" : "success");
      onDeleteSuccess();
      deleteDialog.close();
    } catch {
      onDeleteError();
    }
  }, [deleteDialog, deleteItem, deletingId, getItemId, onDeleteError, onDeleteSuccess]);

  return {
    dialog,
    deleteDialog,
    loadState,
    items,
    errorMessage,
    editingId,
    deletingId,
    isSubmitting,
    reloadItems,
    openAddDialog,
    openEditDialog,
    closeDialog,
    save,
    openDeleteDialog,
    confirmDelete,
  };
}
