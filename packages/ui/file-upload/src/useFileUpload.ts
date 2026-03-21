'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'

import type {
  FileUploadStatus,
  FileValidationRule,
  UploadFn,
  UploadableFile,
  UseFileUploadOptions,
  UseFileUploadReturn,
} from './useFileUpload.types'

let fileIdCounter = 0

function generateFileId(): string {
  fileIdCounter += 1
  return `file-${Date.now()}-${fileIdCounter}`
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function validateFile(file: File, rules?: FileValidationRule): string | null {
  if (!rules) {
    return null
  }

  if (rules.acceptedTypes && rules.acceptedTypes.length > 0) {
    const isAccepted = rules.acceptedTypes.some((type) => {
      if (type.endsWith('/*')) {
        const prefix = type.replace('/*', '/')
        return file.type.startsWith(prefix)
      }
      return file.type === type
    })

    if (!isAccepted) {
      return `File type "${file.type || 'unknown'}" is not accepted`
    }
  }

  if (rules.maxSize && file.size > rules.maxSize) {
    const maxMb = (rules.maxSize / (1024 * 1024)).toFixed(1)
    const fileMb = (file.size / (1024 * 1024)).toFixed(1)
    return `File size ${fileMb}MB exceeds limit of ${maxMb}MB`
  }

  if (rules.custom) {
    return rules.custom(file)
  }

  return null
}

function createUploadableFile<T = unknown>(file: File, rules?: FileValidationRule): UploadableFile<T> {
  const error = validateFile(file, rules)

  return {
    croppedBlob: null,
    croppedPreviewUrl: null,
    error: error ?? undefined,
    file,
    id: generateFileId(),
    previewUrl: URL.createObjectURL(file),
    progress: 0,
    status: error ? 'error' : 'ready',
  }
}

function createMockUploadFn<T = unknown>(delay: number): UploadFn<T> {
  return async (_file, onProgress) => {
    const safeDelay = Math.max(delay, 100)
    const tickInterval = safeDelay / 5

    for (let tick = 1; tick <= 5; tick += 1) {
      await wait(tickInterval)
      onProgress({ progress: tick * 20 })
    }
    return undefined as T
  }
}

export function useFileUpload<T = unknown>(options: UseFileUploadOptions<T> = {}): UseFileUploadReturn<T> {
  const {
    rules,
    multiple = false,
    replaceOnSingle = true,
    uploadFn,
    mockUploadDelay = 800,
  } = options

  const [files, setFiles] = useState<UploadableFile<T>[]>([])
  const [status, setStatus] = useState<FileUploadStatus>('idle')
  const inputRef = useRef<HTMLInputElement | null>(null)

  const resolvedUploadFn = useMemo(
    () => uploadFn ?? createMockUploadFn<T>(mockUploadDelay),
    [mockUploadDelay, uploadFn],
  )

  const revokeFileUrls = useCallback((targets: UploadableFile<T>[]) => {
    targets.forEach((target) => {
      URL.revokeObjectURL(target.previewUrl)
      if (target.croppedPreviewUrl) {
        URL.revokeObjectURL(target.croppedPreviewUrl)
      }
    })
  }, [])

  useEffect(() => {
    return () => {
      revokeFileUrls(files)
    }
  }, [files, revokeFileUrls])

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const incoming = Array.from(fileList)
      if (incoming.length === 0) {
        return
      }

      setFiles((prev) => {
        if (!multiple && replaceOnSingle) {
          revokeFileUrls(prev)
          const first = incoming[0]
          return first ? [createUploadableFile<T>(first, rules)] : []
        }

        const maxFiles = rules?.maxFiles ?? Number.POSITIVE_INFINITY
        const remaining = maxFiles - prev.length
        if (remaining <= 0) {
          return prev
        }

        const toAdd = incoming.slice(0, remaining).map((file) => createUploadableFile<T>(file, rules))
        return [...prev, ...toAdd]
      })

      setStatus('ready')

      if (inputRef.current) {
        inputRef.current.value = ''
      }
    },
    [multiple, replaceOnSingle, revokeFileUrls, rules],
  )

  const removeFile = useCallback(
    (id: string) => {
      setFiles((prev) => {
        const target = prev.find((file) => file.id === id)
        if (target) {
          revokeFileUrls([target])
        }

        const next = prev.filter((file) => file.id !== id)
        if (next.length === 0) {
          setStatus('idle')
        }

        return next
      })
    },
    [revokeFileUrls],
  )

  const clearAll = useCallback(() => {
    setFiles((prev) => {
      revokeFileUrls(prev)
      return []
    })
    setStatus('idle')
  }, [revokeFileUrls])

  const setCroppedResult = useCallback((id: string, blob: Blob) => {
    setFiles((prev) =>
      prev.map((file) => {
        if (file.id !== id) {
          return file
        }

        if (file.croppedPreviewUrl) {
          URL.revokeObjectURL(file.croppedPreviewUrl)
        }

        return {
          ...file,
          croppedBlob: blob,
          croppedPreviewUrl: URL.createObjectURL(blob),
        }
      }),
    )
  }, [])

  const uploadOne = useCallback(
    async (id: string) => {
      const target = files.find((file) => file.id === id)
      if (!target || target.status !== 'ready') {
        return
      }

      setStatus('uploading')
      setFiles((prev) =>
        prev.map((file) =>
          file.id === id ? { ...file, error: undefined, progress: 0, status: 'uploading' } : file,
        ),
      )

      try {
        const uploadedFileInfo = await resolvedUploadFn(target, ({ progress }) => {
          setFiles((prev) =>
            prev.map((file) => (file.id === id ? { ...file, progress: Math.min(progress, 100) } : file)),
          )
        })

        setFiles((prev) =>
          prev.map((file) => (file.id === id ? { ...file, progress: 100, status: 'done', uploadedFileInfo } : file)),
        )
        setStatus('done')
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed'
        setFiles((prev) =>
          prev.map((file) => (file.id === id ? { ...file, error: errorMessage, status: 'error' } : file)),
        )
        setStatus('error')
        throw error
      }
    },
    [files, resolvedUploadFn],
  )

  const uploadAll = useCallback(async () => {
    const readyFiles = files.filter((file) => file.status === 'ready')
    if (readyFiles.length === 0) {
      return
    }

    setStatus('uploading')

    const results = await Promise.allSettled(
      readyFiles.map(async (target) => {
        setFiles((prev) =>
          prev.map((file) =>
            file.id === target.id ? { ...file, error: undefined, progress: 0, status: 'uploading' } : file,
          ),
        )

        try {
          const uploadedFileInfo = await resolvedUploadFn(target, ({ progress }) => {
            setFiles((prev) =>
              prev.map((file) =>
                file.id === target.id ? { ...file, progress: Math.min(progress, 100) } : file,
              ),
            )
          })

          setFiles((prev) =>
            prev.map((file) => (file.id === target.id ? { ...file, progress: 100, status: 'done', uploadedFileInfo } : file)),
          )
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Upload failed'
          setFiles((prev) =>
            prev.map((file) =>
              file.id === target.id ? { ...file, error: errorMessage, status: 'error' } : file,
            ),
          )
          throw error
        }
      }),
    )

    const hasFailure = results.some((result) => result.status === 'rejected')
    setStatus(hasFailure ? 'error' : 'done')
  }, [files, resolvedUploadFn])

  const openFilePicker = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
        addFiles(event.target.files)
      }
    },
    [addFiles],
  )

  const accept = rules?.acceptedTypes?.join(',')

  const inputProps = useMemo(
    () => ({
      accept,
      multiple,
      onChange: handleInputChange,
      style: { display: 'none' },
      tabIndex: -1,
      type: 'file',
    }),
    [accept, handleInputChange, multiple],
  )

  return {
    addFiles,
    clearAll,
    files,
    inputProps,
    inputRef,
    openFilePicker,
    removeFile,
    setCroppedResult,
    status,
    uploadAll,
    uploadOne,
  }
}
