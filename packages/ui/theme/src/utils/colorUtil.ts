import {indigo, pink, purple} from '../constant/colors'

export const extraColors = {
  indigo,
  purple,
  pink,
} as const

export type ExtraColorKey = keyof typeof extraColors
