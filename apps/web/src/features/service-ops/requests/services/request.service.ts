import type {
  AssignRequestInput,
  CreateRequestCommentInput,
  CreateRequestWorkLogInput,
  CreateServiceRequestInput,
  RequestComment,
  RequestAssignee,
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

  listAssignees: () =>
    apiClient.get<RequestAssignee[]>(ENDPOINTS.REQUESTS.ASSIGNEES, { cache: "no-store" }),

  updateStatus: (id: string, payload: UpdateRequestStatusInput) =>
    apiClient.patch<ServiceRequest>(ENDPOINTS.REQUESTS.STATUS(id), payload),

  addComment: (id: string, payload: CreateRequestCommentInput) =>
    apiClient.post<RequestComment>(ENDPOINTS.REQUESTS.COMMENTS(id), payload),

  addWorkLog: (id: string, payload: CreateRequestWorkLogInput) =>
    apiClient.post<RequestWorkLog>(ENDPOINTS.REQUESTS.WORK_LOG(id), payload),

  assign: (id: string, payload: AssignRequestInput) =>
    apiClient.patch<ServiceRequest>(ENDPOINTS.REQUESTS.ASSIGN(id), payload),
};
