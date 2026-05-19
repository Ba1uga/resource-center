<script setup lang="ts">
import '../styles/outline-workbench.css'
import 'perfect-scrollbar/css/perfect-scrollbar.css'

import PerfectScrollbar from 'perfect-scrollbar'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

import {
  archiveOutlineVersion,
  createOutlineCourse,
  createOutlineVersion,
  duplicateOutlineVersion,
  getOutlineVersion,
  listOutlineCoursePage,
  listOutlineCourseVersions,
  restoreOutlineVersion,
  saveOutlineVersion,
} from '@/api/outline.ts'
import {
  createOutlineVersionDraft,
  createOutlineVersionDraftFromVersion,
} from '@/features/resource-center/workbench/outline/model/outline-workbench.editor.ts'
import { createOutlineWorkbenchRepository } from '@/features/resource-center/workbench/outline/model/outline-workbench.repository.ts'
import {
  canExportOutlineVersion,
  validateOutlineVersionForExport,
} from '@/features/resource-center/workbench/outline/model/outline-workbench.validation.ts'
import {
  createDefaultOutlineWorkbenchQueryState,
  createOutlinePaginationState,
  createOutlineWorkbenchViewModel,
} from '@/features/resource-center/workbench/outline/model/outline-workbench.view-model.ts'
import WorkbenchSelect from '../../shared/ui/WorkbenchSelect.vue'
import WorkbenchTablePagination from '../../shared/ui/WorkbenchTablePagination.vue'

import type {
  OutlineCompletionSummary,
  OutlineCourseRecord,
  OutlineCourseSummaryRecord,
  OutlinePageResult,
  OutlineSectionId,
  OutlineVersionRecord,
  OutlineVersionSummaryRecord,
} from '@/features/resource-center/workbench/outline/model/outline-workbench.types.ts'
import type { WorkbenchSectionMeta } from '@/features/resource-center/workbench/shared/model/workbench.registry.ts'

const props = defineProps<{
  section: WorkbenchSectionMeta
  currentAdminName: string
}>()

type PendingVersionSelection = {
  courseId: string
  versionId: string
}

type PendingArchiveTarget = {
  courseId: string
  versionId: string
  versionLabel: string
}

type UndoArchiveTarget = PendingArchiveTarget

const repository = createOutlineWorkbenchRepository({
  initialCourses: [],
})
const page = ref(1)
const pageSize = ref(10)
const pageSizeOptions = [10, 20, 50]
const coursePageState = ref<OutlinePageResult<OutlineCourseSummaryRecord>>({
  records: [],
  total: 0,
  size: 10,
  current: 1,
  pages: 1,
})
const courseVersionPages = reactive<Record<string, OutlinePageResult<OutlineVersionSummaryRecord>>>({})
const courseVersionPageNumbers = reactive<Record<string, number>>({})
const courseVersionPageSizes = reactive<Record<string, number>>({})
const queryState = reactive(createDefaultOutlineWorkbenchQueryState(coursePageState.value, courseVersionPages))
const draft = ref(createOutlineVersionDraft())
const activeEditorSection = ref<OutlineSectionId>('basic-info')
const showVersionCreator = ref(false)
const showCourseCreator = ref(false)
const versionCreator = reactive({
  mode: 'copy' as 'copy' | 'blank',
  versionName: '',
  semester: '',
  note: '',
})
const courseCreator = reactive({
  title: '',
  instructor: '',
  department: '',
})
const statusMessage = ref('')
const connectionStatus = ref<'' | 'offline'>('')
const statusVisible = ref(false)
const savedSnapshot = ref('')
const pendingSelection = ref<PendingVersionSelection | null>(null)
const pendingArchive = ref<PendingArchiveTarget | null>(null)
const undoArchiveTarget = ref<UndoArchiveTarget | null>(null)
const isEditing = ref(false)
const isLoading = ref(false)
const isCreatingCourse = ref(false)
const loadingCourseIds = ref<string[]>([])
const courseVersionErrors = reactive<Record<string, string>>({})
const currentCourseDetail = ref<OutlineCourseRecord | undefined>(undefined)
const currentVersionDetail = ref<OutlineVersionRecord | undefined>(undefined)
const courseTreeScrollRef = ref<HTMLElement | null>(null)
const workspaceBodyScrollRef = ref<HTMLElement | null>(null)

let localIdSeed = 0
let courseTreeScrollbar: PerfectScrollbar | null = null
let workspaceBodyScrollbar: PerfectScrollbar | null = null
let statusTimer: ReturnType<typeof setTimeout> | undefined

const outlineScrollbarOptions: PerfectScrollbar.Options = {
  minScrollbarLength: 28,
  suppressScrollX: true,
  wheelPropagation: false,
  wheelSpeed: 0.8,
}

const viewModel = computed(() => {
  return createOutlineWorkbenchViewModel({
    coursePage: coursePageState.value,
    versionPagesByCourseId: courseVersionPages,
    selectedCourseId: queryState.selectedCourseId,
    selectedVersionId: queryState.selectedVersionId,
    currentCourse: currentCourseDetail.value,
    currentVersion: currentVersionDetail.value,
    queryState,
  })
})

const currentVersionPageHint = computed(() => {
  const currentCourseId = queryState.selectedCourseId
  const currentVersionId = queryState.selectedVersionId
  if (!currentCourseId || !currentVersionId) {
    return ''
  }

  const currentPageRecords = courseVersionPages[currentCourseId]?.records ?? []
  return currentPageRecords.some((version) => version.id === currentVersionId)
    ? ''
    : '当前查看版本不在本页列表中。'
})

const hasActiveCourseFilters = computed(
  () =>
    queryState.searchText.trim().length > 0 ||
    queryState.semester.length > 0 ||
    queryState.versionStatus !== 'all' ||
    queryState.completionState !== 'all' ||
    queryState.archiveState !== 'active',
)
const manualExpandedCourseIds = ref<string[]>([])
const expandedCourseIds = computed(() => {
  const visibleCourseIds = viewModel.value.courses.map((course) => course.id)

  if (hasActiveCourseFilters.value) {
    return visibleCourseIds
  }

  return Array.from(
    new Set(
      [queryState.selectedCourseId, ...manualExpandedCourseIds.value].filter(
        (courseId): courseId is string => courseId.length > 0 && visibleCourseIds.includes(courseId),
      ),
    ),
  )
})

watch(
  () => viewModel.value.courses.map((course) => course.id).join('|'),
  () => {
    const visibleCourseIds = viewModel.value.courses.map((course) => course.id)
    manualExpandedCourseIds.value = manualExpandedCourseIds.value.filter((courseId) =>
      visibleCourseIds.includes(courseId),
    )
  },
  { immediate: true },
)

