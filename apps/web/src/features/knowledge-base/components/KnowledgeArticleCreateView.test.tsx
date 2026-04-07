import { render } from "@testing-library/react";

jest.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../hooks/useKnowledgeBase", () => ({
  useKnowledgeBase: jest.fn(() => ({
    isSaving: false,
    create: jest.fn(),
  })),
}));

import { useAuth } from "@/features/auth/hooks/useAuth";

import { KnowledgeArticleCreateView } from "./KnowledgeArticleCreateView";

describe("KnowledgeArticleCreateView", () => {
  const useAuthMock = useAuth as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects EMPLOYEE away from /knowledge-base/new", () => {
    useAuthMock.mockReturnValue({
      user: { id: "u-1", role: "EMPLOYEE" },
    });

    render(<KnowledgeArticleCreateView />);

    const router = (globalThis as unknown as { mockRouter: { replace: jest.Mock } }).mockRouter;
    expect(router.replace).toHaveBeenCalledWith("/en/access-denied");
  });
});
