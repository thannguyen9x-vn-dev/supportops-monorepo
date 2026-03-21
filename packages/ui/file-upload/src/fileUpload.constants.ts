import type { FileValidationRule } from './useFileUpload.types'

export const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024
export const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'] as const

export const IMAGE_ONLY_RULES: FileValidationRule = {
  acceptedTypes: [...IMAGE_TYPES],
  maxSize: MAX_FILE_SIZE_BYTES,
}

export const VIDEO_RULES: FileValidationRule = {
  acceptedTypes: [...VIDEO_TYPES],
  maxSize: MAX_VIDEO_SIZE_BYTES,
}

export const MEDIA_RULES: FileValidationRule = {
  acceptedTypes: [...IMAGE_TYPES, ...VIDEO_TYPES],
  custom: (file) => {
    const limit = file.type.startsWith('video/') ? MAX_VIDEO_SIZE_BYTES : MAX_FILE_SIZE_BYTES

    if (file.size > limit) {
      const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1)
      const limitMb = (limit / (1024 * 1024)).toFixed(0)
      return `File ${fileSizeMb}MB exceeds ${limitMb}MB limit`
    }

    return null
  },
  maxFiles: 10,
}

export const DOCUMENT_RULES: FileValidationRule = {
  acceptedTypes: [
    ...IMAGE_TYPES,
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  maxSize: MAX_FILE_SIZE_BYTES,
  maxFiles: 10,
}

export const AVATAR_RULES: FileValidationRule = {
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxFiles: 1,
  maxSize: MAX_FILE_SIZE_BYTES,
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}
