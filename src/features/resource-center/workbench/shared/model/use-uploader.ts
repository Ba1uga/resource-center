import { ref, shallowRef } from 'vue'
import { initUpload, uploadFile, completeUpload, abortUpload } from '@/api/upload.ts'
import {
  formatFileSize,
  validateFile,
  DEFAULT_UPLOAD_VALIDATION,
} from './upload.types.ts'
import type {
  UploadFileEntry,
  UploadStatus,
  ModuleType,
  UploadValidationRules,
} from './upload.types.ts'

let nextEntryId = 1

function createEntryId(): string {
  return `upload-${Date.now().toString(36)}-${(nextEntryId++).toString(36)}`
}

export function useUploader(moduleType: ModuleType, rules?: UploadValidationRules, groupToken?: string) {
  const entries = shallowRef<UploadFileEntry[]>([])
  const validationRules = rules ?? DEFAULT_UPLOAD_VALIDATION

  function addFiles(files: FileList | File[]) {
    const fileArray = Array.from(files)
    const newEntries: UploadFileEntry[] = []

    for (const file of fileArray) {
      const error = validateFile(file, validationRules)
      const entry: UploadFileEntry = {
        id: createEntryId(),
        file,
        originName: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        sizeLabel: formatFileSize(file.size),
        moduleType,
        status: error ? 'failed' : 'idle',
        progress: 0,
        assetId: null,
        uploadToken: null,
        uploadUrl: null,
        errorMessage: error,
      }
      newEntries.push(entry)
    }

    entries.value = [...entries.value, ...newEntries]
  }

  function removeEntry(entryId: string) {
    const entry = entries.value.find((e) => e.id === entryId)
    if (entry?.uploadToken && entry.status !== 'success') {
      abortUpload({ uploadToken: entry.uploadToken }).catch(() => {})
    }
    entries.value = entries.value.filter((e) => e.id !== entryId)
  }

  function updateEntry(entryId: string, patch: Partial<UploadFileEntry>) {
    entries.value = entries.value.map((e) => (e.id === entryId ? { ...e, ...patch } : e))
  }

  async function startUpload(entryId: string): Promise<UploadFileEntry | null> {
    const entry = entries.value.find((e) => e.id === entryId)
    if (!entry || entry.status === 'success') return entry ?? null

    updateEntry(entryId, { status: 'init', progress: 0, errorMessage: null })

    try {
      const initResult = await initUpload({
        moduleType: entry.moduleType,
        originName: entry.originName,
        mimeType: entry.mimeType,
        sizeBytes: entry.sizeBytes,
        ...(groupToken ? { groupToken } : {}),
      })

      updateEntry(entryId, {
        status: 'uploading',
        assetId: initResult.assetId,
        uploadToken: initResult.uploadToken,
        uploadUrl: initResult.uploadUrl,
      })

      await uploadFile(initResult.uploadToken, entry.file, (percent) => {
        updateEntry(entryId, { progress: percent })
      })

      await completeUpload({ uploadToken: initResult.uploadToken })

      updateEntry(entryId, { status: 'success', progress: 100 })
    } catch (err) {
      updateEntry(entryId, {
        status: 'failed',
        errorMessage: err instanceof Error ? err.message : '上传失败',
      })
    }

    return entries.value.find((e) => e.id === entryId) ?? null
  }

  async function retryEntry(entryId: string): Promise<UploadFileEntry | null> {
    const entry = entries.value.find((e) => e.id === entryId)
    if (!entry) return null

    if (entry.uploadToken) {
      try {
        await abortUpload({ uploadToken: entry.uploadToken })
      } catch {}
    }

    updateEntry(entryId, {
      status: 'idle',
      progress: 0,
      assetId: null,
      uploadToken: null,
      uploadUrl: null,
      errorMessage: null,
    })

    return startUpload(entryId)
  }

  async function startAll(): Promise<void> {
    const pending = entries.value.filter((e) => e.status === 'idle' || e.status === 'failed')
    for (const entry of pending) {
      await startUpload(entry.id)
    }
  }

  function clearAll() {
    for (const entry of entries.value) {
      if (entry.uploadToken && entry.status !== 'success') {
        abortUpload({ uploadToken: entry.uploadToken }).catch(() => {})
      }
    }
    entries.value = []
  }

  const allSuccess = () => entries.value.every((e) => e.status === 'success')
  const hasFailed = () => entries.value.some((e) => e.status === 'failed')
  const hasUploading = () => entries.value.some((e) => e.status === 'uploading' || e.status === 'init')
  const successEntries = () => entries.value.filter((e) => e.status === 'success')

  return {
    entries,
    addFiles,
    removeEntry,
    startUpload,
    retryEntry,
    startAll,
    clearAll,
    allSuccess,
    hasFailed,
    hasUploading,
    successEntries,
  }
}
