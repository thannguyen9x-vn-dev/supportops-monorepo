import { render, screen } from "@testing-library/react";

jest.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("./ImportRequestModal", () => ({
  ImportRequestModal: ({ open }: { open: boolean }) => (open ? <div data-testid="import-modal" /> : null),
}));

import { useAuth } from "@/features/auth/hooks/useAuth";

import { ImportRequestButton } from "./ImportRequestButton";

describe("ImportRequestButton", () => {
  const useAuthMock = useAuth as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders button for roles with request.import permission", () => {
    useAuthMock.mockReturnValue({ user: { id: "u1", role: "OPS_COORDINATOR" } });

    render(<ImportRequestButton />);

    expect(screen.getByRole("button", { name: "import.button" })).toBeInTheDocument();
  });

  it("does not render button for employee", () => {
    useAuthMock.mockReturnValue({ user: { id: "u1", role: "EMPLOYEE" } });

    render(<ImportRequestButton />);

    expect(screen.queryByRole("button", { name: "import.button" })).not.toBeInTheDocument();
  });
});
