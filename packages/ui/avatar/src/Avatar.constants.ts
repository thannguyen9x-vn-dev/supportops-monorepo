import type { AvatarSize } from './Avatar.types'

export const AVATAR_SIZE_MAP: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
  '2xl': 120,
}

export const AVATAR_FONT_RATIO = 0.38

const AVATAR_COLORS = [
  'var(--mui-palette-primary-main)',
  'var(--mui-palette-success-main)',
  'var(--mui-palette-error-main)',
  'var(--mui-palette-info-main)',
  'var(--mui-palette-warning-main)',
  'var(--mui-palette-secondary-main)',
  'var(--mui-palette-primary-dark)',
  'var(--mui-palette-success-dark)',
  'var(--mui-palette-info-dark)',
  'var(--mui-palette-error-dark)',
] as const

export function getColorFromName(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length] ?? 'var(--mui-palette-primary-main)'
}

export function getInitials(name: string, maxChars = 2): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, maxChars)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
