import { act, renderHook } from "@testing-library/react";
import { type ReactNode } from "react";
import { FormProvider, type UseFormReturn, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { useFormField } from "../useFormField";

interface TestFormValues {
  name: string;
  email: string;
  age: number;
  active: boolean;
}

function createDefaults(overrides?: Partial<TestFormValues>): TestFormValues {
  return {
    name: "",
    email: "",
    age: 0,
    active: false,
    ...overrides
  };
}

function createWrapper(defaults?: Partial<TestFormValues>) {
  let formApi: UseFormReturn<TestFormValues> | null = null;

  function Wrapper({ children }: { children: ReactNode }) {
    const form = useForm<TestFormValues>({
      defaultValues: createDefaults(defaults),
      mode: "onBlur"
    });
    formApi = form;
    return <FormProvider {...form}>{children}</FormProvider>;
  }

  return {
    Wrapper,
    getForm: () => formApi as UseFormReturn<TestFormValues>
  };
}

describe("useFormField", () => {
  it("returns value, name and id from context", () => {
    const { Wrapper } = createWrapper({ name: "John" });
    const { result } = renderHook(() => useFormField<TestFormValues, "name">("name"), {
      wrapper: Wrapper
    });

    expect(result.current.name).toBe("name");
    expect(result.current.value).toBe("John");
    expect(typeof result.current.id).toBe("string");
  });

  it("updates value on change", () => {
    const { Wrapper, getForm } = createWrapper();
    const { result } = renderHook(() => useFormField<TestFormValues, "name">("name"), {
      wrapper: Wrapper
    });

    act(() => {
      result.current.onChange("Alice");
    });

    expect(getForm().getValues("name")).toBe("Alice");
  });

  it("exposes onBlur handler and can be called safely", () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useFormField<TestFormValues, "name">("name"), {
      wrapper: Wrapper
    });

    expect(typeof result.current.onBlur).toBe("function");

    act(() => {
      result.current.onBlur();
    });
  });

  it("reflects manual error from form state", () => {
    const { Wrapper, getForm } = createWrapper();
    const { result } = renderHook(() => useFormField<TestFormValues, "name">("name"), {
      wrapper: Wrapper
    });

    act(() => {
      getForm().setError("name", { type: "manual", message: "Required" });
    });

    expect(result.current.error).toBe("Required");
    expect(result.current["aria-invalid"]).toBe(true);
  });

  it("does not affect other fields when one changes", () => {
    const { Wrapper } = createWrapper({ name: "John", email: "john@test.com" });
    const { result } = renderHook(
      () => ({
        nameField: useFormField<TestFormValues, "name">("name"),
        emailField: useFormField<TestFormValues, "email">("email")
      }),
      { wrapper: Wrapper }
    );

    act(() => {
      result.current.nameField.onChange("Jane");
    });

    expect(result.current.nameField.value).toBe("Jane");
    expect(result.current.emailField.value).toBe("john@test.com");
  });
});
