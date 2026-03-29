import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

jest.mock("../services/knowledge-base.service", () => ({
  knowledgeBaseService: {
    search: jest.fn(),
  },
}));

import { knowledgeBaseService } from "../services/knowledge-base.service";
import { useKnowledgeBasePicker } from "./useKnowledgeBasePicker";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  function QueryWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  QueryWrapper.displayName = "QueryWrapper";
  return QueryWrapper;
}

describe("useKnowledgeBasePicker", () => {
  const searchMock = knowledgeBaseService.search as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    searchMock.mockResolvedValue([]);
  });

  it("does not call API when query has less than 2 chars", async () => {
    const { result } = renderHook(() => useKnowledgeBasePicker(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.setQuery("a");
    });

    await waitFor(() => {
      expect(searchMock).not.toHaveBeenCalled();
    });
  });

  it("calls API when query has at least 2 chars", async () => {
    const { result } = renderHook(() => useKnowledgeBasePicker(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.setQuery("kb");
    });

    await waitFor(() => {
      expect(searchMock).toHaveBeenCalledWith("kb");
    });
  });
});
