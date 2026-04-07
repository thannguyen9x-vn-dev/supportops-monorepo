import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("../../hooks/useImportRequests", () => ({
  useImportRequests: jest.fn(),
}));

import { useImportRequests } from "../../hooks/useImportRequests";

import { ImportRequestModal } from "./ImportRequestModal";

describe("ImportRequestModal", () => {
  const useImportRequestsMock = useImportRequests as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders upload step when state is upload and resets on close", () => {
    const reset = jest.fn();
    useImportRequestsMock.mockReturnValue({
      step: "upload",
      error: null,
      isUploading: false,
      downloadTemplate: jest.fn(),
      uploadFile: jest.fn(),
      preview: null,
      skippedRows: new Set<number>(),
      confirmImport: jest.fn(),
      toggleRow: jest.fn(),
      jobStatus: null,
      reset,
    });

    const onClose = jest.fn();
    render(<ImportRequestModal onClose={onClose} open />);

    expect(screen.getByText("import.upload.title")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "actions.cancel" }));
    expect(reset).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
