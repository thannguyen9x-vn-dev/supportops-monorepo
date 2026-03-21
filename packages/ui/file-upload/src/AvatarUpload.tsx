'use client'

import type { ReactElement } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import { Button, Stack } from '@mui/material'

import { Avatar } from '@supportops/ui-avatar'
import type { AvatarSize, AvatarVariant } from '@supportops/ui-avatar'

import { AVATAR_RULES } from './fileUpload.constants'
import { ImageCropDialog } from './ImageCropDialog'
import { useFileUpload } from './useFileUpload'
import { useImageCrop } from './useImageCrop'
import type { UploadFn, UploadableFile } from './useFileUpload.types'

export type AvatarUploadProps = {
  avatarVariant?: AvatarVariant
  buttonLabel?: string
  cropOnSelect?: boolean
  currentSrc?: string | null
  name?: string
  onAvatarChange?: (blob: Blob, previewUrl: string) => void
  onUploadError?: (message: string) => void
  onUploadSuccess?: () => void
  size?: AvatarSize
  uploadFn?: UploadFn
}

export function AvatarUpload({
  currentSrc,
  name,
  size = 'xl',
  avatarVariant = 'circular',
  onAvatarChange,
  onUploadError,
  onUploadSuccess,
  buttonLabel = 'Change picture',
  cropOnSelect = true,
  uploadFn,
}: AvatarUploadProps): ReactElement {
  const upload = useFileUpload({
    rules: AVATAR_RULES,
    multiple: false,
    replaceOnSingle: true,
    uploadFn,
  })
  const cropState = useImageCrop()
  const previousFileIdRef = useRef<string | null>(null)
  const [pendingUploadId, setPendingUploadId] = useState<string | null>(null)

  useEffect(() => {
    const currentFile = upload.files[0]
    const currentFileId = currentFile?.id ?? null

    if (!currentFile || currentFileId === previousFileIdRef.current) {
      previousFileIdRef.current = currentFileId
      return
    }

    previousFileIdRef.current = currentFileId

    if (currentFile.status === 'error') {
      return
    }

    if (cropOnSelect && currentFile.file.type.startsWith('image/')) {
      cropState.openCrop(currentFile.id, currentFile.previewUrl)
      return
    }

    onAvatarChange?.(currentFile.file, currentFile.previewUrl)
    setPendingUploadId(currentFile.id)
  }, [cropOnSelect, cropState.openCrop, onAvatarChange, upload.files])

  const handleCropConfirm = useCallback(
    (fileId: string, blob: Blob) => {
      upload.setCroppedResult(fileId, blob)
      const previewUrl = URL.createObjectURL(blob)
      onAvatarChange?.(blob, previewUrl)
      setPendingUploadId(fileId)
    },
    [onAvatarChange, upload],
  )

  useEffect(() => {
    if (!pendingUploadId) {
      return
    }

    const pendingFile = upload.files.find((file) => file.id === pendingUploadId)
    if (!pendingFile || pendingFile.status !== 'ready') {
      return
    }

    if (cropOnSelect && !pendingFile.croppedBlob) {
      return
    }

    void upload
      .uploadOne(pendingUploadId)
      .then(() => {
        onUploadSuccess?.()
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Upload failed'
        onUploadError?.(message)
      })
      .finally(() => {
        setPendingUploadId(null)
      })
  }, [cropOnSelect, onUploadError, onUploadSuccess, pendingUploadId, upload.files, upload.uploadOne])

  const activeFile: UploadableFile | undefined = upload.files[0]
  const displaySrc = activeFile?.croppedPreviewUrl ?? activeFile?.previewUrl ?? currentSrc ?? undefined

  return (
    <Stack alignItems="center" spacing={1.5}>
      <Avatar name={name} size={size} src={displaySrc} variant={avatarVariant} />
      <Button onClick={upload.openFilePicker} size="small" startIcon={<SettingsRoundedIcon />} variant="contained">
        {buttonLabel}
      </Button>
      <input ref={upload.inputRef} {...upload.inputProps} />
      {cropOnSelect ? <ImageCropDialog cropState={cropState} onConfirm={handleCropConfirm} /> : null}
    </Stack>
  )
}
