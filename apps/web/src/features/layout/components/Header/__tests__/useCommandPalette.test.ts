import { act, renderHook } from "@testing-library/react";

jest.mock("@/features/service-ops/assets/services/asset.service", () => ({
  assetService: {
    list: jest.fn(),
  },
}));

jest.mock("@/features/service-ops/requests/services/request.service", () => ({
  requestService: {
    list: jest.fn(),
  },
}));

import { assetService } from "@/features/service-ops/assets/services/asset.service";
import { requestService } from "@/features/service-ops/requests/services/request.service";

import { useCommandPalette } from "../useCommandPalette";

describe("useCommandPalette", () => {
  const listAssets = assetService.list as jest.Mock;
  const listRequests = requestService.list as jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("toggles open with keyboard shortcut", () => {
    const { result } = renderHook(() => useCommandPalette());

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
    });

    expect(result.current.isOpen).toBe(true);
  });

  it("fetches request results on requests tab", async () => {
    listRequests.mockResolvedValue({ data: [{ id: "req-1" }] });

    const { result } = renderHook(() => useCommandPalette());

    act(() => {
      result.current.open();
      result.current.setQuery("printer");
    });

    await act(async () => {
      jest.advanceTimersByTime(300);
      await Promise.resolve();
    });

    expect(listRequests).toHaveBeenCalledWith({ search: "printer", size: 8 });
    expect(result.current.requestResults[0]?.id).toBe("req-1");
  });

  it("fetches asset results on assets tab", async () => {
    listAssets.mockResolvedValue({ data: [{ id: "asset-1" }] });

    const { result } = renderHook(() => useCommandPalette());

    act(() => {
      result.current.open();
      result.current.setActiveTab("assets");
      result.current.setQuery("laptop");
    });

    await act(async () => {
      jest.advanceTimersByTime(300);
      await Promise.resolve();
    });

    expect(listAssets).toHaveBeenCalledWith({ search: "laptop", size: 8 });
    expect(result.current.assetResults[0]?.id).toBe("asset-1");
  });
});
