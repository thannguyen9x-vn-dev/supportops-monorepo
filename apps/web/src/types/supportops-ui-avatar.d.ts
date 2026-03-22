declare module "@supportops/ui-avatar" {
  import type { ComponentType } from "react";
  import type { SxProps, Theme } from "@mui/material/styles";
  import type { AvatarProps as MuiAvatarProps } from "@mui/material/Avatar";

  export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  export type AvatarVariant = "circular" | "rounded" | "square";
  export type AvatarRingShape = "circular" | "rounded";
  export type AvatarRingColor = "default" | "active" | "inactive" | string;
  export type AvatarRingVariant = "neutral" | "status";
  export type AvatarStatus = "active" | "inactive";

  export interface AvatarProps {
    src?: string | null;
    alt?: string;
    name?: string;
    size?: AvatarSize;
    variant?: AvatarVariant;
    dimension?: number;
    className?: string;
    sx?: SxProps<Theme>;
    imgProps?: MuiAvatarProps["imgProps"];
    ring?: boolean;
    ringVariant?: AvatarRingVariant;
    status?: AvatarStatus;
    ringShape?: AvatarRingShape;
    ringColor?: AvatarRingColor;
    ringWidth?: number;
    ringOffset?: number;
  }

  export const Avatar: ComponentType<AvatarProps>;
}
