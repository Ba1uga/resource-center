import { request } from './request.ts'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface InitUploadPayload {
  moduleType: string
  originName: string
  mimeType: string
  sizeBytes: number
  groupToken?: string
}

export interface InitUploadResult {
  assetId: number
  uploadToken: string
  uploadUrl: string
}

export interface CompleteUploadPayload {
  uploadToken: string
}

export interface CompleteUploadResult {
  assetId: number
  objectKey: string
  originName: string
  mimeType: string
  sizeBytes: number
  sha256: string
  uploadStatus: string
}

export interface AbortUploadPayload {
  uploadToken: string
}

export async function initUpload(data: InitUploadPayload): Promise<InitUploadResult> {
  const response = await request<ApiResponse<InitUploadResult>>('/upload/init', {
    method: 'POST',
    body: data,
  })
  return response.data
}

export async function uploadFile(
  uploadToken: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const formData = new FormData()
    formData.append('file', file)

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        try {
          const payload = JSON.parse(xhr.responseText)
          reject(new Error(payload?.message ?? `上传失败：${xhr.status}`))
        } catch {
          reject(new Error(`上传失败：${xhr.status}`))
        }
      }
    })

    xhr.addEventListener('error', () => reject(new Error('网络错误，上传失败')))
    xhr.addEventListener('abort', () => reject(new Error('上传已取消')))

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8080'
    xhr.open('POST', `${baseUrl}/api/upload/${uploadToken}`)
    xhr.send(formData)
  })
}

export async function completeUpload(data: CompleteUploadPayload): Promise<CompleteUploadResult> {
  const response = await request<ApiResponse<CompleteUploadResult>>('/upload/complete', {
    method: 'POST',
    body: data,
  })
  return response.data
}

export async function abortUpload(data: AbortUploadPayload): Promise<void> {
  await request<ApiResponse<null>>('/upload/abort', {
    method: 'POST',
    body: data,
  })
}
