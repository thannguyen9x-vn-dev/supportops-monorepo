import type { UserRole } from "@supportops/types";

export function canUseAiAssistant(role?: UserRole): boolean {
  return role === "TENANT_ADMIN";
}
