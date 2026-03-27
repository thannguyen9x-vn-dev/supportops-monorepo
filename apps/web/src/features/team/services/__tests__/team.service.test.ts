import { apiClient } from "@/lib/api";

import { teamService } from "../team.service";

jest.mock("@/lib/api", () => ({
  ENDPOINTS: {
    USERS: {
      LIST: "/users",
      INVITE: "/users/invite",
      ROLE: (id: string) => `/users/${id}/role`,
      DEPARTMENT: (id: string) => `/users/${id}/department`,
      DEACTIVATE: (id: string) => `/users/${id}/deactivate`,
      REACTIVATE: (id: string) => `/users/${id}/reactivate`,
    },
  },
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

describe("teamService", () => {
  const mockGet = apiClient.get as jest.Mock;
  const mockPost = apiClient.post as jest.Mock;
  const mockPatch = apiClient.patch as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: [] });
    mockPost.mockResolvedValue({ data: {} });
    mockPatch.mockResolvedValue({ data: null });
  });

  it("lists users", async () => {
    await teamService.listUsers();

    expect(mockGet).toHaveBeenCalledWith("/users");
  });

  it("invites user", async () => {
    await teamService.inviteUser({ email: "new.user@example.com", roleCode: "TECHNICIAN" });

    expect(mockPost).toHaveBeenCalledWith("/users/invite", {
      email: "new.user@example.com",
      roleCode: "TECHNICIAN",
    });
  });

  it("updates role and department", async () => {
    await teamService.updateRole("user-2", "OPS_COORDINATOR");
    await teamService.updateDepartment("user-2", "IT");

    expect(mockPatch).toHaveBeenNthCalledWith(1, "/users/user-2/role", { roleCode: "OPS_COORDINATOR" });
    expect(mockPatch).toHaveBeenNthCalledWith(2, "/users/user-2/department", { department: "IT" });
  });

  it("deactivates/reactivates user with optional reason", async () => {
    await teamService.deactivateUser("user-2");
    await teamService.reactivateUser("user-2", "Access restored");

    expect(mockPatch).toHaveBeenNthCalledWith(1, "/users/user-2/deactivate", {});
    expect(mockPatch).toHaveBeenNthCalledWith(2, "/users/user-2/reactivate", { reason: "Access restored" });
  });
});
