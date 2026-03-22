import type { SlaPolicy } from "@supportops/types";

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

function upsertById<T extends { id: string }>(items: T[], next: T): T[] {
  const existing = items.some((item) => item.id === next.id);
  if (existing) {
    return items.map((item) => (item.id === next.id ? next : item));
  }
  return [next, ...items];
}

function mapSlaPolicy(policy: SlaPolicy): SlaPolicySetting {
  return {
    id: policy.id,
    serviceTypeCode: policy.serviceTypeCode,
    responseMinutes: policy.responseMinutes,
    resolutionMinutes: policy.resolutionMinutes,
    escalationAfterMinutes: policy.escalationAfterMinutes,
  };
}

function ensureId(prefix: string, id?: string): string {
  return id?.trim() ? id.trim() : `${prefix}-${crypto.randomUUID()}`;
}

export const serviceOpsSettingsService = {
  async listSlaPolicies(): Promise<SlaPolicySetting[]> {
    try {
      const { data } = await apiClient.get<SlaPolicy[]>(ENDPOINTS.SLA.POLICIES, { cache: "no-store" });
      if (data.length > 0) {
        const mapped = data.map(mapSlaPolicy);
        writeLocalJson(STORAGE_KEYS.slaPolicies, mapped);
        return mapped;
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        throw error;
      }
    }

    return readLocalJson<SlaPolicySetting[]>(STORAGE_KEYS.slaPolicies, DEFAULT_SLA_POLICIES);
  },

  async saveSlaPolicy(input: Omit<SlaPolicySetting, "id"> & { id?: string }): Promise<SlaPolicySetting> {
    const policy: SlaPolicySetting = {
      id: ensureId("policy", input.id),
      serviceTypeCode: input.serviceTypeCode.trim().toUpperCase(),
      responseMinutes: input.responseMinutes,
      resolutionMinutes: input.resolutionMinutes,
      escalationAfterMinutes: input.escalationAfterMinutes,
    };

    const current = readLocalJson<SlaPolicySetting[]>(STORAGE_KEYS.slaPolicies, DEFAULT_SLA_POLICIES);
    const next = upsertById(current, policy);
    writeLocalJson(STORAGE_KEYS.slaPolicies, next);
    return policy;
  },

  async deleteSlaPolicy(id: string): Promise<void> {
    const current = readLocalJson<SlaPolicySetting[]>(STORAGE_KEYS.slaPolicies, DEFAULT_SLA_POLICIES);
    writeLocalJson(
      STORAGE_KEYS.slaPolicies,
      current.filter((item) => item.id !== id),
    );
  },

  async listServiceTypes(): Promise<ServiceTypeSetting[]> {
    try {
      const { data } = await apiClient.get<Array<{ id: string; code: string; name: string; isActive?: boolean }>>(
        ENDPOINTS.SERVICE_TYPES.LIST,
        { cache: "no-store" },
      );
      if (data.length > 0) {
        const mapped: ServiceTypeSetting[] = data.map((item) => ({
          id: item.id,
          code: item.code,
          name: item.name,
          isActive: item.isActive ?? true,
        }));
        writeLocalJson(STORAGE_KEYS.serviceTypes, mapped);
        return mapped;
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        throw error;
      }
    }

    return readLocalJson<ServiceTypeSetting[]>(STORAGE_KEYS.serviceTypes, DEFAULT_SERVICE_TYPES);
  },

  async saveServiceType(input: Omit<ServiceTypeSetting, "id"> & { id?: string }): Promise<ServiceTypeSetting> {
    const serviceType: ServiceTypeSetting = {
      id: ensureId("service-type", input.id),
      code: input.code.trim().toUpperCase(),
      name: input.name.trim(),
      isActive: input.isActive,
      workflowName: input.workflowName?.trim() || undefined,
      slaPolicyId: input.slaPolicyId?.trim() || undefined,
    };

    const current = readLocalJson<ServiceTypeSetting[]>(STORAGE_KEYS.serviceTypes, DEFAULT_SERVICE_TYPES);
    const next = upsertById(current, serviceType);
    writeLocalJson(STORAGE_KEYS.serviceTypes, next);
    return serviceType;
  },

  async deleteServiceType(id: string): Promise<void> {
    const current = readLocalJson<ServiceTypeSetting[]>(STORAGE_KEYS.serviceTypes, DEFAULT_SERVICE_TYPES);
    writeLocalJson(
      STORAGE_KEYS.serviceTypes,
      current.filter((item) => item.id !== id),
    );
  },

  async listWorkflowTransitions(): Promise<WorkflowTransitionSetting[]> {
    return readLocalJson<WorkflowTransitionSetting[]>(STORAGE_KEYS.workflows, DEFAULT_WORKFLOWS);
  },

  async saveWorkflowTransition(
    input: Omit<WorkflowTransitionSetting, "id"> & { id?: string },
  ): Promise<WorkflowTransitionSetting> {
    const transition: WorkflowTransitionSetting = {
      id: ensureId("workflow-transition", input.id),
      serviceTypeCode: input.serviceTypeCode.trim().toUpperCase(),
      fromStatus: input.fromStatus.trim().toUpperCase(),
      toStatus: input.toStatus.trim().toUpperCase(),
      allowedRoles: input.allowedRoles.map((role) => role.trim().toUpperCase()).filter(Boolean),
    };

    const current = readLocalJson<WorkflowTransitionSetting[]>(STORAGE_KEYS.workflows, DEFAULT_WORKFLOWS);
    const next = upsertById(current, transition);
    writeLocalJson(STORAGE_KEYS.workflows, next);
    return transition;
  },

  async deleteWorkflowTransition(id: string): Promise<void> {
    const current = readLocalJson<WorkflowTransitionSetting[]>(STORAGE_KEYS.workflows, DEFAULT_WORKFLOWS);
    writeLocalJson(
      STORAGE_KEYS.workflows,
      current.filter((item) => item.id !== id),
    );
  },
};

