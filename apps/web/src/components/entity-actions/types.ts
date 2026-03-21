import type { ReactNode } from "react";

export interface EntityAction {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  /** Renders a divider above this item */
  divider?: boolean;
  /** "error" renders label and icon in red — use for destructive actions */
  color?: "default" | "error";
}
