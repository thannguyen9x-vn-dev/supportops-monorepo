import { useState, useEffect, useMemo } from 'react';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import MuiAvatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import { jsxs, jsx } from 'react/jsx-runtime';

// src/Avatar.tsx

// src/Avatar.constants.ts
var AVATAR_SIZE_MAP = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
  "2xl": 120
};
var AVATAR_FONT_RATIO = 0.38;
var AVATAR_COLORS = [
  "var(--mui-palette-primary-main)",
  "var(--mui-palette-success-main)",
  "var(--mui-palette-error-main)",
  "var(--mui-palette-info-main)",
  "var(--mui-palette-warning-main)",
  "var(--mui-palette-secondary-main)",
  "var(--mui-palette-primary-dark)",
  "var(--mui-palette-success-dark)",
  "var(--mui-palette-info-dark)",
  "var(--mui-palette-error-dark)"
];
function getColorFromName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length] ?? "var(--mui-palette-primary-main)";
}
function getInitials(name, maxChars = 2) {
  return name.split(/\s+/).filter(Boolean).slice(0, maxChars).map((part) => part[0]?.toUpperCase() ?? "").join("");
}
function Avatar({
  src,
  alt,
  name,
  size = "md",
  variant = "circular",
  dimension,
  className,
  sx,
  imgProps,
  ring = false,
  ringVariant = "neutral",
  status,
  ringShape,
  ringColor = "default",
  ringWidth = 2,
  ringOffset = 2
}) {
  const [hasImageError, setHasImageError] = useState(false);
  useEffect(() => {
    setHasImageError(false);
  }, [src]);
  const px = dimension ?? AVATAR_SIZE_MAP[size];
  const fontSize = Math.round(px * AVATAR_FONT_RATIO);
  const showImage = Boolean(src) && !hasImageError;
  const initials = useMemo(() => {
    if (!name) {
      return void 0;
    }
    return getInitials(name);
  }, [name]);
  const backgroundColor = useMemo(() => {
    if (!name) {
      return void 0;
    }
    return getColorFromName(name);
  }, [name]);
  const handleError = (event) => {
    setHasImageError(true);
    imgProps?.onError?.(event);
  };
  const resolvedRingColor = useMemo(() => {
    if (ringVariant === "status") {
      if (status === "active") return "var(--mui-palette-success-main)";
      if (status === "inactive") return "var(--mui-palette-grey-400, var(--mui-palette-divider))";
      return "var(--mui-palette-divider)";
    }
    if (ringColor === "active") return "var(--mui-palette-success-main)";
    if (ringColor === "inactive") return "var(--mui-palette-grey-400, var(--mui-palette-divider))";
    if (ringColor === "default") return "var(--mui-palette-divider)";
    return ringColor;
  }, [ringColor, ringVariant, status]);
  const resolvedRingShape = ringShape ?? (variant === "circular" ? "circular" : "rounded");
  const resolvedRingRadius = resolvedRingShape === "circular" ? "50%" : `${Math.max(8, Math.round(px * 0.2))}px`;
  const ringLayer = Math.max(0, ringWidth + ringOffset);
  const outerSize = px + ringLayer * 2;
  const avatarNode = /* @__PURE__ */ jsxs(
    MuiAvatar,
    {
      alt: alt ?? name,
      className,
      imgProps: showImage ? { ...imgProps, onError: handleError } : void 0,
      src: showImage ? src ?? void 0 : void 0,
      variant,
      sx: {
        width: px,
        height: px,
        fontSize,
        ...!showImage && backgroundColor ? { bgcolor: backgroundColor } : {},
        ...sx
      },
      children: [
        !showImage && initials ? initials : null,
        !showImage && !initials ? /* @__PURE__ */ jsx(PersonOutlineRoundedIcon, { sx: { fontSize: Math.round(px * 0.52) } }) : null
      ]
    }
  );
  if (!ring) {
    return avatarNode;
  }
  return /* @__PURE__ */ jsx(
    Box,
    {
      component: "span",
      sx: {
        alignItems: "center",
        backgroundColor: "background.paper",
        border: `${ringWidth}px solid ${resolvedRingColor}`,
        borderRadius: resolvedRingRadius,
        boxSizing: "border-box",
        display: "inline-flex",
        height: outerSize,
        justifyContent: "center",
        p: `${ringOffset}px`,
        width: outerSize
      },
      children: avatarNode
    }
  );
}

export { Avatar };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map