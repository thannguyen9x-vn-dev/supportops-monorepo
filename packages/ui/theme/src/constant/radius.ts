export type Radius = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'pill'

export type RadiusScale = Record<Radius, number>

export const radius: RadiusScale = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 32,
  pill: 9999,
}
