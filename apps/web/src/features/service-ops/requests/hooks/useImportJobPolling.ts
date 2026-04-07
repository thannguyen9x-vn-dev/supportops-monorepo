import { useCallback, useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ImportJobStatusResponse } from "@supportops/types";

import { importRequestsService } from "../services/import-requests.service";
import {
  IMPORT_POLL_INTERVAL_MS,
  IMPORT_POLL_TIMEOUT_MS,
  type UseImportRequestsState,
} from "./useImportRequests.state";

interface UseImportJobPollingInput {
  jobId: string | null;
  step: UseImportRequestsState["step"];
  setState: Dispatch<SetStateAction<UseImportRequestsState>>;
}

export function useImportJobPolling({ jobId, step, setState }: UseImportJobPollingInput): void {
  const pollStartedAtRef = useRef<number | null>(null);

  const applyJobStatus = useCallback(
    (nextStatus: ImportJobStatusResponse): void => {
      setState((current) => {
        if (nextStatus.status === "preview_ready") {
          const preview = nextStatus.preview ?? null;
          const errorRows = preview?.errorRows ?? [];
          return {
            ...current,
            step: "preview",
            preview,
            jobStatus: nextStatus,
            skippedRows: new Set(errorRows.map((row) => row.row)),
            error: null,
          };
        }

        if (nextStatus.status === "completed") {
          return { ...current, step: "result", jobStatus: nextStatus, error: null };
        }

        if (nextStatus.status === "failed") {
          return { ...current, step: "result", jobStatus: nextStatus, error: nextStatus.error ?? "Import failed" };
        }

        return { ...current, jobStatus: nextStatus };
      });
    },
    [setState],
  );

  useEffect(() => {
    if (!jobId || step !== "processing") {
      pollStartedAtRef.current = null;
      return;
    }

    if (pollStartedAtRef.current === null) {
      pollStartedAtRef.current = Date.now();
    }

    const intervalId = window.setInterval(() => {
      const startedAt = pollStartedAtRef.current;
      if (startedAt !== null && Date.now() - startedAt >= IMPORT_POLL_TIMEOUT_MS) {
        setState((current) => ({ ...current, step: "result", error: "Import timed out" }));
        pollStartedAtRef.current = null;
        return;
      }

      void importRequestsService
        .getJobStatus(jobId)
        .then(applyJobStatus)
        .catch(() => setState((current) => ({ ...current, step: "result", error: "Import failed" })));
    }, IMPORT_POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [applyJobStatus, jobId, setState, step]);
}
