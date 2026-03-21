import React from 'react'
import type {Theme} from '@mui/material'
import {Box, Stack} from '@mui/material'
import type {Components} from '@mui/material/styles'

// ─────────────────────────────────────────────
// Icon components
// ─────────────────────────────────────────────

const CheckboxIndeterminateIcon: React.FC = () => {
  return (
    <Stack>
      <Stack className='checkbox-indeterminate'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='20'
          height='20'
          viewBox='0 0 20 20'
          fill='none'
        >
          <g clipPath='url(#clip0_3824_2241)'>
            <rect width='20' height='20' rx='4' fill='#594DE8' />
            <rect x='5' y='9' width='10' height='2' rx='0.2' fill='white' />
          </g>
          <defs>
            <clipPath id='checkbox-indeterminate_clip0_3824_2241'>
              <rect width='20' height='20' fill='white' />
            </clipPath>
          </defs>
        </svg>
      </Stack>

      <Box className='checkbox-indeterminate-disable' sx={{display: 'none'}}>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='20'
          height='20'
          viewBox='0 0 20 20'
          fill='none'
        >
          <g clipPath='url(#clip0_3824_2241)'>
            <rect x='0.5' y='0.5' width='19' height='19' rx='3.5' fill='#F0F4F8' stroke='#CDD7E1' />
            <rect x='5' y='9' width='10' height='2' rx='0.2' fill='#CDD7E1' />
          </g>
          <defs>
            <clipPath id='checkbox_indeterminate_disable_clip0_3824_2241'>
              <rect width='20' height='20' fill='white' />
            </clipPath>
          </defs>
        </svg>
      </Box>
    </Stack>
  )
}

const CheckboxCheckedIcon: React.FC = () => {
  return (
    <Stack>
      <Stack className='checkbox-checked'>
        <svg
          width='20'
          height='20'
          viewBox='0 0 20 20'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <g clipPath='url(#clip0_3824_2208)'>
            <rect width='20' height='20' rx='4' fill='#594DE8' />
            <path
              d='M14.2839 6.39844L15.1091 7.22363L15.197 7.3125L8.92163 13.5879L8.83276 13.6758L8.74487 13.5879L5.03198 9.87598L4.94409 9.78711L5.94604 8.78516L6.03394 8.87402L8.83276 11.6719L14.1072 6.39844L14.1951 6.31055L14.2839 6.39844Z'
              fill='white'
              stroke='white'
              strokeWidth='0.25'
            />
          </g>
          <defs>
            <clipPath id='checkbox_checked_clip0_3824_2208'>
              <rect width='20' height='20' fill='white' />
            </clipPath>
          </defs>
        </svg>
      </Stack>

      <Box className='checkbox-checked-disable' sx={{display: 'none'}}>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='20'
          height='20'
          viewBox='0 0 20 20'
          fill='none'
        >
          <g clipPath='url(#clip0_3824_2241)'>
            <rect x='0.5' y='0.5' width='19' height='19' rx='3.5' fill='#F0F4F8' stroke='#CDD7E1' />
            <path
              d='M14.2839 6.39844L15.1091 7.22363L15.197 7.3125L8.92163 13.5879L8.83276 13.6758L8.74487 13.5879L5.03198 9.87598L4.94409 9.78711L5.94604 8.78516L6.03394 8.87402L8.83276 11.6719L14.1072 6.39844L14.1951 6.31055L14.2839 6.39844Z'
              fill='#CDD7E1'
              stroke='#CDD7E1'
              strokeWidth='0.25'
            />
          </g>
          <defs>
            <clipPath id='checkbox_checked_disable_clip0_3824_2241'>
              <rect width='20' height='20' fill='white' />
            </clipPath>
          </defs>
        </svg>
      </Box>
    </Stack>
  )
}

const CheckboxDefaultIcon: React.FC = () => {
  return (
    <Stack>
      <Stack className='checkbox-default'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='20'
          height='20'
          viewBox='0 0 20 20'
          fill='none'
        >
          <g clipPath='url(#clip0_3794_15414)'>
            <rect
              className='checkbox-default'
              x='0.5'
              y='0.5'
              width='19'
              height='19'
              rx='3.5'
              fill='white'
              stroke='#CDD7E1'
            />
          </g>
          <defs>
            <clipPath id='checkbox_default_clip0_3794_15414'>
              <rect width='20' height='20' fill='white' />
            </clipPath>
          </defs>
        </svg>
      </Stack>

      <Box className='checkbox-default-disable' sx={{display: 'none'}}>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='20'
          height='20'
          viewBox='0 0 20 20'
          fill='none'
        >
          <g clipPath='url(#clip0_3824_2241)'>
            <rect x='0.5' y='0.5' width='19' height='19' rx='3.5' fill='#F0F4F8' stroke='#CDD7E1' />
          </g>
          <defs>
            <clipPath id='checkbox_default_disable_clip0_3824_2241'>
              <rect width='20' height='20' fill='white' />
            </clipPath>
          </defs>
        </svg>
      </Box>
    </Stack>
  )
}

// ─────────────────────────────────────────────
// Override
// ─────────────────────────────────────────────

export function OverrideCheckbox(theme: Theme): Components['MuiCheckbox'] {
  const {grey, primary} = theme.palette

  return {
    defaultProps: {
      disableRipple: true,
      disableTouchRipple: true,
      disableFocusRipple: true,
      size: 'medium',
      icon: <CheckboxDefaultIcon />,
      checkedIcon: <CheckboxCheckedIcon />,
      indeterminateIcon: <CheckboxIndeterminateIcon />,
    },
    styleOverrides: {
      root: {
        borderRadius: '8px',
        color: grey[300],

        // hover: default / circle-default
        '&:hover svg rect.checkbox-default': {
          fill: primary[100],
          stroke: primary[500],
        },
        '&:hover svg rect.checkbox-circle-default': {
          fill: primary[100],
          stroke: primary[500],
        },

        // disabled states
        '&.Mui-disabled': {
          '.checkbox-default-disable, .checkbox-indeterminate-disable, .checkbox-checked-disable, .checkbox-circle-default-disable, .checkbox-circle-checked-disable':
            {
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            },

          '.checkbox-indeterminate, .checkbox-checked, .checkbox-default, .checkbox-circle-default, .checkbox-circle-checked':
            {
              display: 'none',
            },
        },

        '&.MuiCheckbox-sizeSmall': {
          padding: '8px',
          '.MuiSvgIcon-root, .icon': {
            fontSize: '16px',
            width: '16px',
            height: '16px',
          },
        },
        '&.MuiCheckbox-sizeMedium': {
          padding: '8px',
          '.MuiSvgIcon-root, .icon': {
            fontSize: '24px',
            width: '24px',
            height: '24px',
          },
        },
        '&.MuiCheckbox-sizeLarge': {
          padding: '12px',
          '.MuiSvgIcon-root, .icon': {
            fontSize: '32px',
            width: '32px',
            height: '32px',
          },
        },
      },
    },
  }
}
