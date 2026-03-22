import { ApiError, apiClient } from "@/lib/api";

import { serviceOpsSettingsService } from "./service-ops-settings.service";

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
      SERVICE_TYPES: { LIST: "/service-types", DETAIL: (id: string) => `/service-types/${id}` },
      SLA_POLICIES: { LIST: "/sla-policies", DETAIL: (id: string) => `/sla-policies/${id}` },
      WORKFLOW_TRANSITIONS: {
        LIST: "/workflow-transitions",
        DETAIL: (id: string) => `/workflow-transitions/${id}`,
      },
    },
    ApiError: MockApiError,
    apiClient: {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    },
  };
});

describe("serviceOpsSettingsService", () => {
  const mockGet = apiClient.get as jest.Mock;
  const mockPost = apiClient.post as jest.Mock;
  const mockPatch = apiClient.patch as jest.Mock;
  const mockDelete = apiClient.delete as jest.Mock;

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

  it("creates service type via API with normalized values", async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        id: "st-1",
        code: "HVAC",
        name: "HVAC Main",
        isActive: true,
      },
    });

    const saved = await serviceOpsSettingsService.saveServiceType({
      code: " hvac ",
      name: " HVAC Main ",
      isActive: true,
    });

    expect(mockPost).toHaveBeenCalledWith("/service-types", {
      code: "HVAC",
      name: "HVAC Main",
      description: undefined,
      isActive: true,
    });
    expect(saved.code).toBe("HVAC");
    expect(saved.name).toBe("HVAC Main");
  });

  it("updates workflow transition via API", async () => {
    mockPatch.mockResolvedValueOnce({
      data: {
        id: "wf-1",
        serviceTypeCode: "HVAC",
        fromStatus: "SUBMITTED",
        toStatus: "TRIAGE",
        allowedRoles: ["TENANT_ADMIN"],
      },
    });

    const updated = await serviceOpsSettingsService.saveWorkflowTransition({
      id: "wf-1",
      serviceTypeCode: "hvac",
      fromStatus: "submitted",
      toStatus: "triage",
      allowedRoles: ["tenant_admin"],
    });

    expect(mockPatch).toHaveBeenCalled();
    expect(updated.allowedRoles).toEqual(["TENANT_ADMIN"]);
  });

  it("deletes workflow transition via API", async () => {
    mockDelete.mockResolvedValueOnce({ data: null });

    await serviceOpsSettingsService.deleteWorkflowTransition("wf-1");

    expect(mockDelete).toHaveBeenCalledWith("/workflow-transitions/wf-1");
  });
});
