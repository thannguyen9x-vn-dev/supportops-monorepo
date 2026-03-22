import type {
  AssignmentHistoryEntry,
  AssignRequestInput,
  CreateRequestCommentInput,
  CreateRequestWorkLogInput,
  CreateServiceRequestInput,
  RequestComment,
  RequestAssignee,
  RequestWorkflowDetail,
  RequestWorkLog,
  ServiceRequest,
  UpdateRequestStatusInput,
} from "@supportops/types";

import { ENDPOINTS, apiClient } from "@/lib/api";

export const requestService = {
  list: (params?: { page?: number; size?: number; search?: string; status?: string }) =>
    apiClient.get<ServiceRequest[]>(ENDPOINTS.REQUESTS.LIST, {
      params: {
        page: params?.page ?? 1,
        size: params?.size ?? 20,
        search: params?.search,
        status: params?.status,
      },
    }),

  create: (payload: CreateServiceRequestInput) =>
    apiClient.post<ServiceRequest>(ENDPOINTS.REQUESTS.CREATE, payload),

  detail: (id: string) =>
    apiClient.get<ServiceRequest>(ENDPOINTS.REQUESTS.DETAIL(id)),

  detailWorkflow: (id: string) =>
    apiClient.get<RequestWorkflowDetail>(ENDPOINTS.REQUESTS.WORKFLOW(id)),

  listAssignees: () =>
    apiClient.get<RequestAssignee[]>(ENDPOINTS.REQUESTS.ASSIGNEES, { cache: "no-store" }),

  updateStatus: (id: string, payload: UpdateRequestStatusInput) =>
    apiClient.patch<ServiceRequest>(ENDPOINTS.REQUESTS.STATUS(id), payload),

  addComment: (id: string, payload: CreateRequestCommentInput) =>
    apiClient.post<RequestComment>(ENDPOINTS.REQUESTS.COMMENTS(id), payload),

  listComments: (id: string, params?: { page?: number; size?: number; visibility?: "PUBLIC" | "INTERNAL" }) =>
    apiClient.get<RequestComment[]>(ENDPOINTS.REQUESTS.COMMENTS(id), {
      params: {
        page: params?.page ?? 1,
        size: params?.size ?? 100,
        visibility: params?.visibility,
      },
    }),

  addWorkLog: (id: string, payload: CreateRequestWorkLogInput) =>
    apiClient.post<RequestWorkLog>(ENDPOINTS.REQUESTS.WORK_LOG(id), payload),

  listWorkLogs: (id: string, params?: { page?: number; size?: number }) =>
    apiClient.get<RequestWorkLog[]>(ENDPOINTS.WORK_LOGS.LIST(id), {
      params: {
        page: params?.page ?? 1,
        size: params?.size ?? 100,
      },
    }),

  assign: (id: string, payload: AssignRequestInput) =>
    apiClient.patch<ServiceRequest>(ENDPOINTS.REQUESTS.ASSIGN(id), payload),

  unassign: (id: string) =>
    apiClient.patch<ServiceRequest>(ENDPOINTS.REQUESTS.UNASSIGN(id)),

  listAssignmentHistory: (requestId: string, params?: { page?: number; size?: number }) =>
    apiClient.get<AssignmentHistoryEntry[]>(ENDPOINTS.ASSIGNMENTS.LIST, {
      params: {
        requestId,
        page: params?.page ?? 1,
        size: params?.size ?? 100,
      },
    }),
};
