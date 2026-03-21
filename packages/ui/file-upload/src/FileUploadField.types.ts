import type { UploadFn } from './useFileUpload.types'

export interface UploadedFileInfo {
  id: string
  fileName: string
  fileUrl: string
  mimeType: string
  sizeBytes: number
  uploadedAt?: string
}

export interface FileUploadFieldProps {
  /**
   * Current value - array of uploaded file infos
   */
  value?: UploadedFileInfo[]

  /**
   * Callback when value changes (after successful uploads or removals)
   */
  onChange?: (files: UploadedFileInfo[]) => void

  /**
   * Maximum number of files allowed
   * @default 20
   */
  maxFiles?: number

  /**
   * Maximum file size in bytes
   * @default 10485760 (10MB)
   */
  maxFileSizeBytes?: number

  /**
   * HTML accept attribute (e.g., ".pdf,.doc,.docx")
   * @default ".pdf,.doc,.docx,.png,.jpg,.jpeg"
   */
  accept?: string

  /**
   * MIME types for validation (e.g., ["image/png", "application/pdf"])
   */
  acceptedMimeTypes?: string[]

  /**
   * Whether the field is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Error message to display
   */
  error?: string

  /**
   * Helper text to display below the field
   */
  helperText?: string

  /**
   * Label for the field
   * @default "Attachments"
   */
  label?: string

  /**
   * Upload function that performs the actual file upload
   * Should return the uploaded file info
   */
  uploadFn?: UploadFn<UploadedFileInfo>

  /**
   * Callback when files are successfully uploaded
   */
  onUploadSuccess?: (files: UploadedFileInfo[]) => void

  /**
   * Callback when upload fails
   */
  onUploadError?: (errors: string[]) => void
}
