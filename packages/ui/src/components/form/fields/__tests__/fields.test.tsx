import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { render, screen, userEvent } from "../../../../test-utils/render";
import { Form } from "../../Form";
import { CheckboxField } from "../CheckboxField";
import { ComboboxField } from "../ComboboxField";
import { DateField } from "../DateField";
import { FileField } from "../FileField";
import { NumberField } from "../NumberField";
import { RadioGroupField } from "../RadioGroupField";
import { SelectField } from "../SelectField";
import { SwitchField } from "../SwitchField";
import { TextField } from "../TextField";
import { TextareaField } from "../TextareaField";

interface Values {
  text: string;
  number?: number;
  textarea: string;
  select: string;
  radio: string;
  check: boolean;
  toggle: boolean;
  date: string;
  combo: string;
  file: File | null;
}

function FieldsHarness({ onSubmit }: { onSubmit: (values: Values) => void }) {
  const form = useForm<Values>({
    defaultValues: {
      text: "",
      number: undefined,
      textarea: "",
      select: "",
      radio: "",
      check: false,
      toggle: false,
      date: "",
      combo: "",
      file: null
    }
  });

  return (
    <Form form={form} onSubmit={form.handleSubmit(onSubmit)}>
      <TextField form={form} label="Text" name="text" placeholder="type" />
      <NumberField form={form} label="Amount" name="number" prefix="$" suffix="USD" />
      <TextareaField form={form} label="Description" maxLength={20} name="textarea" showCount />
      <SelectField
        form={form}
        label="Priority"
        name="select"
        options={[
          { label: "High", value: "high" },
          { label: "Low", value: "low" }
        ]}
        placeholder="Select"
      />
      <RadioGroupField
        form={form}
        label="Channel"
        name="radio"
        options={[
          { label: "Email", value: "email" },
          { label: "Chat", value: "chat" }
        ]}
        row
      />
      <CheckboxField form={form} label="Accept" name="check" />
      <SwitchField form={form} label="Enabled" name="toggle" />
      <DateField form={form} label="Due date" name="date" type="datetime-local" />
      <ComboboxField
        form={form}
        label="Category"
        name="combo"
        options={[
          { label: "Bug", value: "bug" },
          { label: "Task", value: "task" }
        ]}
      />
      <FileField form={form} label="Attachment" maxSize={1000000} name="file" />
      <button type="submit">Save form</button>
    </Form>
  );
}

function DisabledFieldsHarness() {
  const form = useForm<Values>({
    defaultValues: {
      text: "",
      select: "",
      check: false,
      toggle: false
    } as Values
  });

  return (
    <Form form={form} onSubmit={form.handleSubmit(() => {})}>
      <TextField disabled form={form} label="Text" name="text" type="email" />
      <SelectField
        disabled
        form={form}
        label="Priority"
        name="select"
        options={[{ label: "High", value: "high" }]}
      />
      <CheckboxField disabled form={form} label="Accept" name="check" />
      <SwitchField disabled form={form} label="Enabled" name="toggle" />
    </Form>
  );
}

describe("Form fields", () => {
  it("renders default state, supports interactions and submits values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<FieldsHarness onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Text"), "hello");
    await user.type(screen.getByLabelText("Amount"), "42");
    await user.type(screen.getByLabelText("Description"), "long text");
    expect(screen.getByText("9/20")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Priority"), "high");
    await user.click(screen.getByLabelText("Email"));
    await user.click(screen.getByLabelText("Accept"));
    await user.click(screen.getByRole("button", { name: "Enabled" }));

    const dateInput = screen.getByLabelText("Due date");
    await user.type(dateInput, "2026-03-27T08:30");

    const comboInput = screen.getByLabelText("Category");
    await user.click(comboInput);
    await user.click(screen.getByRole("option", { name: "Bug" }));

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["demo"], "demo.txt", { type: "text/plain" });
    await user.upload(fileInput, file);
    expect(screen.getByText(/demo.txt/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Save form" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        text: "hello",
        number: 42,
        textarea: "long text",
        select: "high",
        radio: "email",
        check: true,
        toggle: true,
        combo: "bug"
      }),
      expect.anything()
    );
  });

  it("renders disabled/variant states", () => {
    render(<DisabledFieldsHarness />);

    expect(screen.getByLabelText("Text")).toBeDisabled();
    expect(screen.getByLabelText("Priority")).toBeDisabled();
    expect(screen.getByLabelText("Accept")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Enabled" })).toBeDisabled();
  });
});
