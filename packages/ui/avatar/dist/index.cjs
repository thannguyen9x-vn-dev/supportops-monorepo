'use strict';

var react = require('react');
var PersonOutlineRoundedIcon = require('@mui/icons-material/PersonOutlineRounded');
var MuiAvatar = require('@mui/material/Avatar');
var jsxRuntime = require('react/jsx-runtime');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var PersonOutlineRoundedIcon__default = /*#__PURE__*/_interopDefault(PersonOutlineRoundedIcon);
var MuiAvatar__default = /*#__PURE__*/_interopDefault(MuiAvatar);

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
  imgProps
}) {
  const [hasImageError, setHasImageError] = react.useState(false);
  react.useEffect(() => {
    setHasImageError(false);
  }, [src]);
  const px = dimension ?? AVATAR_SIZE_MAP[size];
  const fontSize = Math.round(px * AVATAR_FONT_RATIO);
  const showImage = Boolean(src) && !hasImageError;
  const initials = react.useMemo(() => {
    if (!name) {
      return void 0;
    }
    return getInitials(name);
  }, [name]);
  const backgroundColor = react.useMemo(() => {
    if (!name) {
      return void 0;
    }
    return getColorFromName(name);
  }, [name]);
  const handleError = (event) => {
    setHasImageError(true);
    imgProps?.onError?.(event);
  };
  return /* @__PURE__ */ jsxRuntime.jsxs(
    MuiAvatar__default.default,
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
        !showImage && !initials ? /* @__PURE__ */ jsxRuntime.jsx(PersonOutlineRoundedIcon__default.default, { sx: { fontSize: Math.round(px * 0.52) } }) : null
      ]
    }
  );
}

exports.Avatar = Avatar;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map