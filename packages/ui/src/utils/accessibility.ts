export interface AriaProps {
  role?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-expanded"?: boolean;
  "aria-haspopup"?: boolean | "dialog" | "menu" | "listbox";
  "aria-controls"?: string;
  "aria-selected"?: boolean;
  "aria-disabled"?: boolean;
  "aria-invalid"?: boolean;
  tabIndex?: number;
}

export function getAriaProps(overrides: Partial<AriaProps> = {}): AriaProps {
  return Object.fromEntries(
    Object.entries(overrides).filter(([, value]) => value !== undefined)
  ) as AriaProps;
}

export function getFocusTrapProps(containerId: string) {
  return {
    role: "dialog" as const,
    "aria-modal": true,
    tabIndex: -1,
    id: containerId
  };
}

export function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
