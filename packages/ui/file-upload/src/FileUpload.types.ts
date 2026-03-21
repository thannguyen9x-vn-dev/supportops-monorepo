export type RejectedFileReason = 'invalid-type' | 'file-too-large'

export type RejectedFile = {
  file: File
  reason: RejectedFileReason
}

export interface FileUploadProps {
  accept?: string
  buttonLabel?: string
  disabled?: boolean
  helperText?: string
  maxFileSizeInBytes?: number
  multiple?: boolean
  onFilesChange?: (files: File[]) => void
  onRejectedFiles?: (rejectedFiles: RejectedFile[]) => void
  value?: File[]
}
