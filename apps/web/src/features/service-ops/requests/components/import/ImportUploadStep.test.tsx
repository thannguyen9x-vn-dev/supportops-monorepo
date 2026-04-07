import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { ImportUploadStep } from "./ImportUploadStep";

function pickFileInput(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector<HTMLInputElement>("input[type='file']");
  if (!input) {
    throw new Error("file input not found");
  }
  return input;
}

describe("ImportUploadStep", () => {
  beforeEach(() => {
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: jest.fn(() => "blob:test") });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: jest.fn() });
  });

  it("shows client-side error for file larger than 5MB", async () => {
    const onUpload = jest.fn().mockResolvedValue(undefined);
    const { container } = render(
      <ImportUploadStep error={null} isUploading={false} onDownloadTemplate={jest.fn()} onUpload={onUpload} />,
    );

    const largeFile = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.csv", { type: "text/csv" });
    fireEvent.change(pickFileInput(container), { target: { files: [largeFile] } });

    await waitFor(() => expect(screen.getByText("import.error.fileTooLarge")).toBeInTheDocument());
    expect(onUpload).not.toHaveBeenCalled();
  });

  it("accepts .xlsx file and calls upload", async () => {
    const onUpload = jest.fn().mockResolvedValue(undefined);
    const { container } = render(
      <ImportUploadStep error={null} isUploading={false} onDownloadTemplate={jest.fn()} onUpload={onUpload} />,
    );

    const file = new File(["xlsx-data"], "import.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    fireEvent.change(pickFileInput(container), { target: { files: [file] } });

    await waitFor(() => expect(onUpload).toHaveBeenCalledWith(file));
  });

  it("rejects unsupported format", async () => {
    const onUpload = jest.fn().mockResolvedValue(undefined);
    const { container } = render(
      <ImportUploadStep error={null} isUploading={false} onDownloadTemplate={jest.fn()} onUpload={onUpload} />,
    );

    const file = new File(["text"], "import.txt", { type: "text/plain" });
    fireEvent.change(pickFileInput(container), { target: { files: [file] } });

    await waitFor(() => expect(screen.getByText("import.error.invalidFormat")).toBeInTheDocument());
    expect(onUpload).not.toHaveBeenCalled();
  });
});
