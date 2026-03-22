export interface ServiceTypeSetting {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  workflowName?: string;
  slaPolicyId?: string;
}

export interface SlaPolicySetting {
  id: string;
  serviceTypeCode: string;
  responseMinutes: number;
  resolutionMinutes: number;
  escalationAfterMinutes: number;
}

export interface WorkflowTransitionSetting {
  id: string;
  serviceTypeCode: string;
  fromStatus: string;
  toStatus: string;
  allowedRoles: string[];
}

export type SettingsLoadState = "loading" | "empty" | "error" | "success" | "permissionDenied";

