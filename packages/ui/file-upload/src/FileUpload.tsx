'use client'

import type { ChangeEvent, DragEvent, ReactElement } from 'react'
import { useId, useMemo, useState } from 'react'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded'
import { Box, Button, IconButton, Stack, Typography } from '@mui/material'

import type { FileUploadProps, RejectedFile } from './FileUpload.types'
import { MAX_FILE_SIZE_BYTES, MAX_VIDEO_SIZE_BYTES } from './fileUpload.constants'

function bytesToMb(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function matchAccept(file: File, accept?: string): boolean {
  if (!accept) {
    return true
  }

  const acceptParts = accept
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)

  if (acceptParts.length === 0) {
    return true
  }

  return acceptParts.some((part) => {
    if (part.endsWith('/*')) {
      const prefix = part.slice(0, -1)
      return file.type.toLowerCase().startsWith(prefix)
    }

    if (part.startsWith('.')) {
      return file.name.toLowerCase().endsWith(part)
    }

    return file.type.toLowerCase() === part
  })
}

function getErrorMessage(maxFileSizeInBytes?: number): string | undefined {
  if (!maxFileSizeInBytes) {
    return 'Maximum size: 2 MB for files, 50 MB for videos'
  }

  return `Maximum size: ${bytesToMb(maxFileSizeInBytes)} per file`
}

function getMaxSizeByFile(file: File, maxFileSizeInBytes?: number): number {
  if (maxFileSizeInBytes) {
    return maxFileSizeInBytes
  }

  return file.type.startsWith('video/') ? MAX_VIDEO_SIZE_BYTES : MAX_FILE_SIZE_BYTES
}

export function FileUpload({
  accept,
  buttonLabel = 'Select file',
  disabled = false,
  helperText,
  maxFileSizeInBytes,
  multiple = false,
  onFilesChange,
  onRejectedFiles,
  value,
}: FileUploadProps): ReactElement {
  const inputId = useId()
  const [dragOver, setDragOver] = useState(false)
  const [internalFiles, setInternalFiles] = useState<File[]>([])

  const files = value ?? internalFiles

  const validationHint = useMemo(() => getErrorMessage(maxFileSizeInBytes), [maxFileSizeInBytes])

  const updateFiles = (nextFiles: File[]) => {
    if (value === undefined) {
      setInternalFiles(nextFiles)
    }

    onFilesChange?.(nextFiles)
  }

  const processSelection = (selectedFiles: File[]) => {
    const accepted: File[] = []
    const rejected: RejectedFile[] = []

    selectedFiles.forEach((file) => {
      if (!matchAccept(file, accept)) {
        rejected.push({ file, reason: 'invalid-type' })
        return
      }

      const maxSizeForFile = getMaxSizeByFile(file, maxFileSizeInBytes)
      if (file.size > maxSizeForFile) {
        rejected.push({ file, reason: 'file-too-large' })
        return
      }

      accepted.push(file)
    })

    if (rejected.length > 0) {
      onRejectedFiles?.(rejected)
    }

    const nextFiles = multiple ? [...files, ...accepted] : accepted.slice(0, 1)
    updateFiles(nextFiles)
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? [])
    processSelection(selectedFiles)
    event.target.value = ''
  }

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setDragOver(false)

    if (disabled) {
      return
    }

    processSelection(Array.from(event.dataTransfer.files))
  }

  const removeFile = (fileName: string) => {
    updateFiles(files.filter((file) => file.name !== fileName))
  }

  return (
    <Stack spacing={1.5}>
      <Box
        component="label"
        htmlFor={inputId}
        onDragOver={(event: DragEvent<HTMLLabelElement>) => {
          event.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => {
          setDragOver(false)
        }}
        onDrop={handleDrop}
        sx={{
          p: 2,
          borderRadius: 2,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: dragOver ? 'primary.main' : 'divider',
          backgroundColor: dragOver ? 'action.hover' : 'background.paper',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'border-color 180ms ease, background-color 180ms ease',
        }}
      >
        <Stack alignItems="center" spacing={1.5}>
          <UploadFileRoundedIcon color={dragOver ? 'primary' : 'action'} />
          <Button component="span" disabled={disabled} size="small" variant="outlined">
            {buttonLabel}
          </Button>
          <Typography color="text.secondary" variant="body2">
            {helperText ?? 'Drag and drop files here or click to browse'}
          </Typography>
          {validationHint ? (
            <Typography color="text.secondary" variant="caption">
              {validationHint}
            </Typography>
          ) : null}
        </Stack>
        <input
          accept={accept}
          disabled={disabled}
          id={inputId}
          multiple={multiple}
          onChange={handleChange}
          style={{ display: 'none' }}
          type="file"
        />
      </Box>

      {files.length > 0 ? (
        <Stack spacing={1}>
          {files.map((file) => (
            <Box
              key={`${file.name}-${file.size}-${file.lastModified}`}
              sx={{
                px: 1.5,
                py: 1,
                borderRadius: 1.5,
                border: '1px solid var(--mui-palette-divider)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Box>
                <Typography variant="body2">{file.name}</Typography>
                <Typography color="text.secondary" variant="caption">
                  {bytesToMb(file.size)}
                </Typography>
              </Box>
              <IconButton
                aria-label={`Remove ${file.name}`}
                onClick={() => {
                  removeFile(file.name)
                }}
                size="small"
              >
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Stack>
      ) : null}
    </Stack>
  )
}
