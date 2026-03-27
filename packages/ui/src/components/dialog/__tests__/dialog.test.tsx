import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { render, screen, userEvent, waitFor } from "../../../test-utils/render";
import { AlertDialog } from "../AlertDialog";
import { ConfirmDialog } from "../ConfirmDialog";
import { Dialog } from "../Dialog";
import { FormDialog } from "../FormDialog";

function HookDialogHarness() {
  const [open, setOpen] = useState(true);
  return (
    <Dialog dialog={{ isOpen: open, close: () => setOpen(false), open: () => setOpen(true), toggle: vi.fn(), dialogProps: {}, triggerProps: {} }} title="Hook title">
      Body
    </Dialog>
  );
}

describe("Dialog", () => {
  it("renders default dialog with role and closes by backdrop and keyboard", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Dialog open onClose={onClose} showCloseButton title="Dialog title">
        Content
      </Dialog>
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Dialog title")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Close dialog" }));
    expect(onClose).toHaveBeenCalledTimes(2);

    await user.click(screen.getByRole("dialog"));
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("supports hook-based props", async () => {
    const user = userEvent.setup();
    render(<HookDialogHarness />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});

describe("AlertDialog", () => {
  it("renders legacy props and close callback", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <AlertDialog closeLabel="Close" description="Message" onClose={onClose} open title="Alert" />
    );

    expect(screen.getByText("Alert")).toBeInTheDocument();
    expect(screen.getByText("Message")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("renders hook severity variant", () => {
    render(
      <AlertDialog
        dialog={{ isOpen: true, close: vi.fn(), open: vi.fn(), toggle: vi.fn(), dialogProps: {}, triggerProps: {} }}
        message="Hook message"
        severity="error"
        title="Hook alert"
      />
    );

    expect(screen.getByText("Hook alert")).toBeInTheDocument();
    expect(screen.getByText("Hook message")).toBeInTheDocument();
    expect(screen.getByText("Hook alert").parentElement?.querySelector("span")?.className).toContain("bg-red-500");
  });
});

describe("ConfirmDialog", () => {
  it("calls legacy confirm and close", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    render(
      <ConfirmDialog
        cancelLabel="Cancel"
        confirmLabel="Confirm"
        description="Danger"
        onClose={onClose}
        onConfirm={onConfirm}
        open
        title="Delete"
      />
    );

    await user.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalled();
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("supports hook mode cancel and disabled confirm", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ConfirmDialog
        cancelLabel="Back"
        confirmDisabled
        confirmLabel="Do it"
        dialog={{ isOpen: true, close: onClose, open: vi.fn(), toggle: vi.fn(), dialogProps: {}, triggerProps: {} }}
        message="Question"
        onCancel={onCancel}
        onConfirm={onConfirm}
        title="Confirm"
      />
    );

    expect(screen.getByRole("button", { name: "Do it" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(onCancel).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});

describe("FormDialog", () => {
  it("submits and closes", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSubmit = vi.fn(async () => Promise.resolve());

    render(
      <FormDialog
        dialog={{ isOpen: true, close: onClose, open: vi.fn(), toggle: vi.fn(), dialogProps: {}, triggerProps: {} }}
        onSubmit={onSubmit}
        title="Edit"
      >
        <div>Form body</div>
      </FormDialog>
    );

    expect(screen.getByText("Form body")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("supports formId submit mode and cancel action", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <FormDialog
        cancelLabel="Dismiss"
        dialog={{ isOpen: true, close: onClose, open: vi.fn(), toggle: vi.fn(), dialogProps: {}, triggerProps: {} }}
        formId="my-form"
        submitLabel="Submit"
        title="Edit"
      >
        <form id="my-form" />
      </FormDialog>
    );

    const submit = screen.getByRole("button", { name: "Submit" });
    expect(submit).toHaveAttribute("type", "submit");
    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onClose).toHaveBeenCalled();
  });
});
