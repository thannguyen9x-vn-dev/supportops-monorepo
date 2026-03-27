import { act, renderHook } from "@testing-library/react";

jest.mock("@/features/files/services/file.service", () => ({
  fileService: {
    uploadFiles: jest.fn(),
  },
}));

import { fileService } from "@/features/files/services/file.service";
import { useFileUpload } from "../useFileUpload";

describe("useFileUpload", () => {
  const uploadFiles = fileService.uploadFiles as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("uploads file and reports progress", async () => {
    uploadFiles.mockResolvedValue([{ id: "file-1", fileName: "report.pdf" }]);
    const onToast = jest.fn();
    const onProgress = jest.fn();

    const { result } = renderHook(() =>
      useFileUpload({
        t: (key) => key,
        onUploadErrorToast: onToast,
      }),
    );

    const uploaded = await act(async () =>
      result.current.handleFileUpload({ file: new File(["a"], "a.txt") }, onProgress),
    );

    expect(onProgress).toHaveBeenNthCalledWith(1, { progress: 20 });
    expect(onProgress).toHaveBeenNthCalledWith(2, { progress: 100 });
    expect(uploaded?.id).toBe("file-1");
    expect(onToast).not.toHaveBeenCalled();
  });

  it("handles upload error state", () => {
    const onToast = jest.fn();
    const { result } = renderHook(() =>
      useFileUpload({
        t: () => "upload failed",
        onUploadErrorToast: onToast,
      }),
    );

    act(() => {
      result.current.handleUploadError();
    });

    expect(result.current.uploadError).toBe("upload failed");
    expect(onToast).toHaveBeenCalledWith("upload failed");

    act(() => {
      result.current.handleUploadSuccess();
    });

    expect(result.current.uploadError).toBeNull();
  });
});
