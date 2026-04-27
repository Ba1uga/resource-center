<script setup lang="ts">
import '../styles/outline-workbench.css'

import { computed, reactive, ref, watch } from 'vue'

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
  createOutlineWorkbenchViewModel,
} from '@/features/resource-center/workbench/outline/model/outline-workbench.view-model.ts'

import type {
  OutlineCompletionSummary,
  OutlineSectionId,
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

const repository = createOutlineWorkbenchRepository()
const queryState = reactive(createDefaultOutlineWorkbenchQueryState(repository.listCourses()))
const dataVersion = ref(0)
const draft = ref(createOutlineVersionDraft())
const activeEditorSection = ref<OutlineSectionId>('basic-info')
const showVersionCreator = ref(false)
const versionCreator = reactive({
  mode: 'copy' as 'copy' | 'blank',
  versionName: '',
  semester: '',
  note: '',
})
const statusMessage = ref('')
const savedSnapshot = ref('')
const pendingSelection = ref<PendingVersionSelection | null>(null)
const pendingArchive = ref<PendingArchiveTarget | null>(null)
const isEditing = ref(false)

let localIdSeed = 0

const viewModel = computed(() => {
  dataVersion.value

  return createOutlineWorkbenchViewModel({
    courses: repository.listCourses(),
    queryState,
  })
})

watch(
  () => `${viewModel.value.currentCourse?.id ?? ''}:${viewModel.value.currentVersion?.id ?? ''}`,
  () => {
    const currentVersion = viewModel.value.currentVersion
    if (!currentVersion) {
      draft.value = createOutlineVersionDraft()
      savedSnapshot.value = createDraftSnapshot(draft.value)
      return
    }

    draft.value = createOutlineVersionDraftFromVersion(currentVersion)
    savedSnapshot.value = createDraftSnapshot(draft.value)
    versionCreator.mode = 'copy'
    versionCreator.versionName = `${currentVersion.versionName} 副本`
    versionCreator.semester = currentVersion.semester
    versionCreator.note = `复制自 ${currentVersion.versionName}`
    activeEditorSection.value = 'basic-info'
    showVersionCreator.value = false
    isEditing.value = false
    statusMessage.value = ''
    pendingSelection.value = null
    pendingArchive.value = null
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

function selectCourse(courseId: string) {
  const course = viewModel.value.courses.find((item) => item.id === courseId)
  queryState.selectedCourseId = courseId
  queryState.selectedVersionId =
    course?.versions.find((version) => version.archiveState === 'active')?.id ?? course?.versions[0]?.id ?? ''
}

function selectVersion(courseId: string, versionId: string) {
  queryState.selectedCourseId = courseId
  queryState.selectedVersionId = versionId
}

function requestVersionSelection(courseId: string, versionId: string) {
  if (queryState.selectedCourseId === courseId && queryState.selectedVersionId === versionId) {
    return
  }

  if (isEditing.value && hasUnsavedChanges.value) {
    pendingSelection.value = { courseId, versionId }
    statusMessage.value = '当前版本有未保存内容，可先保存草稿再切换。'
    return
  }

  selectVersion(courseId, versionId)
}

function confirmPendingSelectionWithSave() {
  if (!pendingSelection.value) {
    return
  }

  const saved = handleSaveDraft()
  if (!saved) {
    return
  }
  selectVersion(pendingSelection.value.courseId, pendingSelection.value.versionId)
  pendingSelection.value = null
}

function discardPendingSelection() {
  if (!pendingSelection.value) {
    return
  }

  selectVersion(pendingSelection.value.courseId, pendingSelection.value.versionId)
  pendingSelection.value = null
  statusMessage.value = '已放弃未保存修改并切换版本。'
}

function handleResetFilters() {
  const defaults = createDefaultOutlineWorkbenchQueryState(repository.listCourses())
  queryState.searchText = defaults.searchText
  queryState.semester = defaults.semester
  queryState.versionStatus = defaults.versionStatus
  queryState.completionState = defaults.completionState
  queryState.archiveState = defaults.archiveState
  queryState.sortBy = defaults.sortBy
}

function handleSaveDraft() {
  const currentCourse = viewModel.value.currentCourse
  const currentVersion = viewModel.value.currentVersion
  if (!currentCourse || !currentVersion) {
    statusMessage.value = '保存失败'
    return false
  }

  try {
    repository.saveOutlineDraft(currentCourse.id, currentVersion.id, draft.value)
    dataVersion.value += 1
    savedSnapshot.value = createDraftSnapshot(draft.value)
    statusMessage.value = '保存成功'
    return true
  } catch (error) {
    console.error(error)
    statusMessage.value = '保存失败'
    return false
  }
}

function handleEditAction() {
  if (!viewModel.value.currentVersion) {
    return
  }

  if (!isEditing.value) {
    isEditing.value = true
    statusMessage.value = ''
    return
  }

  const saved = handleSaveDraft()
  if (!saved) {
    return
  }

  isEditing.value = false
}

function handleCreateVersion() {
  const currentCourse = viewModel.value.currentCourse
  const currentVersion = viewModel.value.currentVersion
  if (!currentCourse || versionCreator.versionName.trim().length === 0) {
    return
  }

  const createdVersion =
    versionCreator.mode === 'blank'
      ? repository.createOutlineVersion({
          courseId: currentCourse.id,
          versionName: versionCreator.versionName.trim(),
          semester: versionCreator.semester.trim(),
          note: versionCreator.note.trim(),
          createdBy: props.currentAdminName,
          updatedBy: draft.value.updatedBy || currentCourse.instructor,
        })
      : repository.duplicateOutlineVersion({
          courseId: currentCourse.id,
          sourceVersionId: currentVersion?.id ?? currentCourse.versions[0]!.id,
          versionName: versionCreator.versionName.trim(),
          semester: versionCreator.semester.trim() || currentVersion?.semester || '',
          note: versionCreator.note.trim(),
          createdBy: props.currentAdminName,
          updatedBy: draft.value.updatedBy || currentCourse.instructor,
        })

  dataVersion.value += 1
  queryState.archiveState = 'active'
  queryState.selectedCourseId = currentCourse.id
  queryState.selectedVersionId = createdVersion.id
  statusMessage.value =
    versionCreator.mode === 'blank'
      ? `已创建空白版本 ${createdVersion.versionName}`
      : `已复制为 ${createdVersion.versionName}`
}

function requestArchiveVersion(courseId: string, versionId: string, versionLabel: string) {
  pendingArchive.value = {
    courseId,
    versionId,
    versionLabel,
  }
}

function confirmArchiveVersion() {
  if (!pendingArchive.value) {
    return
  }

  const archived = repository.archiveOutlineVersion(pendingArchive.value.courseId, pendingArchive.value.versionId)
  dataVersion.value += 1
  pendingArchive.value = null
  queryState.archiveState = 'active'
  statusMessage.value = `已归档 ${archived.versionName}`
}

function handleRestoreVersion(courseId: string, versionId: string) {
  const restored = repository.restoreOutlineVersion(courseId, versionId)
  dataVersion.value += 1
  queryState.archiveState = 'all'
  statusMessage.value = `已恢复 ${restored.versionName}`
}

function handleExportVersion() {
  const currentCourse = viewModel.value.currentCourse
  const currentVersion = viewModel.value.currentVersion
  if (!currentCourse || !currentVersion) {
    return
  }

  if (!canExport.value) {
    statusMessage.value = '请先补全缺项后再导出'
    return
  }

  repository.saveOutlineDraft(currentCourse.id, currentVersion.id, draft.value)
  dataVersion.value += 1
  savedSnapshot.value = createDraftSnapshot(draft.value)
  const exported = repository.exportOutlineVersion(currentCourse.id, currentVersion.id)
  if (!exported.document) {
    statusMessage.value = '导出失败'
    return
  }

  statusMessage.value = '已生成打印稿'
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
</script>

<template>
  <section class="outline-management workbench-surface">
    <header class="outline-management__head">
      <div class="outline-management__heading">
        <h2>{{ props.section.title }}</h2>
      </div>
      <span class="outline-management__scope-pill">{{ viewModel.resultCountLabel }}</span>
    </header>

    <section class="outline-query-bar">
      <label class="outline-query-field outline-query-field--search">
        <input v-model="queryState.searchText" type="search" placeholder="搜索课程、版本或备注" />
      </label>

      <label class="outline-query-field">
        <select v-model="queryState.semester">
          <option value="">全部学期</option>
          <option value="2026春">2026春</option>
          <option value="2026秋">2026秋</option>
          <option value="2025秋">2025秋</option>
        </select>
      </label>

      <label class="outline-query-field">
        <select v-model="queryState.versionStatus">
          <option value="all">全部状态</option>
          <option value="draft">草稿</option>
          <option value="final">定稿</option>
        </select>
      </label>

      <label class="outline-query-field">
        <select v-model="queryState.completionState">
          <option value="all">全部完整度</option>
          <option value="needs-completion">待补全</option>
          <option value="nearly-complete">接近完成</option>
          <option value="complete">已完成</option>
        </select>
      </label>

      <label class="outline-query-field">
        <select v-model="queryState.archiveState">
          <option value="all">全部版本</option>
          <option value="active">进行中</option>
          <option value="archived">已归档</option>
        </select>
      </label>

      <button class="outline-toolbar-button" type="button" @click="handleResetFilters">重置</button>
      <button class="outline-toolbar-button primary" type="button" @click="showVersionCreator = !showVersionCreator">
        新建版本
      </button>
    </section>

    <div class="outline-management__body">
      <aside class="outline-course-tree">
        <article
          v-for="course in viewModel.courses"
          :key="course.id"
          class="outline-course-group"
          :class="{ current: course.current }"
        >
          <button class="outline-course-group__head" type="button" @click="selectCourse(course.id)">
            <span>
              <strong>{{ course.title }}</strong>
              <small>{{ course.instructor }} · {{ course.versionCount }} 个版本</small>
            </span>
          </button>

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
                  <button
                    v-if="version.archiveState === 'active'"
                    class="outline-inline-button"
                    type="button"
                    @click.stop="requestArchiveVersion(course.id, version.id, version.versionName)"
                  >
                    归档
                  </button>
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
        </article>
      </aside>

      <section class="outline-workspace">
        <section v-if="pendingSelection" class="outline-inline-notice">
          <p>当前版本有未保存内容，可先保存草稿再切换。</p>
          <div class="outline-inline-notice__actions">
            <button class="outline-toolbar-button primary" type="button" @click="confirmPendingSelectionWithSave">
              保存并切换
            </button>
            <button class="outline-toolbar-button" type="button" @click="discardPendingSelection">直接切换</button>
          </div>
        </section>

        <section v-if="pendingArchive" class="outline-inline-notice warning">
          <p>归档后不会删除内容，只会从默认工作列表中收起 {{ pendingArchive.versionLabel }}。</p>
          <div class="outline-inline-notice__actions">
            <button class="outline-toolbar-button primary" type="button" @click="confirmArchiveVersion">确认归档</button>
            <button class="outline-toolbar-button" type="button" @click="pendingArchive = null">取消</button>
          </div>
        </section>

        <header class="outline-workspace__summary">
          <div class="outline-workspace__copy">
            <h3>{{ viewModel.toolbar.courseLabel }}</h3>
            <p>{{ viewModel.toolbar.versionLabel }} · {{ viewModel.toolbar.statusLabel }} - {{ viewModel.toolbar.updatedLabel }}</p>
            <small>{{ liveCompletion.percent }}% · {{ liveCompletion.completedSectionCount }}/{{ liveCompletion.totalSectionCount }} 分区可导出 · {{ liveCompletion.issues[0]?.message || '当前版本已满足导出要求' }}</small>
          </div>

          <div class="outline-workspace__actions">
            <button class="outline-toolbar-button" type="button" @click="showVersionCreator = !showVersionCreator">
              复制为新版本
            </button>
            <button class="outline-toolbar-button primary" type="button" @click="handleExportVersion">导出 / 打印</button>
          </div>
        </header>

        <section v-if="showVersionCreator" class="outline-version-creator">
          <label class="outline-field">
            <span>创建方式</span>
            <select v-model="versionCreator.mode">
              <option value="copy">复制当前版本</option>
              <option value="blank">空白版本</option>
            </select>
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
          <button class="outline-toolbar-button primary" type="button" @click="handleCreateVersion">创建版本</button>
        </section>

        <p v-if="statusMessage" class="outline-status-message">{{ statusMessage }}</p>
        <p v-if="!viewModel.currentVersionMatchesFilters" class="outline-status-message">
          当前正在查看的版本不在筛选结果中。
        </p>

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

        <section class="outline-editor-panel">
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
      </section>
    </div>
  </section>
</template>
