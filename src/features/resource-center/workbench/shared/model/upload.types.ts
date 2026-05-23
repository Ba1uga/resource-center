export type UploadStatus = 'idle' | 'init' | 'uploading' | 'success' | 'failed'

export type ModuleType = 'textbook' | 'courseware' | 'video'

export interface UploadFileEntry {
  id: string
  file: File
  originName: string
  mimeType: string
  sizeBytes: number
  sizeLabel: string
  moduleType: ModuleType
  status: UploadStatus
  progress: number
  assetId: number | null
  uploadToken: string | null
  uploadUrl: string | null
  errorMessage: string | null
}

export interface UploadValidationRules {
  maxSizeBytes: number
  allowedMimeTypes: string[]
  allowedExtensions: string[]
}

export const DEFAULT_UPLOAD_VALIDATION: UploadValidationRules = {
  maxSizeBytes: 500 * 1024 * 1024,
  allowedMimeTypes: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.ms-powerpoint',
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime',
  ],
  allowedExtensions: [
    '.pdf', '.pptx', '.ppt', '.docx', '.doc',
    '.png', '.jpg', '.jpeg', '.gif', '.webp',
    '.mp4', '.webm', '.mov',
  ],
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export function validateFile(
  file: File,
  rules: UploadValidationRules = DEFAULT_UPLOAD_VALIDATION,
): string | null {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  if (rules.allowedExtensions.length > 0 && ext && !rules.allowedExtensions.includes(ext)) {
    return `不支持的文件类型: ${ext}`
  }
  if (rules.allowedMimeTypes.length > 0 && !rules.allowedMimeTypes.includes(file.type)) {
    return `不支持的MIME类型: ${file.type}`
  }
  if (file.size > rules.maxSizeBytes) {
    return `文件过大，最大支持 ${formatFileSize(rules.maxSizeBytes)}`
  }
  if (file.size === 0) {
    return '文件为空，请选择有效文件'
  }
  return null
}
