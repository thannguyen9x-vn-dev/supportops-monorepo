'use client'

import { useCallback, useState } from 'react'

export type CropPoint = {
  x: number
  y: number
}

export interface UseImageCropReturn {
  closeCrop: () => void
  crop: CropPoint
  imageSrc: string | null
  isOpen: boolean
  openCrop: (fileId: string, src: string) => void
  setCrop: (crop: CropPoint) => void
  setZoom: (zoom: number) => void
  targetFileId: string | null
  zoom: number
}

export function useImageCrop(): UseImageCropReturn {
  const [targetFileId, setTargetFileId] = useState<string | null>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState<CropPoint>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  const openCrop = useCallback((fileId: string, src: string) => {
    setTargetFileId(fileId)
    setImageSrc(src)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
  }, [])

  const closeCrop = useCallback(() => {
    setTargetFileId(null)
    setImageSrc(null)
  }, [])

  return {
    closeCrop,
    crop,
    imageSrc,
    isOpen: Boolean(targetFileId && imageSrc),
    openCrop,
    setCrop,
    setZoom,
    targetFileId,
    zoom,
  }
}

type CropImageParams = {
  crop: CropPoint
  imageSrc: string
  outputSize?: number
  zoom: number
}

async function loadImage(imageSrc: string): Promise<HTMLImageElement> {
  const image = new Image()
  image.crossOrigin = 'anonymous'

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error('Unable to load image for cropping'))
    image.src = imageSrc
  })

  return image
}

export async function getCroppedImageBlob({
  imageSrc,
  zoom,
  crop,
  outputSize = 512,
}: CropImageParams): Promise<Blob> {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  canvas.width = outputSize
  canvas.height = outputSize

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Canvas context is not available')
  }

  const imageWidth = image.naturalWidth
  const imageHeight = image.naturalHeight
  const baseScale = Math.max(outputSize / imageWidth, outputSize / imageHeight)
  const appliedScale = baseScale * zoom
  const renderedWidth = imageWidth * appliedScale
  const renderedHeight = imageHeight * appliedScale

  const offsetX = (outputSize - renderedWidth) / 2 + crop.x
  const offsetY = (outputSize - renderedHeight) / 2 + crop.y

  const sourceX = Math.max(0, -offsetX / appliedScale)
  const sourceY = Math.max(0, -offsetY / appliedScale)
  const sourceWidth = Math.min(imageWidth - sourceX, outputSize / appliedScale)
  const sourceHeight = Math.min(imageHeight - sourceY, outputSize / appliedScale)

  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, outputSize, outputSize)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Unable to create cropped image blob'))
          return
        }
        resolve(blob)
      },
      'image/jpeg',
      0.92,
    )
  })
}
