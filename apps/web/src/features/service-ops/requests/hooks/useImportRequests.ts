import { useCallback, useMemo, useState } from "react";

import { importRequestsService } from "../services/import-requests.service";
import { IMPORT_INITIAL_STATE, type UseImportRequestsState } from "./useImportRequests.state";
import { useImportJobPolling } from "./useImportJobPolling";

export function useImportRequests() {
  const [state, setState] = useState<UseImportRequestsState>(IMPORT_INITIAL_STATE);
  useImportJobPolling({ jobId: state.jobId, step: state.step, setState });

  const uploadFile = useCallback(async (file: File): Promise<void> => {
    setState((current) => ({ ...current, isUploading: true, step: "processing", error: null }));
    try {
      const response = await importRequestsService.uploadImportFile(file);
      setState((current) => ({
        ...current,
        isUploading: false,
        jobId: response.jobId,
        step: "processing",
        jobStatus: { jobId: response.jobId, status: response.status },
      }));
    } catch {
      setState((current) => ({ ...current, isUploading: false, step: "upload", error: "Import failed" }));
    }
  }, []);

  const warningRows = useMemo(
    () => new Set((state.preview?.warningRows ?? []).map((warning) => warning.row)),
    [state.preview],
  );

  const toggleRow = useCallback(
    (rowIndex: number): void => {
      if (!warningRows.has(rowIndex)) {
        return;
      }

      setState((current) => {
        const nextSkippedRows = new Set(current.skippedRows);
        if (nextSkippedRows.has(rowIndex)) {
          nextSkippedRows.delete(rowIndex);
        } else {
          nextSkippedRows.add(rowIndex);
        }
        return { ...current, skippedRows: nextSkippedRows };
      });
    },
    [warningRows],
  );

  const confirmImport = useCallback(async (): Promise<void> => {
    if (!state.jobId) {
      return;
    }

    setState((current) => ({ ...current, step: "processing", error: null }));
    try {
      await importRequestsService.confirmImport(state.jobId, [...state.skippedRows]);
    } catch {
      setState((current) => ({ ...current, step: "result", error: "Import failed" }));
    }
  }, [state.jobId, state.skippedRows]);

  const reset = useCallback((): void => {
    setState(IMPORT_INITIAL_STATE);
  }, []);

  return {
    ...state,
    uploadFile,
    toggleRow,
    confirmImport,
    reset,
    downloadTemplate: importRequestsService.downloadTemplate,
  };
}
