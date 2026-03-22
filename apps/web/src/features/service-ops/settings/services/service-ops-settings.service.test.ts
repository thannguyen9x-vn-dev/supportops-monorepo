import { serviceOpsSettingsService } from "./service-ops-settings.service";
import { ApiError, apiClient } from "@/lib/api";

jest.mock("@/lib/api", () => {
  class MockApiError extends Error {
    public status: number;
    public error: { code: string; message: string; traceId?: string };

    constructor(status: number, error: { code: string; message: string; traceId?: string }) {
      super(error.message);
      this.status = status;
      this.error = error;
    }
  }

  return {
    ENDPOINTS: {
      SLA: { POLICIES: "/sla/policies" },
      SERVICE_TYPES: { LIST: "/service-types" },
    },
    ApiError: MockApiError,
    apiClient: {
      get: jest.fn(),
    },
  };
});

describe("serviceOpsSettingsService", () => {
  const mockGet = apiClient.get as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  it("falls back to local/default SLA policies when API is unavailable", async () => {
    mockGet.mockRejectedValueOnce(new Error("network down"));

    const policies = await serviceOpsSettingsService.listSlaPolicies();

    expect(policies.length).toBeGreaterThan(0);
    expect(policies[0]).toHaveProperty("serviceTypeCode");
  });

  it("throws permission error for SLA list when API returns 403", async () => {
    mockGet.mockRejectedValueOnce(new ApiError(403, { code: "FORBIDDEN", message: "forbidden" }));

    await expect(serviceOpsSettingsService.listSlaPolicies()).rejects.toBeInstanceOf(ApiError);
  });

  it("saves service type with normalized code and trimmed values", async () => {
    const saved = await serviceOpsSettingsService.saveServiceType({
      id: "service-type-test",
      code: " hvac ",
      name: " HVAC Main ",
      isActive: true,
      workflowName: "  Default ",
      slaPolicyId: " policy-hvac ",
    });

    expect(saved.code).toBe("HVAC");
    expect(saved.name).toBe("HVAC Main");
    expect(saved.workflowName).toBe("Default");
    expect(saved.slaPolicyId).toBe("policy-hvac");
  });

  it("deletes workflow transition from local storage", async () => {
    await serviceOpsSettingsService.saveWorkflowTransition({
      id: "workflow-transition-test",
      serviceTypeCode: "hvac",
      fromStatus: "submitted",
      toStatus: "triage",
      allowedRoles: ["tenant_admin"],
    });

    await serviceOpsSettingsService.deleteWorkflowTransition("workflow-transition-test");
    const items = await serviceOpsSettingsService.listWorkflowTransitions();

    expect(items.some((item) => item.id === "workflow-transition-test")).toBe(false);
  });
});