watch(hasActiveCourseFilters, (isActive, wasActive) => {
  if (!isActive && wasActive) {
    manualExpandedCourseIds.value = []
  }
})

watch(
  () => [queryState.semester, queryState.versionStatus, queryState.archiveState].join('|'),
  () => {
    loadOutlineCoursePage()
  },
  { flush: 'post' },
)

watch(
  () => [
    expandedCourseIds.value.join('|'),
    activeEditorSection.value,
    createDraftSnapshot(draft.value),
    showVersionCreator.value || showCourseCreator.value ? 'creating' : 'idle',
    pendingArchive.value?.versionId ?? '',
  ],
  () => {
    updateOutlineScrollbars()
  },
  { flush: 'post' },
)

watch(
  () => `${viewModel.value.currentCourse?.id ?? ''}:${viewModel.value.currentVersion?.id ?? ''}`,
  () => {
    const currentVersion = viewModel.value.currentVersion
    activeEditorSection.value = 'basic-info'
    showVersionCreator.value = false
    showCourseCreator.value = false
    isEditing.value = false
    pendingSelection.value = null
    pendingArchive.value = null
    if (!currentVersion) {
      draft.value = createOutlineVersionDraft()
      savedSnapshot.value = createDraftSnapshot(draft.value)
      setStatusMessage('')
      return
    }

    draft.value = createOutlineVersionDraftFromVersion(currentVersion)
    savedSnapshot.value = createDraftSnapshot(draft.value)
    versionCreator.mode = 'copy'
    versionCreator.versionName = `${currentVersion.versionName} 副本`
    versionCreator.semester = currentVersion.semester
    versionCreator.note = `复制自 ${currentVersion.versionName}`
    setStatusMessage('')
  },
  { immediate: true },
)

const liveCompletion = computed<OutlineCompletionSummary>(() => validateOutlineVersionForExport(draft.value))
const canExport = computed(() => canExportOutlineVersion(liveCompletion.value))
const hasUnsavedChanges = computed(() => createDraftSnapshot(draft.value) !== savedSnapshot.value)
const assessmentTotal = computed(
  () =>
    draft.value.sections.assessment.usualPercentage +
    draft.value.sections.assessment.midtermPercentage +
    draft.value.sections.assessment.finalPercentage,
)

function createDraftSnapshot(versionDraft: typeof draft.value) {
  return JSON.stringify(versionDraft)
}

function createLocalId(prefix: string) {
  localIdSeed += 1
  return `${prefix}-${localIdSeed}`
}

function seedVersionCreator(mode: 'copy' | 'blank') {
  const currentVersion = viewModel.value.currentVersion
  versionCreator.mode = mode
  if (mode === 'blank') {
    versionCreator.versionName = ''
    versionCreator.semester = currentVersion?.semester ?? ''
    versionCreator.note = ''
    return
  }

  versionCreator.versionName = currentVersion ? `${currentVersion.versionName} 副本` : ''
  versionCreator.semester = currentVersion?.semester ?? ''
  versionCreator.note = currentVersion ? `复制自 ${currentVersion.versionName}` : ''
}

function setStatusMessage(message: string, nextUndoArchiveTarget: UndoArchiveTarget | null = null) {
  statusMessage.value = message
  undoArchiveTarget.value = nextUndoArchiveTarget
}

function dismissStatus() {
  statusVisible.value = false
  if (statusTimer) {
    clearTimeout(statusTimer)
    statusTimer = undefined
  }
}

function showTransientStatus() {
  statusVisible.value = true
  if (statusTimer) {
    clearTimeout(statusTimer)
  }
  statusTimer = setTimeout(() => {
    statusVisible.value = false
    statusTimer = undefined
  }, 3200)
}

async function loadOutlineCoursePage(message = '') {
  isLoading.value = true

  try {
    const response = await listOutlineCoursePage({
      keyword: queryState.searchText.trim(),
      semester: queryState.semester,
      versionStatus: queryState.versionStatus,
      completionState: queryState.completionState,
      archiveState: queryState.archiveState,
      page: page.value,
      pageSize: pageSize.value,
    })

    coursePageState.value = response

    const defaultQueryState = createDefaultOutlineWorkbenchQueryState(response, courseVersionPages)
    const hasSelectedCourse = response.records.some((course) => course.id === queryState.selectedCourseId)

    if (!hasSelectedCourse) {
      if (!currentCourseDetail.value || currentCourseDetail.value.id !== queryState.selectedCourseId) {
        queryState.selectedCourseId = defaultQueryState.selectedCourseId
      }
    }

    if (queryState.selectedCourseId && !courseVersionPages[queryState.selectedCourseId]) {
      await loadOutlineCourseVersions(queryState.selectedCourseId)
    }

    const selectedVersions = queryState.selectedCourseId ? courseVersionPages[queryState.selectedCourseId]?.records ?? [] : []
    const hasSelectedVersion = selectedVersions.some((version) => version.id === queryState.selectedVersionId)

    if (!hasSelectedVersion && (!currentVersionDetail.value || currentVersionDetail.value.id !== queryState.selectedVersionId)) {
      queryState.selectedVersionId = selectedVersions[0]?.id ?? ''
    }

    if (message) {
      setStatusMessage(message)
    }
    connectionStatus.value = ''
  } catch (error) {
    console.error(error)
    connectionStatus.value = 'offline'
    showTransientStatus()
  } finally {
    isLoading.value = false
  }
}

async function loadOutlineCourseVersions(courseId: string, requestedPage = 1) {
  if (!courseId) {
    return
  }

  loadingCourseIds.value = Array.from(new Set([...loadingCourseIds.value, courseId]))
  delete courseVersionErrors[courseId]

  try {
    const response = await listOutlineCourseVersions(courseId, {
      keyword: queryState.searchText.trim(),
      semester: queryState.semester,
      versionStatus: queryState.versionStatus,
      completionState: queryState.completionState,
      archiveState: queryState.archiveState,
      page: requestedPage,
      pageSize: courseVersionPageSizes[courseId] ?? 20,
    })
    courseVersionPages[courseId] = response
    courseVersionPageNumbers[courseId] = response.current
  } catch (error) {
    console.error(error)
    courseVersionErrors[courseId] = error instanceof Error ? error.message : '加载版本失败'
  } finally {
    loadingCourseIds.value = loadingCourseIds.value.filter((id) => id !== courseId)
  }
}

function handleCoursePageChange(nextPage: number) {
  page.value = nextPage
  loadOutlineCoursePage()
}

function handleCoursePageSizeChange(nextPageSize: number) {
  pageSize.value = nextPageSize
  page.value = 1
  loadOutlineCoursePage()
}

function isCourseExpanded(courseId: string) {
  return expandedCourseIds.value.includes(courseId)
}

