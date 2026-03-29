import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { NotificationEventType } from "@supportops/types";

jest.mock("@/features/common/toast/useToast", () => ({
  useToast: jest.fn(() => ({ success: jest.fn() })),
}));

jest.mock("../services/notification.service", () => ({
  notificationPreferencesService: {
    get: jest.fn(),
    update: jest.fn(),
  },
}));

import { useToast } from "@/features/common/toast/useToast";

import { notificationPreferencesService } from "../services/notification.service";
import { useNotificationPreferences } from "./useNotificationPreferences";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  function QueryWrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  QueryWrapper.displayName = "QueryWrapper";
  return QueryWrapper;
}

describe("useNotificationPreferences", () => {
  const getMock = notificationPreferencesService.get as jest.Mock;
  const updateMock = notificationPreferencesService.update as jest.Mock;
  const useToastMock = useToast as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    getMock.mockResolvedValue([
      {
        eventType: NotificationEventType.REQUEST_ASSIGNED,
        inApp: true,
        email: true,
      },
    ]);
    updateMock.mockResolvedValue([
      {
        eventType: NotificationEventType.REQUEST_ASSIGNED,
        inApp: false,
        email: true,
      },
    ]);
  });

  it("loads preferences and saves update with success toast", async () => {
    const toast = { success: jest.fn() };
    useToastMock.mockReturnValue(toast);

    const { result } = renderHook(() => useNotificationPreferences("saved"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setEventChannel(NotificationEventType.REQUEST_ASSIGNED, "inApp", false);
    });

    await act(async () => {
      await result.current.save();
    });

    expect(updateMock).toHaveBeenCalledWith([
      {
        eventType: NotificationEventType.REQUEST_ASSIGNED,
        inApp: false,
        email: true,
      },
    ]);
    expect(toast.success).toHaveBeenCalledWith("saved");
  });
});
