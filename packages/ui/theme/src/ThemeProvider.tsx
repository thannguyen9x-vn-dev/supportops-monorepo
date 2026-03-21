'use client'

import {CssBaseline} from '@mui/material'
import {ThemeProvider as MuiThemeProvider} from '@mui/material/styles'
import type {PropsWithChildren} from 'react'
import {useMemo} from 'react'
import {createAppTheme} from './createAppTheme'

export function ThemeProvider({children}: PropsWithChildren) {
  const theme = useMemo(() => createAppTheme(), [])
  return (
    <MuiThemeProvider theme={theme} defaultMode='light' disableTransitionOnChange>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}
