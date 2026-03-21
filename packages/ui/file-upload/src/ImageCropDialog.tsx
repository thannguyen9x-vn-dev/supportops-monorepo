'use client'

import type { ReactElement } from 'react'
import { useCallback } from 'react'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Slider, Stack, Typography } from '@mui/material'

import { getCroppedImageBlob } from './useImageCrop'
import type { UseImageCropReturn } from './useImageCrop'

type ImageCropDialogProps = {
  cancelLabel?: string
  confirmLabel?: string
  cropState: UseImageCropReturn
  onConfirm: (fileId: string, blob: Blob) => void
  title?: string
}

export function ImageCropDialog({
  cropState,
  onConfirm,
  title = 'Crop image',
  confirmLabel = 'Apply',
  cancelLabel = 'Cancel',
}: ImageCropDialogProps): ReactElement {
  const { isOpen, imageSrc, targetFileId, crop, setCrop, zoom, setZoom, closeCrop } = cropState

  const handleConfirm = useCallback(async () => {
    if (!imageSrc || !targetFileId) {
      return
    }

    const blob = await getCroppedImageBlob({
      crop,
      imageSrc,
      zoom,
    })
    onConfirm(targetFileId, blob)
    closeCrop()
  }, [closeCrop, crop, imageSrc, onConfirm, targetFileId, zoom])

  return (
    <Dialog fullWidth maxWidth="sm" onClose={closeCrop} open={isOpen}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: 360,
              marginInline: 'auto',
              aspectRatio: '1 / 1',
              borderRadius: 2,
              overflow: 'hidden',
              bgcolor: 'var(--mui-palette-grey-900)',
            }}
          >
            {imageSrc ? (
              <Box
                alt="Crop preview"
                component="img"
                src={imageSrc}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: `translate(${crop.x}px, ${crop.y}px) scale(${zoom})`,
                  transformOrigin: 'center center',
                }}
              />
            ) : null}
          </Box>

          <Stack spacing={1}>
            <Typography variant="body2">Zoom</Typography>
            <Slider
              max={3}
              min={1}
              onChange={(_event, value) => {
                setZoom(typeof value === 'number' ? value : value[0] ?? 1)
              }}
              step={0.1}
              value={zoom}
            />
          </Stack>

          <Stack spacing={1}>
            <Typography variant="body2">Horizontal</Typography>
            <Slider
              max={100}
              min={-100}
              onChange={(_event, value) => {
                const nextX = typeof value === 'number' ? value : value[0] ?? 0
                setCrop({ x: nextX, y: crop.y })
              }}
              value={crop.x}
            />
          </Stack>

          <Stack spacing={1}>
            <Typography variant="body2">Vertical</Typography>
            <Slider
              max={100}
              min={-100}
              onChange={(_event, value) => {
                const nextY = typeof value === 'number' ? value : value[0] ?? 0
                setCrop({ x: crop.x, y: nextY })
              }}
              value={crop.y}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeCrop} variant="outlined">
          {cancelLabel}
        </Button>
        <Button disabled={!imageSrc} onClick={() => void handleConfirm()} variant="contained">
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
