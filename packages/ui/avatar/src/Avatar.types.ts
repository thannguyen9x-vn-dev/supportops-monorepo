import type { AvatarProps as MuiAvatarProps } from '@mui/material/Avatar'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type AvatarVariant = 'circular' | 'rounded' | 'square'

export interface AvatarProps {
  src?: string | null
  alt?: string
  name?: string
  size?: AvatarSize
  variant?: AvatarVariant
  dimension?: number
  className?: string
  sx?: MuiAvatarProps['sx']
  imgProps?: MuiAvatarProps['imgProps']
}
