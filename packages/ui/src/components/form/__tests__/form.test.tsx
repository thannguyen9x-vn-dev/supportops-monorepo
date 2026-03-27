import { useEffect, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { render, screen, userEvent } from "../../../test-utils/render";
import { Form } from "../Form";
import { FormField } from "../FormField";

interface Values {
  name: string;
}

function FormHarness({ onSubmit }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const form = useForm<Values>({ defaultValues: { name: "" } });

  return (
    <Form form={form} onSubmit={onSubmit}>
      <button type="submit">Submit</button>
    </Form>
  );
}

function FormFieldHarness() {
  const form = useForm<Values>({ defaultValues: { name: "" } });
  useEffect(() => {
    form.setError("name", { type: "manual", message: "Name is required" });
  }, [form]);

  return (
    <Form form={form} onSubmit={form.handleSubmit(() => {})}>
      <FormField description="Display name" form={form} label="Name" name="name" required>
        {(field) => <input id={field.id} onChange={(event) => field.onChange(event.target.value)} value={field.value ?? ""} />}
      </FormField>
    </Form>
  );
}

describe("Form", () => {
  it("renders and submits callback", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
    render(<FormHarness onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(onSubmit).toHaveBeenCalled();
  });
});

describe("FormField", () => {
  it("renders label, description, required mark, a11y and error", () => {
    render(<FormFieldHarness />);

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
    expect(screen.getByText("Display name")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Name is required");
  });
});
