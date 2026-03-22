'use client'

import type { ReactElement, SyntheticEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import MuiAvatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'

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
  ring = false,
  ringVariant = 'neutral',
  status,
  ringShape,
  ringColor = 'default',
  ringWidth = 2,
  ringOffset = 2,
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

  const resolvedRingColor = useMemo(() => {
    if (ringVariant === 'status') {
      if (status === 'active') return 'var(--mui-palette-success-main)'
      if (status === 'inactive') return 'var(--mui-palette-grey-400, var(--mui-palette-divider))'
      return 'var(--mui-palette-divider)'
    }

    if (ringColor === 'active') return 'var(--mui-palette-success-main)'
    if (ringColor === 'inactive') return 'var(--mui-palette-grey-400, var(--mui-palette-divider))'
    if (ringColor === 'default') return 'var(--mui-palette-divider)'
    return ringColor
  }, [ringColor, ringVariant, status])

  const resolvedRingShape = ringShape ?? (variant === 'circular' ? 'circular' : 'rounded')
  const resolvedRingRadius = resolvedRingShape === 'circular' ? '50%' : `${Math.max(8, Math.round(px * 0.2))}px`
  const ringLayer = Math.max(0, ringWidth + ringOffset)
  const outerSize = px + ringLayer * 2

  const avatarNode = (
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

  if (!ring) {
    return avatarNode
  }

  return (
    <Box
      component='span'
      sx={{
        alignItems: 'center',
        backgroundColor: 'background.paper',
        border: `${ringWidth}px solid ${resolvedRingColor}`,
        borderRadius: resolvedRingRadius,
        boxSizing: 'border-box',
        display: 'inline-flex',
        height: outerSize,
        justifyContent: 'center',
        p: `${ringOffset}px`,
        width: outerSize,
      }}
    >
      {avatarNode}
    </Box>
  )
}
