'use client'

import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
  alpha,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FileUploadFieldProps, UploadedFileInfo } from './FileUploadField.types'
import { formatFileSize } from './fileUpload.constants'
import { useFileUpload } from './useFileUpload'
import type { FileValidationRule } from './useFileUpload.types'

export function FileUploadField({
  value = [],
  onChange,
  maxFiles = 20,
  maxFileSizeBytes = 10 * 1024 * 1024, // 10MB
  accept = '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg',
  acceptedMimeTypes,
  disabled = false,
  error,
  helperText,
  label = 'Attachments',
  uploadFn,
  onUploadSuccess,
  onUploadError,
}: FileUploadFieldProps) {
  const syncedUploadIdsRef = useRef<Set<string>>(new Set())

  const uniqueValue = useMemo(() => {
    const byId = new Map<string, UploadedFileInfo>()
    value.forEach((file) => {
      if (!byId.has(file.id)) {
        byId.set(file.id, file)
      }
    })
    return Array.from(byId.values())
  }, [value])

  const rules: FileValidationRule = useMemo(
    () => ({
      maxFiles,
      maxSize: maxFileSizeBytes,
      acceptedTypes: acceptedMimeTypes,
    }),
    [maxFiles, maxFileSizeBytes, acceptedMimeTypes],
  )

  const {
    files,
    inputProps,
    inputRef,
    openFilePicker,
    removeFile,
    status,
    uploadAll,
  } = useFileUpload<UploadedFileInfo>({
    rules,
    multiple: true,
    uploadFn,
  })

  // Auto-upload when files are added
  useEffect(() => {
    if (files.length > 0 && status === 'ready') {
      void uploadAll()
    }
  }, [files.length, status, uploadAll])

  // Notify parent when upload is done
  useEffect(() => {
    if (status !== 'done') {
      return
    }

    const completedLocalFiles = files.filter((f) => f.status === 'done')
    const existingIds = new Set(uniqueValue.map((file) => file.id))
    const newUploadedFileInfos: UploadedFileInfo[] = files
      .filter((f) => f.status === 'done' && f.uploadedFileInfo)
      .map((f) => f.uploadedFileInfo!)
      .filter((uploaded) => !existingIds.has(uploaded.id) && !syncedUploadIdsRef.current.has(uploaded.id))

    if (newUploadedFileInfos.length === 0 && completedLocalFiles.length === 0) {
      return
    }

    if (newUploadedFileInfos.length > 0) {
      newUploadedFileInfos.forEach((uploaded) => syncedUploadIdsRef.current.add(uploaded.id))
      onUploadSuccess?.(newUploadedFileInfos)
      onChange?.([...uniqueValue, ...newUploadedFileInfos])
    }

    // Remove completed local rows after syncing to parent value
    completedLocalFiles.forEach((completed) => removeFile(completed.id))
  }, [status, files, onUploadSuccess, onChange, uniqueValue, removeFile])

  // Notify parent on error
  useEffect(() => {
    if (status === 'error') {
      const errorFiles = files.filter((f) => f.status === 'error')
      if (errorFiles.length > 0 && onUploadError) {
        onUploadError(errorFiles.map((f) => f.error || 'Upload failed'))
      }
    }
  }, [status, files, onUploadError])

  const handleRemoveUploaded = useCallback(
    (fileId: string) => {
      const newValue = uniqueValue.filter((f) => f.id !== fileId)
      onChange?.(newValue)
    },
    [uniqueValue, onChange],
  )

  const handleRemoveUploading = useCallback(
    (localId: string) => {
      removeFile(localId)
    },
    [removeFile],
  )

  const [previewFile, setPreviewFile] = useState<{ url: string; name: string; mimeType: string } | null>(null)

  const handlePreview = useCallback((url: string, name: string, mimeType: string) => {
    setPreviewFile({ url, name, mimeType })
  }, [])

  const handleDownload = useCallback((url: string, fileName: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
    link.click()
    link.remove()
  }, [])

  const transientFiles = useMemo(
    () => files.filter((file) => file.status !== 'done'),
    [files],
  )
  const isUploading = status === 'uploading'
  const canUpload = uniqueValue.length + transientFiles.length < maxFiles

  return (
    <Box>
      {label && (
        <Typography sx={{ mb: 1, fontWeight: 600 }} variant="body2">
          {label}
        </Typography>
      )}

      <Box
        onClick={!disabled && canUpload && !isUploading ? openFilePicker : undefined}
        sx={{
          border: (theme) => `2px dashed ${error ? theme.palette.error.main : theme.palette.divider}`,
          borderRadius: 1,
          p: 3,
          textAlign: 'center',
          cursor: !disabled && canUpload && !isUploading ? 'pointer' : 'not-allowed',
          bgcolor: (theme) => (disabled ? theme.palette.action.disabledBackground : alpha(theme.palette.primary.main, 0.02)),
          transition: 'all 0.2s',
          '&:hover': !disabled && canUpload && !isUploading
            ? {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                borderColor: (theme) => theme.palette.primary.main,
              }
            : {},
        }}
      >
        <CloudUploadOutlinedIcon
          sx={{
            fontSize: 48,
            color: error ? 'error.main' : 'action.active',
            mb: 1,
          }}
        />
        <Typography color="text.secondary" variant="body2">
          {disabled
            ? 'Upload disabled'
            : canUpload
              ? `Click to upload or drag and drop (max ${maxFiles} files, ${formatFileSize(maxFileSizeBytes)} each)`
              : `Maximum ${maxFiles} files reached`}
        </Typography>
        {accept && (
          <Typography color="text.disabled" variant="caption">
            Accepted formats: {accept}
          </Typography>
        )}
      </Box>

      <input ref={inputRef} {...inputProps} accept={accept} disabled={disabled || !canUpload} />

      {helperText && !error && (
        <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="caption">
          {helperText}
        </Typography>
      )}

      {error && (
        <Stack alignItems="center" direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
          <ErrorOutlineIcon color="error" fontSize="small" />
          <Typography color="error" variant="caption">
            {error}
          </Typography>
        </Stack>
      )}

      {/* Uploading files */}
      {transientFiles.length > 0 && (
        <Stack spacing={1} sx={{ mt: 1.5 }}>
          {transientFiles.map((file) => (
            <Box
              key={file.id}
              sx={{
                p: 1.5,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                bgcolor: 'background.paper',
              }}
            >
              <Stack alignItems="center" direction="row" spacing={1.5}>
                {file.status === 'uploading' ? (
                  <CircularProgress size={20} />
                ) : file.status === 'error' ? (
                  <ErrorOutlineIcon color="error" fontSize="small" />
                ) : (
                  <AttachFileOutlinedIcon color="action" fontSize="small" />
                )}

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography noWrap variant="body2">
                    {file.file.name}
                  </Typography>
                  <Typography color="text.secondary" variant="caption">
                    {formatFileSize(file.file.size)}
                    {file.status === 'uploading' && ` • ${file.progress}%`}
                    {file.status === 'error' && ` • ${file.error}`}
                  </Typography>
                  {file.status === 'uploading' && (
                    <LinearProgress
                      sx={{ mt: 0.5 }}
                      value={file.progress}
                      variant="determinate"
                    />
                  )}
                </Box>

                {file.status !== 'uploading' && (
                  <Stack direction="row" spacing={0.5}>
                    <Button
                      color="inherit"
                      onClick={() => handlePreview(file.previewUrl, file.file.name, file.file.type)}
                      size="small"
                      startIcon={<VisibilityOutlinedIcon fontSize="small" />}
                      variant="text"
                    >
                      Preview
                    </Button>
                    <Button
                      color="inherit"
                      onClick={() => handleRemoveUploading(file.id)}
                      size="small"
                      startIcon={<DeleteOutlineOutlinedIcon fontSize="small" />}
                      variant="text"
                    >
                      Remove
                    </Button>
                  </Stack>
                )}
              </Stack>
            </Box>
          ))}
        </Stack>
      )}

      {/* Preview dialog */}
      <Dialog
        fullWidth
        maxWidth="md"
        onClose={() => setPreviewFile(null)}
        open={Boolean(previewFile)}
      >
        {previewFile && (
          <>
            <DialogTitle sx={{ pr: 6 }}>
              <Typography noWrap variant="body1">
                {previewFile.name}
              </Typography>
              <IconButton
                aria-label="close"
                onClick={() => setPreviewFile(null)}
                size="small"
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0, minHeight: 400 }}>
              {previewFile.mimeType.startsWith('image/') ? (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2,
                    minHeight: 400,
                    bgcolor: 'grey.50',
                  }}
                >
                      <img
                    alt={previewFile.name}
                    src={previewFile.url}
                    style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                  />
                </Box>
              ) : previewFile.mimeType === 'application/pdf' ? (
                <Box component="iframe"
                  src={previewFile.url}
                  sx={{ width: '100%', height: '70vh', border: 'none', display: 'block' }}
                  title={previewFile.name}
                />
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    minHeight: 400,
                    p: 4,
                  }}
                >
                  <AttachFileOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                  <Typography color="text.secondary" variant="body2">
                    Preview is not available for this file type.
                  </Typography>
                  <Button
                    onClick={() => handleDownload(previewFile.url, previewFile.name)}
                    startIcon={<DownloadOutlinedIcon />}
                    variant="outlined"
                  >
                    Download to view
                  </Button>
                </Box>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Uploaded files */}
      {uniqueValue.length > 0 && (
        <Stack spacing={1} sx={{ mt: transientFiles.length > 0 ? 1.5 : 1.5 }}>
          {uniqueValue.map((file) => (
            <Box
              key={file.id}
              sx={{
                p: 1.5,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                bgcolor: 'background.paper',
              }}
            >
              <Stack alignItems="center" direction="row" spacing={1.5}>
                <AttachFileOutlinedIcon color="success" fontSize="small" />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography noWrap variant="body2">
                    {file.fileName}
                  </Typography>
                  <Typography color="text.secondary" variant="caption">
                    {formatFileSize(file.sizeBytes)}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <Button
                    color="inherit"
                    onClick={() => handlePreview(file.fileUrl, file.fileName, file.mimeType)}
                    size="small"
                    startIcon={<VisibilityOutlinedIcon fontSize="small" />}
                    variant="text"
                  >
                    Preview
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => handleDownload(file.fileUrl, file.fileName)}
                    size="small"
                    startIcon={<DownloadOutlinedIcon fontSize="small" />}
                    variant="text"
                  >
                    Download
                  </Button>
                  <Button
                    color="inherit"
                    disabled={disabled}
                    onClick={() => handleRemoveUploaded(file.id)}
                    size="small"
                    startIcon={<DeleteOutlineOutlinedIcon fontSize="small" />}
                    variant="text"
                  >
                    Remove
                  </Button>
                </Stack>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  )
}