function createOutlineScrollbar(container: HTMLElement | null) {
  if (!container) {
    return null
  }

  return new PerfectScrollbar(container, outlineScrollbarOptions)
}

async function initializeOutlineScrollbars() {
  await nextTick()

  courseTreeScrollbar = createOutlineScrollbar(courseTreeScrollRef.value)
  workspaceBodyScrollbar = createOutlineScrollbar(workspaceBodyScrollRef.value)
  updateOutlineScrollbars()
}

async function updateOutlineScrollbars() {
  await nextTick()

  courseTreeScrollbar?.update()
  workspaceBodyScrollbar?.update()
}

function destroyOutlineScrollbars() {
  courseTreeScrollbar?.destroy()
  workspaceBodyScrollbar?.destroy()
  courseTreeScrollbar = null
  workspaceBodyScrollbar = null
}

function toggleCourseGroup(courseId: string) {
  const course = viewModel.value.courses.find((item) => item.id === courseId)
  if (course?.versions.length === 0) {
    requestVersionSelection(courseId, '')
  }

  if (hasActiveCourseFilters.value) {
    return
  }

  if (queryState.selectedCourseId === courseId && isCourseExpanded(courseId)) {
    return
  }

  if (isCourseExpanded(courseId)) {
    manualExpandedCourseIds.value = manualExpandedCourseIds.value.filter((id) => id !== courseId)
    return
  }

  manualExpandedCourseIds.value = [...manualExpandedCourseIds.value, courseId]
  if (!courseVersionPages[courseId]) {
    loadOutlineCourseVersions(courseId)
  }
}

async function selectVersion(courseId: string, versionId: string) {
  queryState.selectedCourseId = courseId
  queryState.selectedVersionId = versionId
  currentCourseDetail.value = currentCourseDetail.value?.id === courseId
    ? currentCourseDetail.value
    : toCourseDetail(courseId)

  if (!versionId) {
    currentVersionDetail.value = undefined
    return
  }

  const cachedVersion = repository.getVersionDetail(versionId)
  if (cachedVersion) {
    currentVersionDetail.value = cachedVersion
    return
  }

  const detail = await getOutlineVersion(Number(versionId))
  repository.replaceVersionDetail(detail)
  currentVersionDetail.value = detail
}

function requestVersionSelection(courseId: string, versionId: string) {
  if (queryState.selectedCourseId === courseId && queryState.selectedVersionId === versionId) {
    return
  }

  if (isEditing.value && hasUnsavedChanges.value) {
    pendingSelection.value = { courseId, versionId }
    setStatusMessage('当前版本有未保存内容，可先保存草稿再切换。')
    return
  }

  selectVersion(courseId, versionId)
}

async function confirmPendingSelectionWithSave() {
  if (!pendingSelection.value) {
    return
  }

  const saved = await handleSaveDraft()
  if (!saved) {
    return
  }
  await selectVersion(pendingSelection.value.courseId, pendingSelection.value.versionId)
  pendingSelection.value = null
}

async function discardPendingSelection() {
  if (!pendingSelection.value) {
    return
  }

  await selectVersion(pendingSelection.value.courseId, pendingSelection.value.versionId)
  pendingSelection.value = null
  setStatusMessage('已放弃未保存修改并切换版本。')
}

function openBlankVersionCreator() {
  pendingArchive.value = null
  seedVersionCreator('blank')
  showVersionCreator.value = true
}

function openCopyVersionCreator() {
  pendingArchive.value = null
  seedVersionCreator('copy')
  showVersionCreator.value = true
}

function closeVersionCreator() {
  showVersionCreator.value = false
}

function openCourseCreator() {
  pendingArchive.value = null
  showVersionCreator.value = false
  courseCreator.title = ''
  courseCreator.instructor = ''
  courseCreator.department = ''
  showCourseCreator.value = true
}

function closeCourseCreator() {
  showCourseCreator.value = false
}

function handleResetFilters() {
  const defaults = createDefaultOutlineWorkbenchQueryState(coursePageState.value, courseVersionPages)
  queryState.searchText = defaults.searchText
  queryState.semester = defaults.semester
  queryState.versionStatus = defaults.versionStatus
  queryState.completionState = defaults.completionState
  queryState.archiveState = defaults.archiveState
  queryState.sortBy = defaults.sortBy
  manualExpandedCourseIds.value = []
  page.value = 1
}

async function handleSaveDraft() {
  const currentCourse = viewModel.value.currentCourse
  const currentVersion = viewModel.value.currentVersion
  if (!currentCourse || !currentVersion) {
    setStatusMessage('保存失败')
    return false
  }

  try {
    const savedVersion = await saveOutlineVersion(Number(currentVersion.id), draft.value)
    repository.saveVersionDetail(savedVersion)
    repository.upsertVersionSummary(currentCourse.id, {
      id: savedVersion.id,
      courseId: currentCourse.id,
      versionName: savedVersion.versionName,
      semester: savedVersion.semester,
      status: savedVersion.status,
      archiveState: savedVersion.archiveState,
      archivedAt: savedVersion.archivedAt,
      note: savedVersion.note,
      updatedBy: savedVersion.updatedBy,
      updatedAt: savedVersion.updatedAt,
      completionPercent: savedVersion.completionPercent,
      completionIssueCount: savedVersion.completionIssueCount,
      completionState: savedVersion.completionState,
    })
    currentVersionDetail.value = savedVersion
    syncCurrentCourseVersionPage(currentCourse.id)
    savedSnapshot.value = createDraftSnapshot(draft.value)
    setStatusMessage('保存成功')
    return true
  } catch (error) {
    console.error(error)
    setStatusMessage('保存失败')
    return false
  }
}

async function handleEditAction() {
  if (!viewModel.value.currentVersion) {
    return
  }

  if (!isEditing.value) {
    isEditing.value = true
    setStatusMessage('')
    return
  }

  const saved = await handleSaveDraft()
  if (!saved) {
    return
  }

  isEditing.value = false
}

