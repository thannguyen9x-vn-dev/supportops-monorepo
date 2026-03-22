import { ENDPOINTS, apiClient, ApiError } from "@/lib/api";

import type {
  ServiceTypeSetting,
  SlaPolicySetting,
  WorkflowTransitionSetting,
} from "../types";

const STORAGE_KEYS = {
  serviceTypes: "service-ops.settings.service-types.v1",
  slaPolicies: "service-ops.settings.sla-policies.v1",
  workflows: "service-ops.settings.workflows.v1",
} as const;

const DEFAULT_SERVICE_TYPES: ServiceTypeSetting[] = [
  { id: "st-hvac", code: "HVAC", name: "HVAC / Climate Control", isActive: true, workflowName: "Default Workflow", slaPolicyId: "policy-hvac" },
  { id: "st-lighting", code: "LIGHTING", name: "Lighting", isActive: true, workflowName: "Default Workflow", slaPolicyId: "policy-lighting" },
  { id: "st-water", code: "WATER", name: "Water Leakage", isActive: true, workflowName: "Emergency Workflow", slaPolicyId: "policy-water" },
];

const DEFAULT_SLA_POLICIES: SlaPolicySetting[] = [
  { id: "policy-hvac", serviceTypeCode: "HVAC", responseMinutes: 30, resolutionMinutes: 480, escalationAfterMinutes: 60 },
  { id: "policy-lighting", serviceTypeCode: "LIGHTING", responseMinutes: 30, resolutionMinutes: 240, escalationAfterMinutes: 60 },
  { id: "policy-water", serviceTypeCode: "WATER", responseMinutes: 15, resolutionMinutes: 120, escalationAfterMinutes: 30 },
];

const DEFAULT_WORKFLOWS: WorkflowTransitionSetting[] = [
  { id: "wf-1", serviceTypeCode: "HVAC", fromStatus: "SUBMITTED", toStatus: "TRIAGE", allowedRoles: ["TENANT_ADMIN", "TEAM_LEADER"] },
  { id: "wf-2", serviceTypeCode: "HVAC", fromStatus: "TRIAGE", toStatus: "ASSIGNED", allowedRoles: ["TENANT_ADMIN", "TEAM_LEADER"] },
  { id: "wf-3", serviceTypeCode: "HVAC", fromStatus: "ASSIGNED", toStatus: "IN_PROGRESS", allowedRoles: ["TENANT_ADMIN", "TEAM_LEADER", "AGENT"] },
  { id: "wf-4", serviceTypeCode: "WATER", fromStatus: "IN_PROGRESS", toStatus: "RESOLVED", allowedRoles: ["TENANT_ADMIN", "TEAM_LEADER", "AGENT"] },
];

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readLocalJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLocalJson<T>(key: string, value: T): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function mapServiceType(item: {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
}): ServiceTypeSetting {
  return {
    id: item.id,
    code: item.code,
    name: item.name,
    isActive: item.isActive ?? true,
    workflowName: undefined,
    slaPolicyId: undefined,
  };
}

function mapSlaPolicy(item: {
  id: string;
  serviceTypeCode: string;
  responseMinutes: number;
  resolutionMinutes: number;
  escalationAfterMinutes: number;
}): SlaPolicySetting {
  return {
    id: item.id,
    serviceTypeCode: item.serviceTypeCode,
    responseMinutes: item.responseMinutes,
    resolutionMinutes: item.resolutionMinutes,
    escalationAfterMinutes: item.escalationAfterMinutes,
  };
}

function mapWorkflowTransition(item: {
  id: string;
  serviceTypeCode: string;
  fromStatus: string;
  toStatus: string;
  allowedRoles: string[];
}): WorkflowTransitionSetting {
  return {
    id: item.id,
    serviceTypeCode: item.serviceTypeCode,
    fromStatus: item.fromStatus,
    toStatus: item.toStatus,
    allowedRoles: item.allowedRoles,
  };
}

