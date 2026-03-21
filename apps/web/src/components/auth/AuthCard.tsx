// AuthCard với sx prop
'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { SxProps, Theme } from '@mui/material/styles'
import { Children, type ReactNode } from 'react'

interface AuthCardProps {
  title: string
  subtitle?: string
  illustration?: ReactNode
  children: ReactNode
  footer?: ReactNode
  titleSx?: SxProps<Theme>
  illustrationPanelSx?: SxProps<Theme>
  formPanelSx?: SxProps<Theme>
  maxWidth?: number
}

export function AuthCard({
  title,
  subtitle,
  illustration,
  children,
  footer,
  titleSx,
  illustrationPanelSx,
  formPanelSx,
  maxWidth = 900,
}: AuthCardProps) {
  const hasIllustration = Children.count(illustration) > 0

  return (
    <Box
      component='section'
      sx={{
        display: 'flex',
        borderRadius: 3,
        overflow: 'hidden',
        width: `min(${maxWidth}px, calc(100vw - 32px))`,
        maxWidth: '100%',
        mx: 'auto',
        boxShadow: 'none',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        backgroundColor: 'background.paper',
        backgroundImage: 'none !important',
        flexDirection: 'column',
        '@media (min-width: 960px)': {
          flexDirection: 'row',
        },
      }}
    >
      {hasIllustration ? (
        <Box
          sx={{
            flex: '0 0 auto',
            bgcolor: 'background.paper',
            backgroundColor: 'background.paper',
            backgroundImage: 'none !important',
            p: {xs: '24px 16px', md: '24px 16px'},
            minHeight: {xs: 180, sm: 220},
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.primary',
            borderRight: {xs: 'none', md: '1px solid'},
            borderColor: 'divider',
            '@media (min-width: 960px)': {
              flex: '0 0 45%',
              minHeight: 'auto',
            },
            ...illustrationPanelSx,
          }}
        >
          {illustration}
        </Box>
      ) : null}

      {/* Form Panel */}
      <Box
        sx={{
          flex: 1,
          p: {xs: '24px 16px', md: '24px 16px'},
          bgcolor: 'background.paper',
          backgroundColor: 'background.paper',
          backgroundImage: 'none !important',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          ...formPanelSx,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{
              fontSize: { xs: '2rem', md: '2.625rem' },
              lineHeight: 1.12,
              letterSpacing: '-0.02em',
              ...titleSx,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{mt: 0.5}}>
              {subtitle}
            </Typography>
          )}
        </Box>

        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2.5}}>
          {children}
        </Box>

        {footer && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 1,
              fontSize: '0.875rem',
              color: 'text.secondary',
              pt: 2,
              borderTop: 1,
              borderColor: 'divider',
              '& a': {
                color: 'primary.main',
                textDecoration: 'none',
                fontWeight: 500,
                '&:hover': {textDecoration: 'underline'},
              },
            }}
          >
            {footer}
          </Box>
        )}
      </Box>
    </Box>
  )
}
