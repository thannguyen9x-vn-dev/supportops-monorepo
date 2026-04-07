import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";

jest.mock("@/features/notification/hooks/useNotificationCount", () => ({
  useNotificationCount: jest.fn(),
}));

jest.mock("@/features/notification/hooks/useNotifications", () => ({
  useNotifications: jest.fn(() => ({
    filter: "all",
    setFilter: jest.fn(),
    items: [],
    hasMore: false,
    isLoading: false,
    isFetching: false,
    unreadCountInList: 0,
    loadMore: jest.fn(),
    resetPage: jest.fn(),
    markRead: jest.fn(),
    markAllRead: jest.fn(),
    isSaving: false,
  })),
  getNotificationHref: jest.fn(() => null),
}));

import { useNotificationCount } from "@/features/notification/hooks/useNotificationCount";

import { NotificationBell } from "./NotificationBell";

describe("NotificationBell", () => {
  const useNotificationCountMock = useNotificationCount as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders bell icon", () => {
    useNotificationCountMock.mockReturnValue(3);

    render(<NotificationBell />);

    expect(screen.getByRole("button", { name: "ariaLabel" })).toBeInTheDocument();
  });

  it("shows unread badge count", () => {
    useNotificationCountMock.mockReturnValue(7);

    render(<NotificationBell />);

    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("hides badge when count is zero", () => {
    useNotificationCountMock.mockReturnValue(0);

    render(<NotificationBell />);

    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("opens popover when bell is clicked", async () => {
    useNotificationCountMock.mockReturnValue(1);

    render(<NotificationBell />);
    await userEvent.click(screen.getByRole("button", { name: "ariaLabel" }));

    expect(await screen.findByText("title")).toBeInTheDocument();
  });

  it("closes popover when clicking outside", async () => {
    useNotificationCountMock.mockReturnValue(1);

    render(<NotificationBell />);
    await userEvent.click(screen.getByRole("button", { name: "ariaLabel" }));
    expect(await screen.findByText("title")).toBeInTheDocument();

    const backdrop = document.querySelector(".MuiBackdrop-root");
    expect(backdrop).not.toBeNull();
    if (backdrop) {
      await userEvent.click(backdrop);
    }

    await waitFor(() => {
      expect(screen.queryByText("title")).not.toBeInTheDocument();
    });
  });
});
