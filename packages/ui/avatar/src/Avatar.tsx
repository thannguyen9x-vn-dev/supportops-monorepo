'use client'

import type { ReactElement, SyntheticEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import MuiAvatar from '@mui/material/Avatar'

import { AVATAR_FONT_RATIO, AVATAR_SIZE_MAP, getColorFromName, getInitials } from './Avatar.constants'
import type { AvatarProps } from './Avatar.types'

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  variant = 'circular',
  dimension,
  className,
  sx,
  imgProps,
}: AvatarProps): ReactElement {
  const [hasImageError, setHasImageError] = useState(false)

  useEffect(() => {
    setHasImageError(false)
  }, [src])

  const px = dimension ?? AVATAR_SIZE_MAP[size]
  const fontSize = Math.round(px * AVATAR_FONT_RATIO)
  const showImage = Boolean(src) && !hasImageError

  const initials = useMemo(() => {
    if (!name) {
      return undefined
    }

    return getInitials(name)
  }, [name])

  const backgroundColor = useMemo(() => {
    if (!name) {
      return undefined
    }

    return getColorFromName(name)
  }, [name])

  const handleError = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    setHasImageError(true)
    imgProps?.onError?.(event)
  }

  return (
    <MuiAvatar
      alt={alt ?? name}
      className={className}
      imgProps={showImage ? { ...imgProps, onError: handleError } : undefined}
      src={showImage ? src ?? undefined : undefined}
      variant={variant}
      sx={{
        width: px,
        height: px,
        fontSize,
        ...(!showImage && backgroundColor ? { bgcolor: backgroundColor } : {}),
        ...sx,
      }}
    >
      {!showImage && initials ? initials : null}
      {!showImage && !initials ? <PersonOutlineRoundedIcon sx={{ fontSize: Math.round(px * 0.52) }} /> : null}
    </MuiAvatar>
  )
}
