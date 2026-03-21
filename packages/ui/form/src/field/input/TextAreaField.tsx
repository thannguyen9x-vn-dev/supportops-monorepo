'use client'

import type {ReactElement} from 'react'
import type {FieldPath, FieldValues} from 'react-hook-form'
import {TextInputField} from './TextInputField'
import type {TextAreaFieldProps} from './TextAreaField.types'

export function TextAreaField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: TextAreaFieldProps<TFieldValues, TName>): ReactElement {
  const {maxRows, minRows = 4, ...rest} = props

  return <TextInputField {...rest} multiline maxRows={maxRows} minRows={minRows} />
}

export default TextAreaField
