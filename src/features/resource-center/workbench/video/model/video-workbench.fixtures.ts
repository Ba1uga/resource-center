import type { VideoRecord } from './video-workbench.types.ts'

export const videoRecords: VideoRecord[] = [
  {
    id: 'video-1001',
    title: '计算机网络概述讲解',
    course: '计算机网络',
    chapter: '第1章',
    duration: '45:30',
    resolution: '1080p',
    viewCount: 234,
    uploadedBy: '张老师',
    uploadedAt: '2026-03-01',
  },
  {
    id: 'video-1002',
    title: '物理层知识点',
    course: '计算机网络',
    chapter: '第2章',
    duration: '38:15',
    resolution: '1080p',
    viewCount: 189,
    uploadedBy: '张老师',
    uploadedAt: '2026-03-05',
  },
  {
    id: 'video-1003',
    title: '数据结构基础',
    course: '数据结构',
    chapter: '第1章',
    duration: '52:00',
    resolution: '720p',
    viewCount: 312,
    uploadedBy: '李老师',
    uploadedAt: '2026-02-20',
  },
]