async function handleCreateVersion() {
  const currentCourse = viewModel.value.currentCourse
  const currentVersion = viewModel.value.currentVersion
  if (!currentCourse || versionCreator.versionName.trim().length === 0) {
    return
  }

  if (versionCreator.mode === 'copy' && !currentVersion && currentCourse.versions.length === 0) {
    setStatusMessage('当前课程暂无可复制版本')
    return
  }

  try {
    const createdVersion =
      versionCreator.mode === 'blank'
        ? await createOutlineVersion({
          courseId: currentCourse.id,
          versionName: versionCreator.versionName.trim(),
          semester: versionCreator.semester.trim(),
          note: versionCreator.note.trim(),
          createdBy: props.currentAdminName,
          updatedBy: draft.value.updatedBy || currentCourse.instructor,
        })
        : await duplicateOutlineVersion({
          courseId: currentCourse.id,
          sourceVersionId: currentVersion?.id ?? currentCourse.versions[0]!.id,
          versionName: versionCreator.versionName.trim(),
          semester: versionCreator.semester.trim() || currentVersion?.semester || '',
          note: versionCreator.note.trim(),
          createdBy: props.currentAdminName,
          updatedBy: draft.value.updatedBy || currentCourse.instructor,
        })

    repository.replaceVersionDetail(createdVersion)
    repository.upsertVersionSummary(currentCourse.id, {
      id: createdVersion.id,
      courseId: currentCourse.id,
      versionName: createdVersion.versionName,
      semester: createdVersion.semester,
      status: createdVersion.status,
      archiveState: createdVersion.archiveState,
      archivedAt: createdVersion.archivedAt,
      note: createdVersion.note,
      updatedBy: createdVersion.updatedBy,
      updatedAt: createdVersion.updatedAt,
      completionPercent: createdVersion.completionPercent,
      completionIssueCount: createdVersion.completionIssueCount,
      completionState: createdVersion.completionState,
    })
    currentVersionDetail.value = createdVersion
    syncCurrentCourseVersionPage(currentCourse.id)
    queryState.archiveState = 'active'
    queryState.selectedCourseId = currentCourse.id
    queryState.selectedVersionId = createdVersion.id
    currentCourseDetail.value = currentCourse
    closeVersionCreator()
    setStatusMessage(
      versionCreator.mode === 'blank'
        ? `已创建空白版本 ${createdVersion.versionName}`
        : `已复制为 ${createdVersion.versionName}`,
    )
  } catch (error) {
    console.error(error)
    setStatusMessage(error instanceof Error ? error.message : '创建版本失败')
  }
}

async function handleCreateCourse() {
  if (!courseCreator.title.trim() || !courseCreator.instructor.trim() || !courseCreator.department.trim()) {
    return
  }

  isCreatingCourse.value = true

  try {
    const createdCourse = await createOutlineCourse({
      title: courseCreator.title.trim(),
      instructor: courseCreator.instructor.trim(),
      department: courseCreator.department.trim(),
    })

    currentCourseDetail.value = createdCourse
    currentVersionDetail.value = undefined
    queryState.selectedCourseId = createdCourse.id
    queryState.selectedVersionId = ''
    page.value = 1
    await loadOutlineCoursePage(`已创建课程 ${courseCreator.title.trim()}`)
    closeCourseCreator()
  } catch (error) {
    console.error(error)
    setStatusMessage(error instanceof Error ? error.message : '创建课程失败')
  } finally {
    isCreatingCourse.value = false
  }
}

function requestArchiveVersion(courseId: string, versionId: string, versionLabel: string) {
  closeVersionCreator()
  pendingArchive.value = {
    courseId,
    versionId,
    versionLabel,
  }
}

function cancelArchiveVersion() {
  pendingArchive.value = null
}

function handleWindowKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && pendingArchive.value) {
    cancelArchiveVersion()
    return
  }
  if (event.key === 'Escape' && showCourseCreator.value) {
    closeCourseCreator()
    return
  }
  if (event.key === 'Escape' && showVersionCreator.value) {
    closeVersionCreator()
  }
}

async function confirmArchiveVersion() {
  if (!pendingArchive.value) {
    return
  }

  const archiveTarget = pendingArchive.value
  try {
    await archiveOutlineVersion(Number(archiveTarget.versionId))
    const archived = repository.archiveOutlineVersion(archiveTarget.courseId, archiveTarget.versionId)
    repository.archiveVersionSummary(archiveTarget.courseId, archiveTarget.versionId, archived.archivedAt ?? '')
    currentVersionDetail.value = archived.id === currentVersionDetail.value?.id ? archived : currentVersionDetail.value
    syncCurrentCourseVersionPage(archiveTarget.courseId)
    pendingArchive.value = null
    queryState.archiveState = 'active'
    setStatusMessage(`已归档 ${archived.versionName}`, {
      courseId: archiveTarget.courseId,
      versionId: archiveTarget.versionId,
      versionLabel: archived.versionName,
    })
  } catch (error) {
    console.error(error)
    setStatusMessage(error instanceof Error ? error.message : '归档失败')
  }
}

async function undoArchivedVersion() {
  if (!undoArchiveTarget.value) {
    return
  }

  try {
    await restoreOutlineVersion(Number(undoArchiveTarget.value.versionId))
    const restored = repository.restoreOutlineVersion(undoArchiveTarget.value.courseId, undoArchiveTarget.value.versionId)
    repository.restoreVersionSummary(undoArchiveTarget.value.courseId, undoArchiveTarget.value.versionId)
    currentVersionDetail.value = restored.id === currentVersionDetail.value?.id ? restored : currentVersionDetail.value
    syncCurrentCourseVersionPage(undoArchiveTarget.value.courseId)
    queryState.archiveState = 'active'
    setStatusMessage(`已恢复 ${restored.versionName}`)
  } catch (error) {
    console.error(error)
    setStatusMessage(error instanceof Error ? error.message : '恢复失败')
  }
}

async function handleRestoreVersion(courseId: string, versionId: string) {
  try {
    await restoreOutlineVersion(Number(versionId))
    const restored = repository.restoreOutlineVersion(courseId, versionId)
    repository.restoreVersionSummary(courseId, versionId)
    currentVersionDetail.value = restored.id === currentVersionDetail.value?.id ? restored : currentVersionDetail.value
    syncCurrentCourseVersionPage(courseId)
    queryState.archiveState = 'all'
    setStatusMessage(`已恢复 ${restored.versionName}`)
  } catch (error) {
    console.error(error)
    setStatusMessage(error instanceof Error ? error.message : '恢复失败')
  }
}

async function handleExportVersion() {
  const currentCourse = viewModel.value.currentCourse
  const currentVersion = viewModel.value.currentVersion
  if (!currentCourse || !currentVersion) {
    return
  }

  if (!canExport.value) {
    setStatusMessage('请先补全缺项后再导出')
    return
  }

  const saved = await handleSaveDraft()
  if (!saved) {
    return
  }

  savedSnapshot.value = createDraftSnapshot(draft.value)
  const exported = repository.exportOutlineVersion(currentCourse.id, currentVersion.id)
  if (!exported.document) {
    setStatusMessage('导出失败')
    return
  }

  setStatusMessage('已生成打印稿')
  if (typeof window !== 'undefined') {
    openPrintWindow(exported.document)
  }
}

