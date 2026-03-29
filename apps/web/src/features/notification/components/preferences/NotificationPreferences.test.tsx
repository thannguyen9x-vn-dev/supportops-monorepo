import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { NotificationEventType } from "@supportops/types";

jest.mock("@/features/notification/hooks/useNotificationPreferences", () => ({
  useNotificationPreferences: jest.fn(),
}));

import { useNotificationPreferences } from "@/features/notification/hooks/useNotificationPreferences";

import { NotificationPreferencesView } from "./NotificationPreferencesView";

const basePreferences = [
  { eventType: NotificationEventType.REQUEST_ASSIGNED, inApp: true, email: true },
  { eventType: NotificationEventType.REQUEST_STATUS_CHANGED, inApp: true, email: false },
  { eventType: NotificationEventType.REQUEST_COMMENTED, inApp: true, email: true },
  { eventType: NotificationEventType.REQUEST_MENTIONED, inApp: true, email: true },
  { eventType: NotificationEventType.REQUEST_CREATED, inApp: false, email: true },
  { eventType: NotificationEventType.SLA_NEAR_BREACH_RESPONSE, inApp: true, email: true },
  { eventType: NotificationEventType.SLA_NEAR_BREACH_RESOLUTION, inApp: true, email: true },
];

describe("NotificationPreferencesView", () => {
  const hookMock = useNotificationPreferences as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders 7 rows", () => {
    hookMock.mockReturnValue({
      preferences: basePreferences,
      isLoading: false,
      isSaving: false,
      setEventChannel: jest.fn(),
      save: jest.fn(),
    });

    render(<NotificationPreferencesView />);

    expect(screen.getAllByRole("switch")).toHaveLength(14);
  });

  it("calls toggle for inApp switch", async () => {
    const setEventChannel = jest.fn();
    hookMock.mockReturnValue({
      preferences: basePreferences,
      isLoading: false,
      isSaving: false,
      setEventChannel,
      save: jest.fn(),
    });

    render(<NotificationPreferencesView />);
    const checkboxes = screen.getAllByRole("switch");
    const firstSwitch = checkboxes[0];
    expect(firstSwitch).toBeDefined();
    if (!firstSwitch) return;
    await userEvent.click(firstSwitch);

    expect(setEventChannel).toHaveBeenCalled();
  });

  it("calls toggle for email switch", async () => {
    const setEventChannel = jest.fn();
    hookMock.mockReturnValue({
      preferences: basePreferences,
      isLoading: false,
      isSaving: false,
      setEventChannel,
      save: jest.fn(),
    });

    render(<NotificationPreferencesView />);
    const checkboxes = screen.getAllByRole("switch");
    const secondSwitch = checkboxes[1];
    expect(secondSwitch).toBeDefined();
    if (!secondSwitch) return;
    await userEvent.click(secondSwitch);

    expect(setEventChannel).toHaveBeenCalled();
  });

  it("calls save on save button click", async () => {
    const save = jest.fn();
    hookMock.mockReturnValue({
      preferences: basePreferences,
      isLoading: false,
      isSaving: false,
      setEventChannel: jest.fn(),
      save,
    });

    render(<NotificationPreferencesView />);
    await userEvent.click(screen.getByRole("button", { name: "save" }));

    expect(save).toHaveBeenCalled();
  });

  it("shows loading state", () => {
    hookMock.mockReturnValue({
      preferences: [],
      isLoading: true,
      isSaving: false,
      setEventChannel: jest.fn(),
      save: jest.fn(),
    });

    render(<NotificationPreferencesView />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
