import type { ReactNode } from "react";
import type { UserRole } from "@supportops/types";

export type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
  badge?: number;
  children?: NavItem[];
  allowedRoles?: UserRole[];
};

export type NavGroup = {
  groupLabel: string;
  items: NavItem[];
};