export const serviceOpsSettingsService = {
  async listSlaPolicies(): Promise<SlaPolicySetting[]> {
    try {
      const { data } = await apiClient.get<Array<{
        id: string;
        serviceTypeCode: string;
        responseMinutes: number;
        resolutionMinutes: number;
        escalationAfterMinutes: number;
      }>>(ENDPOINTS.SLA_POLICIES.LIST, { cache: "no-store" });
      const mapped = data.map(mapSlaPolicy);
      writeLocalJson(STORAGE_KEYS.slaPolicies, mapped);
      return mapped;
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        throw error;
      }
      return readLocalJson<SlaPolicySetting[]>(STORAGE_KEYS.slaPolicies, DEFAULT_SLA_POLICIES);
    }
  },

  async saveSlaPolicy(input: Omit<SlaPolicySetting, "id"> & { id?: string }): Promise<SlaPolicySetting> {
    const payload = {
      serviceTypeCode: input.serviceTypeCode.trim().toUpperCase(),
      responseMinutes: input.responseMinutes,
      resolutionMinutes: input.resolutionMinutes,
      escalationAfterMinutes: input.escalationAfterMinutes,
    };
    const endpoint = input.id ? ENDPOINTS.SLA_POLICIES.DETAIL(input.id) : ENDPOINTS.SLA_POLICIES.LIST;
    const method = input.id ? "patch" : "post";
    const response = await (method === "patch"
      ? apiClient.patch<SlaPolicySetting>(endpoint, payload)
      : apiClient.post<SlaPolicySetting>(endpoint, payload));
    return mapSlaPolicy(response.data);
  },

  async deleteSlaPolicy(id: string): Promise<void> {
    await apiClient.delete<void>(ENDPOINTS.SLA_POLICIES.DETAIL(id));
  },

  async listServiceTypes(): Promise<ServiceTypeSetting[]> {
    try {
      const { data } = await apiClient.get<Array<{ id: string; code: string; name: string; description?: string | null; isActive?: boolean }>>(
        ENDPOINTS.SERVICE_TYPES.LIST,
        { cache: "no-store" },
      );
      const mapped = data.map(mapServiceType);
      writeLocalJson(STORAGE_KEYS.serviceTypes, mapped);
      return mapped;
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        throw error;
      }
      return readLocalJson<ServiceTypeSetting[]>(STORAGE_KEYS.serviceTypes, DEFAULT_SERVICE_TYPES);
    }
  },

  async saveServiceType(input: Omit<ServiceTypeSetting, "id"> & { id?: string }): Promise<ServiceTypeSetting> {
    const payload = {
      code: input.code.trim().toUpperCase(),
      name: input.name.trim(),
      description: undefined as string | undefined,
      isActive: input.isActive,
    };
    const endpoint = input.id ? ENDPOINTS.SERVICE_TYPES.DETAIL(input.id) : ENDPOINTS.SERVICE_TYPES.LIST;
    const method = input.id ? "patch" : "post";
    const response = await (method === "patch"
      ? apiClient.patch<ServiceTypeSetting>(endpoint, payload)
      : apiClient.post<ServiceTypeSetting>(endpoint, payload));
    return mapServiceType(response.data);
  },

  async deleteServiceType(id: string): Promise<void> {
    await apiClient.delete<void>(ENDPOINTS.SERVICE_TYPES.DETAIL(id));
  },

  async listWorkflowTransitions(): Promise<WorkflowTransitionSetting[]> {
    try {
      const { data } = await apiClient.get<Array<{
        id: string;
        serviceTypeCode: string;
        fromStatus: string;
        toStatus: string;
        allowedRoles: string[];
      }>>(ENDPOINTS.WORKFLOW_TRANSITIONS.LIST, { cache: "no-store" });
      const mapped = data.map(mapWorkflowTransition);
      writeLocalJson(STORAGE_KEYS.workflows, mapped);
      return mapped;
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        throw error;
      }
      return readLocalJson<WorkflowTransitionSetting[]>(STORAGE_KEYS.workflows, DEFAULT_WORKFLOWS);
    }
  },

  async saveWorkflowTransition(
    input: Omit<WorkflowTransitionSetting, "id"> & { id?: string },
  ): Promise<WorkflowTransitionSetting> {
    const payload = {
      serviceTypeCode: input.serviceTypeCode.trim().toUpperCase(),
      fromStatus: input.fromStatus.trim().toUpperCase(),
      toStatus: input.toStatus.trim().toUpperCase(),
      allowedRoles: input.allowedRoles.map((role) => role.trim().toUpperCase()).filter(Boolean),
      isActive: true,
    };
    const endpoint = input.id
      ? ENDPOINTS.WORKFLOW_TRANSITIONS.DETAIL(input.id)
      : ENDPOINTS.WORKFLOW_TRANSITIONS.LIST;
    const method = input.id ? "patch" : "post";
    const response = await (method === "patch"
      ? apiClient.patch<WorkflowTransitionSetting>(endpoint, payload)
      : apiClient.post<WorkflowTransitionSetting>(endpoint, payload));
    return mapWorkflowTransition(response.data);
  },

  async deleteWorkflowTransition(id: string): Promise<void> {
    await apiClient.delete<void>(ENDPOINTS.WORKFLOW_TRANSITIONS.DETAIL(id));
  },
};
