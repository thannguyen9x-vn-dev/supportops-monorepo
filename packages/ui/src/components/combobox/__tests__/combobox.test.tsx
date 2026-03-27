import { describe, expect, it, vi } from "vitest";

import { render, screen, userEvent } from "../../../test-utils/render";
import { Combobox } from "../Combobox";
import { MultiCombobox } from "../MultiCombobox";

const options = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry", disabled: true }
];

describe("Combobox", () => {
  it("renders default combobox and supports keyboard interaction", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onBlur = vi.fn();

    render(
      <Combobox
        onBlur={onBlur}
        onChange={onChange}
        options={options}
        placeholder="Choose fruit"
      />
    );

    const input = screen.getByRole("combobox", { name: "" });
    expect(input).toHaveAttribute("placeholder", "Choose fruit");

    await user.click(input);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{ArrowDown}{Enter}");
    expect(onChange).toHaveBeenCalledWith("apple");

    await user.keyboard("{Tab}");
    expect(onBlur).toHaveBeenCalled();
  });

  it("renders disabled and error state", () => {
    render(
      <Combobox
        disabled
        error="Required"
        onChange={vi.fn()}
        options={options}
      />
    );

    const input = screen.getByRole("combobox");
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("aria-expanded", "false");
  });
});

describe("MultiCombobox", () => {
  it("adds and removes selected values via interactions", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<MultiCombobox onChange={onChange} options={options} value={["banana"]} />);

    expect(screen.getByRole("button", { name: /banana/i })).toBeInTheDocument();

    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.click(screen.getByRole("option", { name: /apple/i }));
    expect(onChange).toHaveBeenCalledWith(["banana", "apple"]);

    await user.click(screen.getByRole("button", { name: /banana/i }));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("prevents duplicate selection and supports disabled state", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<MultiCombobox disabled onChange={onChange} options={options} value={["apple"]} />);

    expect(screen.getByRole("combobox")).toBeDisabled();
    const chipButton = screen.getByRole("button", { name: /apple/i });
    expect(chipButton).toBeDisabled();

    await user.click(chipButton);
    expect(onChange).not.toHaveBeenCalled();
  });
});
