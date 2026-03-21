import { requestService } from "./request.service";
import { apiClient } from "@/lib/api";

jest.mock("@/lib/api", () => {
  const ENDPOINTS = {
    REQUESTS: {
      LIST: "/requests",
      ASSIGNEES: "/requests/assignees",
      CREATE: "/requests",
      DETAIL: (id: string) => `/requests/${id}`,
      STATUS: (id: string) => `/requests/${id}/status`,
      COMMENTS: (id: string) => `/requests/${id}/comments`,
      WORK_LOG: (id: string) => `/requests/${id}/work-log`,
      ASSIGN: (id: string) => `/requests/${id}/assign`,
    },
  } as const;

  return {
    ENDPOINTS,
    apiClient: {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
    },
  };
});

describe("requestService", () => {
  const mockGet = apiClient.get as jest.Mock;
  const mockPost = apiClient.post as jest.Mock;
  const mockPatch = apiClient.patch as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: {} });
    mockPost.mockResolvedValue({ data: {} });
    mockPatch.mockResolvedValue({ data: {} });
  });

  it("calls list endpoint with default pagination", async () => {
    await requestService.list();

    expect(mockGet).toHaveBeenCalledWith("/requests", {
      params: {
        page: 1,
        size: 20,
        search: undefined,
        status: undefined,
      },
    });
  });

  it("calls detail endpoint", async () => {
    await requestService.detail("req-1");
    expect(mockGet).toHaveBeenCalledWith("/requests/req-1");
  });

  it("calls assignees endpoint", async () => {
    await requestService.listAssignees();
    expect(mockGet).toHaveBeenCalledWith("/requests/assignees", { cache: "no-store" });
  });

  it("calls status endpoint with payload", async () => {
    await requestService.updateStatus("req-1", { status: "IN_PROGRESS" });
    expect(mockPatch).toHaveBeenCalledWith("/requests/req-1/status", { status: "IN_PROGRESS" });
  });

  it("calls comments endpoint with payload", async () => {
    await requestService.addComment("req-1", { body: "hello", visibility: "PUBLIC" });
    expect(mockPost).toHaveBeenCalledWith("/requests/req-1/comments", { body: "hello", visibility: "PUBLIC" });
  });

  it("calls work-log endpoint with payload", async () => {
    await requestService.addWorkLog("req-1", { content: "investigated", minutesSpent: 30 });
    expect(mockPost).toHaveBeenCalledWith("/requests/req-1/work-log", {
      content: "investigated",
      minutesSpent: 30,
    });
  });

  it("calls assign endpoint with payload", async () => {
    await requestService.assign("req-1", { assigneeId: "user-1" });
    expect(mockPatch).toHaveBeenCalledWith("/requests/req-1/assign", { assigneeId: "user-1" });
  });
});