function updateMajors(value: string) {
  draft.value.sections.basicInfo.majors = value
    .split(/[，,]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

function addGoal(kind: 'knowledge' | 'ability') {
  const target =
    kind === 'knowledge' ? draft.value.sections.knowledgeGoals : draft.value.sections.abilityGoals
  target.push({
    id: createLocalId(`goal-${kind}`),
    text: '',
  })
}

function removeGoal(kind: 'knowledge' | 'ability', goalId: string) {
  const target =
    kind === 'knowledge' ? draft.value.sections.knowledgeGoals : draft.value.sections.abilityGoals
  const index = target.findIndex((goal) => goal.id === goalId)
  if (index >= 0) {
    target.splice(index, 1)
  }
}

function addScheduleItem() {
  draft.value.sections.schedule.push({
    id: createLocalId('schedule'),
    weekLabel: '',
    topic: '',
    hours: 2,
    teachingMethod: '',
    notes: '',
    chapterLabel: '',
  })
}

function removeScheduleItem(itemId: string) {
  const index = draft.value.sections.schedule.findIndex((item) => item.id === itemId)
  if (index >= 0) {
    draft.value.sections.schedule.splice(index, 1)
  }
}

function toggleTeachingMethod(option: string) {
  const selected = draft.value.sections.teachingMethods.selected
  const index = selected.indexOf(option)
  if (index >= 0) {
    selected.splice(index, 1)
    return
  }

  selected.push(option)
}

function addAssessmentItem() {
  draft.value.sections.assessment.usualItems.push({
    id: createLocalId('assessment'),
    label: '',
    percentage: 0,
  })
}

function removeAssessmentItem(itemId: string) {
  const index = draft.value.sections.assessment.usualItems.findIndex((item) => item.id === itemId)
  if (index >= 0) {
    draft.value.sections.assessment.usualItems.splice(index, 1)
  }
}

function addMaterial(kind: 'primary' | 'references') {
  draft.value.sections.materials[kind].push({
    id: createLocalId(kind),
    title: '',
    author: '',
    source: '',
    note: '',
  })
}

function removeMaterial(kind: 'primary' | 'references', itemId: string) {
  const list = draft.value.sections.materials[kind]
  const index = list.findIndex((item) => item.id === itemId)
  if (index >= 0) {
    list.splice(index, 1)
  }
}

function statusLabel(status: 'draft' | 'final') {
  return status === 'final' ? '定稿' : '草稿'
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleWindowKeydown)
  }
  loadOutlineCoursePage()
  initializeOutlineScrollbars()
})

onBeforeUnmount(() => {
  dismissStatus()
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleWindowKeydown)
  }
  destroyOutlineScrollbars()
})

function renderPrintHtml(documentModel: {
  title: string
  versionLabel: string
  metaLines: string[]
  sections: Array<{ label: string; lines: string[] }>
}) {
  const escapeHtml = (value: string) =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const sectionHtml = documentModel.sections
    .map(
      (section) => `
        <section class="print-section">
          <h2>${escapeHtml(section.label)}</h2>
          ${section.lines.map((line) => `<p>${escapeHtml(line)}</p>`).join('')}
        </section>
      `,
    )
    .join('')

  return `<!DOCTYPE html>
  <html lang="zh-CN">
    <head>
      <meta charset="UTF-8" />
      <title>${escapeHtml(documentModel.title)}</title>
      <style>
        body { font-family: "Songti SC", "Noto Serif SC", serif; margin: 40px; color: #1c1b19; line-height: 1.8; }
        h1 { font-size: 28px; margin-bottom: 8px; }
        h2 { font-size: 18px; margin-top: 24px; margin-bottom: 8px; border-bottom: 1px solid #d8d4ca; padding-bottom: 6px; }
        .meta p { margin: 4px 0; color: #5a554c; }
        .print-section p { margin: 6px 0; }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(documentModel.title)}</h1>
      <div class="meta">
        <p>${escapeHtml(documentModel.versionLabel)}</p>
        ${documentModel.metaLines.map((line) => `<p>${escapeHtml(line)}</p>`).join('')}
      </div>
      ${sectionHtml}
    </body>
  </html>`
}

function openPrintWindow(documentModel: {
  title: string
  versionLabel: string
  metaLines: string[]
  sections: Array<{ label: string; lines: string[] }>
}) {
  const printWindow = window.open('', '_blank', 'noopener,noreferrer')
  if (!printWindow) {
    return
  }

  printWindow.document.write(renderPrintHtml(documentModel))
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}

function toCourseDetail(courseId: string): OutlineCourseRecord | undefined {
  const summary = coursePageState.value.records.find((course) => course.id === courseId)
  if (!summary) {
    return currentCourseDetail.value?.id === courseId ? currentCourseDetail.value : undefined
  }

  return {
    id: summary.id,
    title: summary.title,
    instructor: summary.instructor,
    department: summary.department,
    versions: [],
  }
}

function syncCurrentCourseVersionPage(courseId: string) {
  const summaries = repository.listVersionSummaries(courseId)
  if (summaries.length === 0 && !courseVersionPages[courseId]) {
    return
  }

  const currentPage = courseVersionPages[courseId]?.current ?? 1
  const currentSize = courseVersionPages[courseId]?.size ?? 20
  courseVersionPages[courseId] = {
    records: summaries.slice(0, currentSize),
    total: Math.max(summaries.length, courseVersionPages[courseId]?.total ?? 0),
    size: currentSize,
    current: currentPage,
    pages: Math.max(1, Math.ceil(Math.max(summaries.length, 1) / currentSize)),
  }
}
</script>

