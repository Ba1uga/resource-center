import type { CoursewareDraft, CoursewareValidationErrors } from './courseware-workbench.types.ts'

export function validateCoursewareDraft(draft: CoursewareDraft): CoursewareValidationErrors {
  const errors: CoursewareValidationErrors = {}

  if (draft.title.trim().length === 0) {
    errors.title = '请填写课件标题。'
  }

  if (draft.course.trim().length === 0) {
    errors.course = '请选择课程。'
  }

  if (draft.chapter.trim().length === 0) {
    errors.chapter = '请填写章节。'
  }

  if (draft.fileSize.trim().length === 0) {
    errors.fileSize = '请填写文件大小。'
  }

  if (draft.uploadedBy.trim().length === 0) {
    errors.uploadedBy = '上传人不能为空。'
  }

  return errors
}

export function hasCoursewareValidationErrors(errors: CoursewareValidationErrors): boolean {
  return Object.values(errors).some((value) => Boolean(value))
}
