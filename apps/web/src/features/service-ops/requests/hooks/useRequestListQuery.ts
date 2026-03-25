import { useCallback, useEffect, useState } from "react";
import type { RequestAssignee, ServiceRequest } from "@supportops/types";

import { ApiError } from "@/lib/api";
import { requestService } from "@/features/service-ops/requests/services/request.service";

import { INITIAL_TAB_COUNTS, type RequestFilters, type RequestTabKey } from "../components/list/request-list.types";
import { mapServiceRequestToRow, mapUiSlaHealthToApi, remapRowsWithAssignees } from "../components/list/requestList.mapper";

type UseRequestListQueryProps = {
  activeTabForQuery: RequestTabKey;
  appliedFilters: RequestFilters;
  assigneesById: Record<string, RequestAssignee>;
  debouncedSearch: string;
  enabled: boolean;
  pageIndex: number;
  pageSize: number;
  t: (key: string) => string;
};

export function useRequestListQuery({
  activeTabForQuery,
  appliedFilters,
  assigneesById,
  debouncedSearch,
  enabled,
  pageIndex,
  pageSize,
  t,
}: UseRequestListQueryProps) {
  const [rows, setRows] = useState<ReturnType<typeof mapServiceRequestToRow>[]>([]);
  const [isLoadingRows, setIsLoadingRows] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [totalRows, setTotalRows] = useState(0);
  const [tabCounts, setTabCounts] = useState(INITIAL_TAB_COUNTS);

  const loadRequests = useCallback(async () => {
    if (!enabled) return;
    setIsLoadingRows(true);
    setLoadError(null);

    try {
      const selectedAssignee = Object.values(assigneesById).find(
        (assignee) => assignee.fullName?.trim() === appliedFilters.assignee,
      );

      const { data, meta } = await requestService.list({
        page: pageIndex + 1,
        size: pageSize,
        search: debouncedSearch.trim() ? debouncedSearch.trim() : undefined,
        status: appliedFilters.status.trim() ? (appliedFilters.status.trim() as ServiceRequest["status"]) : undefined,
        serviceTypeCode: appliedFilters.serviceType.trim() ? appliedFilters.serviceType.trim() : undefined,
        assigneeId: selectedAssignee?.id,
        locationId: appliedFilters.location.trim() ? appliedFilters.location.trim() : undefined,
        slaHealth: mapUiSlaHealthToApi(appliedFilters.slaHealth),
        updatedToday: appliedFilters.updatedToday || undefined,
        tab: activeTabForQuery,
      });

      setTotalRows(meta?.total ?? data.length);
      setRows(data.map((request) => mapServiceRequestToRow(request, assigneesById)));
    } catch (error) {
      if (error instanceof ApiError) {
        setLoadError(error.error.message);
      } else {
        setLoadError(t("feedback.loadError"));
      }
    } finally {
      setIsLoadingRows(false);
    }
  }, [activeTabForQuery, appliedFilters, assigneesById, debouncedSearch, enabled, pageIndex, pageSize, t]);

  const loadTabCounts = useCallback(async () => {
    if (!enabled) return;
    try {
      const selectedAssignee = Object.values(assigneesById).find(
        (assignee) => assignee.fullName?.trim() === appliedFilters.assignee,
      );

      const { data } = await requestService.listTabCounts({
        search: debouncedSearch.trim() ? debouncedSearch.trim() : undefined,
        status: appliedFilters.status.trim() ? (appliedFilters.status.trim() as ServiceRequest["status"]) : undefined,
        serviceTypeCode: appliedFilters.serviceType.trim() ? appliedFilters.serviceType.trim() : undefined,
        assigneeId: selectedAssignee?.id,
        locationId: appliedFilters.location.trim() ? appliedFilters.location.trim() : undefined,
        slaHealth: mapUiSlaHealthToApi(appliedFilters.slaHealth),
        updatedToday: appliedFilters.updatedToday || undefined,
      });

      setTabCounts({
        allRequests: data.allRequests,
        submittedTriage: data.submittedTriage,
        unassigned: data.unassigned,
        slaRisk: data.slaRisk,
        escalated: data.escalated,
        closed: data.closed,
      });
    } catch {
      // keep previous counts
    }
  }, [appliedFilters, assigneesById, debouncedSearch, enabled]);

  useEffect(() => {
    if (!enabled) return;
    void loadRequests();
  }, [enabled, loadRequests]);

  useEffect(() => {
    if (!enabled) return;
    void loadTabCounts();
  }, [enabled, loadTabCounts]);

  useEffect(() => {
    if (!enabled || Object.keys(assigneesById).length === 0) return;
    setRows((currentRows) => remapRowsWithAssignees(currentRows, assigneesById));
  }, [assigneesById, enabled]);

  return {
    rows,
    setRows,
    totalRows,
    isLoadingRows,
    loadError,
    tabCounts,
    loadRequests,
  };
}