<template>
  <section class="outline-management workbench-surface">
      <header class="outline-management__head">
        <div class="outline-management__heading">
          <h2>{{ props.section.title }}</h2>
        </div>
        <div
          v-if="connectionStatus === 'offline'"
          class="outline-management__status-anchor"
          @mouseenter="statusVisible = true"
          @mouseleave="dismissStatus"
        >
          <button class="outline-management__status-pill" type="button" @click="statusVisible = !statusVisible">
            连接异常
          </button>
          <div v-if="statusVisible" class="outline-management__status-popover">
            后端连接失败，当前显示本地大纲样例。
          </div>
        </div>
      </header>

    <section class="outline-query-bar">
      <label class="outline-query-field outline-query-field--search">
        <input v-model="queryState.searchText" type="search" placeholder="搜索课程、版本或备注" />
      </label>

      <label class="outline-query-field">
        <WorkbenchSelect
          v-model="queryState.semester"
          aria-label="按学期筛选"
          :options="[
            { value: '', label: '全部学期' },
            { value: '2026春', label: '2026春' },
            { value: '2026秋', label: '2026秋' },
            { value: '2025秋', label: '2025秋' },
          ]"
        />
      </label>

      <label class="outline-query-field">
        <WorkbenchSelect
          v-model="queryState.versionStatus"
          aria-label="按版本状态筛选"
          :options="[
            { value: 'all', label: '全部状态' },
            { value: 'draft', label: '草稿' },
            { value: 'final', label: '定稿' },
          ]"
        />
      </label>

      <label class="outline-query-field">
        <WorkbenchSelect
          v-model="queryState.completionState"
          aria-label="按完整度筛选"
          :options="[
            { value: 'all', label: '全部完整度' },
            { value: 'needs-completion', label: '待补全' },
            { value: 'nearly-complete', label: '接近完成' },
            { value: 'complete', label: '已完成' },
          ]"
        />
      </label>

      <label class="outline-query-field">
        <WorkbenchSelect
          v-model="queryState.archiveState"
          aria-label="按归档状态筛选"
          :options="[
            { value: 'all', label: '全部版本' },
            { value: 'active', label: '进行中' },
            { value: 'archived', label: '已归档' },
          ]"
        />
      </label>

      <button class="outline-toolbar-button" type="button" @click="handleResetFilters">重置</button>
      <button class="outline-toolbar-button primary" type="button" @click="openBlankVersionCreator">
        新建版本
      </button>
    </section>

    <div class="outline-management__body">
      <aside ref="courseTreeScrollRef" class="outline-course-tree">
        <button
          class="outline-course-create-button"
          type="button"
          @click="openCourseCreator"
        >
          + 新建课程
        </button>
        <article
          v-for="course in viewModel.courses"
          :key="course.id"
          class="outline-course-group"
          :class="{ current: course.current, collapsed: !isCourseExpanded(course.id) }"
        >
          <button
            class="outline-course-group__head"
            type="button"
            :aria-expanded="isCourseExpanded(course.id)"
            @click="toggleCourseGroup(course.id)"
          >
            <span class="outline-course-group__summary">
              <strong>{{ course.title }}</strong>
              <small>{{ course.instructor }} · 命中 {{ course.matchedVersionCount }} / 共 {{ course.totalVersionCount }} 个版本</small>
            </span>
            <span class="outline-course-group__chevron" aria-hidden="true">⌄</span>
          </button>

          <div
            class="outline-course-group__versions-shell"
            :class="{ expanded: isCourseExpanded(course.id), collapsed: !isCourseExpanded(course.id) }"
            :aria-hidden="!isCourseExpanded(course.id)"
          >
            <div class="outline-course-group__versions-body">
              <p v-if="loadingCourseIds.includes(course.id)" class="outline-course-group__hint">正在加载版本...</p>
              <p v-else-if="courseVersionErrors[course.id]" class="outline-course-group__hint error">
                {{ courseVersionErrors[course.id] }}
              </p>
              <p v-else-if="course.versions.length === 0" class="outline-course-group__hint">
                当前筛选下没有可显示的版本。
              </p>
              <div class="outline-course-group__versions">
                <article
                  v-for="version in course.versions"
                  :key="version.id"
                  class="outline-version-row"
                  :class="{ current: version.current, archived: version.archiveState === 'archived' }"
                >
                  <button
                    class="outline-version-row__identity"
                    type="button"
                    @click="requestVersionSelection(course.id, version.id)"
                  >
                    <span class="outline-version-row__title">
                      {{ version.versionName }}
                      <small>{{ version.semester }}</small>
                    </span>
                  </button>

                  <div class="outline-version-row__status-line">
                    <span class="outline-version-row__meta">
                      <span class="outline-status-chip">{{ statusLabel(version.status) }}</span>
                      <span class="outline-status-chip subtle">{{ version.completionPercent }}%</span>
                    </span>

                    <div class="outline-version-row__actions">
                      <div v-if="version.archiveState === 'active'" class="outline-version-row__archive-action">
                        <button
                          class="outline-inline-button"
                          :class="{ 'archive-pending': pendingArchive?.courseId === course.id && pendingArchive?.versionId === version.id }"
                          type="button"
                          @click.stop="requestArchiveVersion(course.id, version.id, version.versionName)"
                        >
                          归档
                        </button>
                      </div>
                      <button
                        v-else
                        class="outline-inline-button"
                        type="button"
                        @click.stop="handleRestoreVersion(course.id, version.id)"
                      >
                        恢复使用
                      </button>
                    </div>
                  </div>

                </article>
              </div>
            </div>
          </div>
        </article>
        <footer class="outline-course-tree__pagination">
          <WorkbenchTablePagination
            :pagination="viewModel.pagination"
            :page-size="pageSize"
            :page-size-options="pageSizeOptions"
            show-quick-jumper
            @page-change="handleCoursePageChange"
            @page-size-change="handleCoursePageSizeChange"
          />
        </footer>
      </aside>

      <section class="outline-workspace">
        <div
          class="outline-workspace__content"
          :class="{ 'archive-blurred': !!pendingArchive, 'creator-mode-blurred': showVersionCreator || showCourseCreator }"
        >
          <div class="outline-workspace__top">
          <section v-if="pendingSelection" class="outline-inline-notice">
            <p>当前版本有未保存内容，可先保存草稿再切换。</p>
            <div class="outline-inline-notice__actions">
              <button class="outline-toolbar-button primary" type="button" @click="confirmPendingSelectionWithSave">
                保存并切换
              </button>
              <button class="outline-toolbar-button" type="button" @click="discardPendingSelection">直接切换</button>
            </div>
          </section>

          <header class="outline-workspace__summary">
            <div class="outline-workspace__copy">
              <h3>{{ viewModel.toolbar.courseLabel }}</h3>
              <p>{{ viewModel.toolbar.versionLabel }} · {{ viewModel.toolbar.statusLabel }} - {{ viewModel.toolbar.updatedLabel }}</p>
              <small>{{ liveCompletion.percent }}% · {{ liveCompletion.completedSectionCount }}/{{ liveCompletion.totalSectionCount }} 分区可导出 · {{ liveCompletion.issues[0]?.message || '当前版本已满足导出要求' }}</small>
            </div>

            <div class="outline-workspace__actions">
              <button class="outline-toolbar-button" type="button" @click="openCopyVersionCreator">
                复制为新版本
              </button>
              <button class="outline-toolbar-button primary" type="button" @click="handleExportVersion">导出 / 打印</button>
            </div>
          </header>

          <div class="outline-workspace__feedback">
            <p v-if="statusMessage" class="outline-status-message">
              <span>{{ statusMessage }}</span>
              <button
                v-if="undoArchiveTarget"
                class="outline-status-message__action"
                type="button"
                @click="undoArchivedVersion"
              >
                撤销
              </button>
            </p>
            <p v-if="!viewModel.currentVersionMatchesFilters" class="outline-status-message">
              当前正在查看的版本不在筛选结果中。
            </p>
            <p v-if="currentVersionPageHint" class="outline-status-message">
              {{ currentVersionPageHint }}
            </p>
          </div>

          <nav class="outline-section-tabs">
            <button
              v-for="item in viewModel.directory"
              :key="item.id"
              class="outline-section-tab"
              :class="{ current: activeEditorSection === item.id, complete: item.complete }"
              type="button"
              @click="activeEditorSection = item.id"
            >
              {{ item.label }}
            </button>
            <button
              class="outline-section-tab outline-section-tab--action"
              :class="{ current: isEditing }"
              type="button"
              @click="handleEditAction"
            >
              {{ isEditing ? '保存' : '修改' }}
            </button>
          </nav>
          </div>

          <div ref="workspaceBodyScrollRef" class="outline-workspace__body">
            <div v-if="isLoading && viewModel.courses.length === 0" class="outline-empty-state">
              <div class="outline-empty-state__icon">⏳</div>
              <h3>正在加载大纲数据...</h3>
              <p>正在尝试连接后端服务，请稍候。</p>
            </div>

            <div v-else-if="!viewModel.currentVersion && viewModel.currentCourse" class="outline-empty-state">
              <div class="outline-empty-state__icon">📋</div>
              <h3>暂无大纲版本</h3>
              <p>此课程尚未创建任何大纲版本。点击下方按钮创建第一个版本。</p>
              <button class="outline-toolbar-button primary" type="button" @click="openBlankVersionCreator">
                新建版本
              </button>
            </div>

            <section v-else class="outline-editor-panel">
            <fieldset class="outline-editor-panel__fieldset" :disabled="!isEditing">
          <div v-if="activeEditorSection === 'basic-info'" class="outline-form-grid">
            <label class="outline-field">
              <span>课程名</span>
              <input v-model="draft.sections.basicInfo.courseName" type="text" />
            </label>
            <label class="outline-field">
              <span>授课老师</span>
              <input v-model="draft.sections.basicInfo.instructor" type="text" />
            </label>
            <label class="outline-field">
              <span>学分</span>
              <input v-model.number="draft.sections.basicInfo.credits" type="number" min="0" />
            </label>
            <label class="outline-field">
              <span>学时</span>
              <input v-model.number="draft.sections.basicInfo.hours" type="number" min="0" />
            </label>
            <label class="outline-field wide">
              <span>适用专业</span>
              <input
                :value="draft.sections.basicInfo.majors.join('，')"
                type="text"
                placeholder="多个专业请用逗号分隔"
                @input="updateMajors(($event.target as HTMLInputElement).value)"
              />
            </label>
          </div>

          <div v-else-if="activeEditorSection === 'goals'" class="outline-goals-grid">
            <section class="outline-goal-group">
              <header class="outline-subsection__head">
                <strong>知识目标</strong>
                <button v-if="isEditing" class="outline-inline-button" type="button" @click="addGoal('knowledge')">新增</button>
              </header>
              <p v-if="draft.sections.knowledgeGoals.length === 0" class="outline-group-empty-state">
                暂未添加知识目标
              </p>
              <article v-for="goal in draft.sections.knowledgeGoals" :key="goal.id" class="outline-goal-item">
                <textarea v-model="goal.text" rows="3"></textarea>
                <button
                  v-if="isEditing"
                  class="outline-inline-button danger"
                  type="button"
                  @click="removeGoal('knowledge', goal.id)"
                >
                  删除
                </button>
              </article>
            </section>

            <section class="outline-goal-group">
              <header class="outline-subsection__head">
                <strong>能力目标</strong>
                <button v-if="isEditing" class="outline-inline-button" type="button" @click="addGoal('ability')">新增</button>
              </header>
              <p v-if="draft.sections.abilityGoals.length === 0" class="outline-group-empty-state">
                暂未添加能力目标
              </p>
              <article v-for="goal in draft.sections.abilityGoals" :key="goal.id" class="outline-goal-item">
                <textarea v-model="goal.text" rows="3"></textarea>
                <button
                  v-if="isEditing"
                  class="outline-inline-button danger"
                  type="button"
                  @click="removeGoal('ability', goal.id)"
                >
                  删除
                </button>
              </article>
            </section>
          </div>

          <div v-else-if="activeEditorSection === 'schedule'" class="outline-subsection">
            <header class="outline-subsection__head">
              <strong>周次进度</strong>
              <button v-if="isEditing" class="outline-inline-button" type="button" @click="addScheduleItem">新增周次</button>
            </header>
            <table class="outline-schedule-table">
              <thead>
                <tr>
                  <th>周次</th>
                  <th>教学内容</th>
                  <th>学时</th>
                  <th>教学方式</th>
                  <th>备注</th>
                  <th v-if="isEditing"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in draft.sections.schedule" :key="item.id">
                  <td><input v-model="item.weekLabel" type="text" /></td>
                  <td><input v-model="item.topic" type="text" /></td>
                  <td><input v-model.number="item.hours" type="number" min="0" /></td>
                  <td><input v-model="item.teachingMethod" type="text" /></td>
                  <td><input v-model="item.notes" type="text" /></td>
                  <td v-if="isEditing">
                    <button
                      v-if="isEditing"
                      class="outline-inline-button danger"
                      type="button"
                      @click="removeScheduleItem(item.id)"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else-if="activeEditorSection === 'methods'" class="outline-subsection">
            <div v-if="isEditing" class="outline-method-tags">
              <button
                v-for="option in viewModel.teachingMethodOptions"
                :key="option"
                class="outline-method-tag"
                :class="{ selected: draft.sections.teachingMethods.selected.includes(option) }"
                type="button"
                @click="toggleTeachingMethod(option)"
              >
                {{ option }}
              </button>
            </div>
            <div v-else class="outline-method-tags outline-method-tags--readonly">
              <span
                v-for="option in draft.sections.teachingMethods.selected"
                :key="option"
                class="outline-method-tag selected"
              >
                {{ option }}
              </span>
              <span v-if="draft.sections.teachingMethods.selected.length === 0" class="outline-method-tag">
                暂无教学方式
              </span>
            </div>

            <label class="outline-field">
              <span>补充说明</span>
              <textarea v-model="draft.sections.teachingMethods.notes" rows="4"></textarea>
            </label>
          </div>

          <div v-else-if="activeEditorSection === 'assessment'" class="outline-subsection">
            <header class="outline-subsection__head">
              <strong>考核结构</strong>
              <span class="outline-assessment-total" :class="{ invalid: assessmentTotal !== 100 }">
                总计 {{ assessmentTotal }}%
              </span>
            </header>

            <div class="outline-form-grid">
              <label class="outline-field">
                <span>平时比例</span>
                <input v-model.number="draft.sections.assessment.usualPercentage" type="number" min="0" max="100" />
              </label>
              <label class="outline-field">
                <span>期中比例</span>
                <input v-model.number="draft.sections.assessment.midtermPercentage" type="number" min="0" max="100" />
              </label>
              <label class="outline-field">
                <span>期末比例</span>
                <input v-model.number="draft.sections.assessment.finalPercentage" type="number" min="0" max="100" />
              </label>
            </div>

            <div class="outline-subsection__list">
              <article
                v-for="item in draft.sections.assessment.usualItems"
                :key="item.id"
                class="outline-inline-row"
              >
                <input v-model="item.label" type="text" />
                <input v-model.number="item.percentage" type="number" min="0" max="100" />
                <button
                  v-if="isEditing"
                  class="outline-inline-button danger"
                  type="button"
                  @click="removeAssessmentItem(item.id)"
                >
                  删除
                </button>
              </article>
            </div>

            <button v-if="isEditing" class="outline-inline-button" type="button" @click="addAssessmentItem">新增项</button>
          </div>

          <div v-else class="outline-materials-grid">
            <section class="outline-material-group">
              <header class="outline-subsection__head">
                <strong>主教材</strong>
                <button v-if="isEditing" class="outline-inline-button" type="button" @click="addMaterial('primary')">新增</button>
              </header>
              <p v-if="draft.sections.materials.primary.length === 0" class="outline-group-empty-state">
                暂未添加主教材
              </p>
              <article v-for="item in draft.sections.materials.primary" :key="item.id" class="outline-material-item">
                <input v-model="item.title" type="text" placeholder="教材名称" />
                <input v-model="item.author" type="text" placeholder="作者" />
                <input v-model="item.source" type="text" placeholder="出版社 / 来源" />
                <button
                  v-if="isEditing"
                  class="outline-inline-button danger"
                  type="button"
                  @click="removeMaterial('primary', item.id)"
                >
                  删除
                </button>
              </article>
            </section>

            <section class="outline-material-group">
              <header class="outline-subsection__head">
                <strong>参考资料</strong>
                <button v-if="isEditing" class="outline-inline-button" type="button" @click="addMaterial('references')">新增</button>
              </header>
              <p v-if="draft.sections.materials.references.length === 0" class="outline-group-empty-state">
                暂未添加参考资料
              </p>
              <article
                v-for="item in draft.sections.materials.references"
                :key="item.id"
                class="outline-material-item"
              >
                <input v-model="item.title" type="text" placeholder="资料名称" />
                <input v-model="item.author" type="text" placeholder="作者" />
                <input v-model="item.source" type="text" placeholder="来源" />
                <button
                  v-if="isEditing"
                  class="outline-inline-button danger"
                  type="button"
                  @click="removeMaterial('references', item.id)"
                >
                  删除
                </button>
              </article>
            </section>
          </div>
            </fieldset>
            </section>
          </div>
        </div>

        <div v-if="pendingArchive" class="outline-archive-mode">
          <button
            class="outline-archive-mode__scrim"
            type="button"
            aria-label="取消归档模式"
            @click="cancelArchiveVersion"
          ></button>
          <section class="outline-archive-mode__panel">
            <p class="outline-archive-mode__eyebrow">归档模式</p>
            <h3>确认归档 {{ pendingArchive.versionLabel }}</h3>
            <p>归档不会删除内容，只会从默认工作列表中收起该版本。</p>
            <div class="outline-archive-mode__actions">
              <button class="outline-toolbar-button primary" type="button" @click.stop="confirmArchiveVersion">
                确认归档
              </button>
              <button class="outline-toolbar-button" type="button" @click.stop="cancelArchiveVersion">取消</button>
            </div>
          </section>
        </div>

        <div v-if="showVersionCreator" class="outline-version-creator-mode">
          <button
            class="outline-version-creator-mode__scrim"
            type="button"
            aria-label="取消版本创建模式"
            @click="closeVersionCreator"
          ></button>
          <section class="outline-version-creator-mode__panel">
            <p class="outline-version-creator-mode__eyebrow">版本创建模式</p>
            <h3>{{ versionCreator.mode === 'blank' ? '创建新版本' : '复制为新版本' }}</h3>
            <p>{{ versionCreator.mode === 'blank' ? '创建一个新的课程大纲版本。' : `复制自 ${viewModel.toolbar.versionLabel}` }}</p>

            <div class="outline-version-creator-form">
              <label class="outline-field">
                <span>创建方式</span>
                <WorkbenchSelect
                  v-model="versionCreator.mode"
                  aria-label="选择创建方式"
                  :options="[
                    { value: 'copy', label: '复制当前版本' },
                    { value: 'blank', label: '空白版本' },
                  ]"
                />
              </label>
              <label class="outline-field">
                <span>版本名称</span>
                <input v-model="versionCreator.versionName" type="text" />
              </label>
              <label class="outline-field">
                <span>学期</span>
                <input v-model="versionCreator.semester" type="text" />
              </label>
              <label class="outline-field wide">
                <span>备注</span>
                <input v-model="versionCreator.note" type="text" />
              </label>
            </div>

            <div class="outline-version-creator-mode__actions">
              <button class="outline-toolbar-button primary" type="button" @click.stop="handleCreateVersion">
                创建版本
              </button>
              <button class="outline-toolbar-button" type="button" @click.stop="closeVersionCreator">取消</button>
            </div>
          </section>
        </div>

        <div v-if="showCourseCreator" class="outline-version-creator-mode">
          <button
            class="outline-version-creator-mode__scrim"
            type="button"
            aria-label="取消课程创建模式"
            @click="closeCourseCreator"
          ></button>
          <section class="outline-version-creator-mode__panel">
            <p class="outline-version-creator-mode__eyebrow">课程创建模式</p>
            <h3>创建新课程</h3>
            <p>创建一个新的课程，随后可在此课程下新建大纲版本。</p>

            <div class="outline-version-creator-form">
              <label class="outline-field">
                <span>课程名称</span>
                <input
                  v-model="courseCreator.title"
                  type="text"
                  :disabled="isCreatingCourse"
                  @keydown.enter.prevent="handleCreateCourse"
                />
              </label>
              <label class="outline-field">
                <span>授课教师</span>
                <input
                  v-model="courseCreator.instructor"
                  type="text"
                  :disabled="isCreatingCourse"
                  @keydown.enter.prevent="handleCreateCourse"
                />
              </label>
              <label class="outline-field wide">
                <span>教研室</span>
                <input
                  v-model="courseCreator.department"
                  type="text"
                  :disabled="isCreatingCourse"
                  @keydown.enter.prevent="handleCreateCourse"
                />
              </label>
            </div>

            <div class="outline-version-creator-mode__actions">
              <button
                class="outline-toolbar-button primary"
                type="button"
                :disabled="isCreatingCourse"
                @click.stop="handleCreateCourse"
              >
                确认创建
              </button>
              <button
                class="outline-toolbar-button"
                type="button"
                :disabled="isCreatingCourse"
                @click.stop="closeCourseCreator"
              >
                取消
              </button>
            </div>
          </section>
        </div>
      </section>
    </div>
  </section>
</template>
