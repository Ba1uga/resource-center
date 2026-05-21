import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const outlineSectionUrl = new URL(
  '../../../../src/features/resource-center/workbench/outline/ui/OutlineWorkbenchSection.vue',
  import.meta.url,
)
const outlineStylesUrl = new URL(
  '../../../../src/features/resource-center/workbench/outline/styles/outline-workbench.css',
  import.meta.url,
)
const statusPillStylesUrl = new URL(
  '../../../../src/features/resource-center/workbench/shared/styles/workbench-status-pill.css',
  import.meta.url,
)
const packageJsonUrl = new URL('../../../../package.json', import.meta.url)

assert.equal(existsSync(outlineSectionUrl), true, 'OutlineWorkbenchSection.vue must exist')
assert.equal(existsSync(outlineStylesUrl), true, 'outline-workbench.css must exist')

const outlineSection = readFileSync(outlineSectionUrl, 'utf8')
const outlineStyles = readFileSync(outlineStylesUrl, 'utf8')
const statusPillStyles = readFileSync(statusPillStylesUrl, 'utf8')
const packageJson = JSON.parse(readFileSync(packageJsonUrl, 'utf8')) as {
  dependencies?: Record<string, string>
}
const normalizedOutlineSection = outlineSection.replace(/\s+/g, ' ')

assert.ok(outlineSection.includes("import '../styles/outline-workbench.css'"))
assert.ok(
  packageJson.dependencies?.['perfect-scrollbar'],
  'package.json must include perfect-scrollbar as a runtime dependency',
)
assert.ok(outlineSection.includes("import PerfectScrollbar from 'perfect-scrollbar'"))
assert.ok(outlineSection.includes("import 'perfect-scrollbar/css/perfect-scrollbar.css'"))
assert.ok(outlineSection.includes("import WorkbenchSelect from '../../shared/ui/WorkbenchSelect.vue'"))
assert.ok(outlineSection.includes("import WorkbenchTablePagination from '../../shared/ui/WorkbenchTablePagination.vue'"))
assert.ok(outlineSection.includes('nextTick'))
assert.ok(outlineSection.includes('const props = defineProps<{'))
assert.ok(outlineSection.includes('currentAdminName: string'))
assert.ok(outlineSection.includes('class="outline-management workbench-surface"'))
assert.ok(outlineSection.includes('class="outline-management__head"'))
assert.ok(outlineSection.includes('class="outline-management__top-row"'))
assert.ok(outlineSection.includes('class="outline-management__top-row-main"'))
assert.ok(outlineSection.includes('class="outline-management__heading"'))
assert.equal(outlineSection.includes('class="outline-management__scope-pill"'), false)
assert.ok(outlineSection.includes('WorkbenchStatusPill'))
assert.ok(outlineSection.includes('label="连接异常"'))
assert.ok(outlineSection.includes('message="后端连接失败，当前显示本地大纲样例。"'))
assert.ok(outlineSection.includes('后端连接失败，当前显示本地大纲样例。'))
assert.ok(outlineSection.includes('class="outline-query-bar"'))
assert.ok(outlineSection.includes('<WorkbenchSelect'))
assert.ok(outlineSection.includes('class="outline-management__body"'))
assert.ok(outlineSection.includes('class="outline-course-tree"'))
assert.ok(outlineSection.includes('ref="courseTreeScrollRef"'))
assert.ok(outlineSection.includes('class="outline-workspace"'))
assert.ok(outlineSection.includes('const manualExpandedCourseIds = ref<string[]>([])'))
assert.ok(outlineSection.includes('const selectedCourseHasVersions = computed(() =>'))
assert.ok(outlineSection.includes('const expandedCourseIds = computed(() =>'))
assert.ok(outlineSection.includes('function toggleCourseGroup(courseId: string)'))
assert.ok(outlineSection.includes('function isCourseExpanded(courseId: string)'))
assert.ok(outlineSection.includes('const courseTreeScrollRef = ref<HTMLElement | null>(null)'))
assert.ok(outlineSection.includes('const workspaceBodyScrollRef = ref<HTMLElement | null>(null)'))
assert.ok(outlineSection.includes('function initializeOutlineScrollbars()'))
assert.ok(outlineSection.includes('const statusType = ref'))
assert.ok(outlineSection.includes('const toastMessage = ref'))
assert.ok(outlineSection.includes('const showToast = ref'))
assert.ok(outlineSection.includes('function dismissBanner()'))
assert.ok(outlineSection.includes('function clearToast()'))
assert.ok(outlineSection.includes('function updateOutlineScrollbars()'))
assert.ok(outlineSection.includes('function destroyOutlineScrollbars()'))
assert.match(
  normalizedOutlineSection,
  /watch\(\s*\(\) => \[[\s\S]*?expandedCourseIds\.value\.join\('\|'\)[\s\S]*?activeEditorSection\.value[\s\S]*?createDraftSnapshot\(draft\.value\)[\s\S]*?\][\s\S]*?updateOutlineScrollbars/i,
)
assert.ok(outlineSection.includes('class="outline-workspace__top"'))
assert.ok(outlineSection.includes('class="outline-workspace__feedback"'))
assert.ok(outlineSection.includes('class="outline-workspace__summary"'))
assert.ok(outlineSection.includes('class="outline-workspace__content"'))
assert.ok(outlineSection.includes('class="outline-workspace__body"'))
assert.ok(outlineSection.includes('ref="workspaceBodyScrollRef"'))
assert.ok(outlineSection.includes('class="outline-version-creator-mode"'))
assert.ok(outlineSection.includes('class="outline-version-creator-mode__scrim"'))
assert.ok(outlineSection.includes('class="outline-version-creator-mode__panel"'))
assert.ok(outlineSection.includes('class="outline-version-creator-mode__actions"'))
assert.ok(outlineSection.includes('class="outline-section-tabs"'))
assert.ok(outlineSection.includes('class="outline-editor-panel"'))
assert.ok(outlineSection.includes("const activeEditorSection = ref<OutlineSectionId>('basic-info')"))
assert.ok(
  outlineSection.includes(
    'const queryState = reactive(createDefaultOutlineWorkbenchQueryState(coursePageState.value, courseVersionPages))',
  ),
)
assert.equal(outlineSection.includes('currentAdminName: props.currentAdminName'), false)
assert.ok(outlineSection.includes('@click="handleResetFilters"'))
assert.ok(outlineSection.includes('@click="toggleCourseGroup(course.id)"'))
assert.ok(outlineSection.includes(':aria-expanded="isCourseExpanded(course.id)"'))
assert.ok(outlineSection.includes('class="outline-course-group__chevron"'))
assert.ok(outlineSection.includes('class="outline-course-group__versions-shell"'))
assert.ok(outlineSection.includes('class="outline-course-group__versions-body"'))
assert.ok(outlineSection.includes(':aria-hidden="!isCourseExpanded(course.id)"'))
assert.ok(outlineSection.includes('@click="requestVersionSelection(course.id, version.id)"'))
assert.ok(outlineSection.includes('class="outline-version-row__identity"'))
assert.ok(outlineSection.includes('class="outline-version-row__status-line"'))
assert.ok(outlineSection.includes('class="outline-archive-mode"'))
assert.ok(outlineSection.includes('class="outline-archive-mode__scrim"'))
assert.ok(outlineSection.includes('class="outline-archive-mode__panel"'))
assert.ok(outlineSection.includes('class="outline-archive-mode__actions"'))
assert.ok(outlineSection.includes('archive-pending'))
assert.ok(outlineSection.includes('@click.stop="confirmArchiveVersion"'))
assert.ok(outlineSection.includes('@click.stop="cancelArchiveVersion"'))
assert.ok(outlineSection.includes('@click="undoArchivedVersion"'))
assert.ok(outlineSection.includes("if (event.key === 'Escape' && pendingArchive.value)"))
assert.equal(outlineSection.includes('class="outline-inline-notice warning"'), false)
assert.equal(outlineSection.includes('class="outline-archive-popconfirm"'), false)
assert.match(
  normalizedOutlineSection,
  /class="outline-inline-button"[\s\S]*?archive-pending/i,
)
assert.match(
  normalizedOutlineSection,
  /class="outline-course-group"[\s\S]*?collapsed:\s*!isCourseExpanded\(course\.id\)/i,
)
assert.match(
  normalizedOutlineSection,
  /class="outline-course-group__versions-shell"[\s\S]*?expanded:\s*isCourseExpanded\(course\.id\)[\s\S]*?collapsed:\s*!isCourseExpanded\(course\.id\)/i,
)
assert.match(
  normalizedOutlineSection,
  /class="outline-course-group__versions-body"[\s\S]*?v-for="version in course\.versions"/i,
)
assert.match(
  normalizedOutlineSection,
  /v-if="pendingArchive" class="outline-archive-mode"[\s\S]*?class="outline-archive-mode__scrim"[\s\S]*?class="outline-archive-mode__panel"/i,
)
assert.ok(outlineSection.includes('const savedSnapshot = ref('))
assert.ok(outlineSection.includes('const pendingSelection = ref<'))
assert.ok(outlineSection.includes('const pendingArchive = ref<'))
assert.ok(outlineSection.includes('const isEditing = ref(false)'))
assert.ok(outlineSection.includes('const showCourseCreator = ref(false)'))
assert.ok(outlineSection.includes('const connectionStatus = ref<'))
assert.ok(outlineSection.includes('const page = ref(1)'))
assert.ok(outlineSection.includes('const pageSize = ref(10)'))
assert.ok(outlineSection.includes('const pageSizeOptions = [10, 20, 50]'))
assert.ok(outlineSection.includes('const coursePageState = ref<'))
assert.ok(outlineSection.includes('const courseVersionPages = reactive<Record<string,'))
assert.ok(outlineSection.includes('function handleCourseVersionPageChange(courseId: string, nextPage: number)'))
assert.ok(outlineSection.includes('function handleCourseVersionPageSizeChange(courseId: string, nextPageSize: number)'))
assert.ok(outlineSection.includes('const currentVersionPageHint = computed(() =>'))
assert.ok(outlineSection.includes('const statusPillRef = ref'))
assert.ok(outlineSection.includes('const hasUnsavedChanges = computed(() =>'))
assert.ok(outlineSection.includes('function requestVersionSelection('))
assert.ok(outlineSection.includes('function confirmPendingSelectionWithSave()'))
assert.ok(outlineSection.includes('function discardPendingSelection()'))
assert.ok(outlineSection.includes('function openCourseCreator()'))
assert.ok(outlineSection.includes('function closeCourseCreator()'))
assert.ok(outlineSection.includes('function handleCreateCourse()'))
assert.ok(outlineSection.includes('function handleCoursePageChange(nextPage: number)'))
assert.ok(outlineSection.includes('function handleCoursePageSizeChange(nextPageSize: number)'))
assert.ok(outlineSection.includes('function openBlankVersionCreator()'))
assert.ok(outlineSection.includes('function openCopyVersionCreator()'))
assert.ok(outlineSection.includes('function closeVersionCreator()'))
assert.ok(outlineSection.includes('function requestArchiveVersion('))
assert.ok(outlineSection.includes('function confirmArchiveVersion()'))
assert.ok(outlineSection.includes('function cancelArchiveVersion()'))
assert.ok(outlineSection.includes('function undoArchivedVersion()'))
assert.ok(outlineSection.includes('function handleRestoreVersion('))
assert.ok(outlineSection.includes('function handleEditAction()'))
assert.ok(outlineSection.includes('function handleCreateVersion()'))
assert.ok(outlineSection.includes('createdBy: props.currentAdminName'))
assert.ok(outlineSection.includes('保存成功'))
assert.ok(outlineSection.includes('保存失败'))
assert.ok(outlineSection.includes('已创建课程'))
assert.equal(outlineSection.includes('加载大纲数据失败'), false)
assert.ok(outlineSection.includes('const repository = createOutlineWorkbenchRepository({'))
assert.ok(outlineSection.includes('initialCourses: []'))
assert.ok(outlineSection.includes('正在加载大纲数据...'))
assert.ok(outlineSection.includes('async function loadOutlineCoursePage('))
assert.ok(outlineSection.includes('async function loadOutlineCourseVersions('))
assert.equal(outlineSection.includes('<select v-model="queryState.semester">'), false)
assert.equal(outlineSection.includes('<select v-model="queryState.versionStatus">'), false)
assert.equal(outlineSection.includes('<select v-model="queryState.completionState">'), false)
assert.equal(outlineSection.includes('<select v-model="queryState.archiveState">'), false)
assert.ok(outlineSection.includes('@click="openBlankVersionCreator"'))
assert.ok(outlineSection.includes('@click="openCourseCreator"'))
assert.ok(outlineSection.includes('@click="openCopyVersionCreator"'))
assert.ok(outlineSection.includes('@click="handleEditAction"'))
assert.ok(outlineSection.includes("{{ isEditing ? '保存' : '修改' }}"))
assert.ok(outlineSection.includes('<fieldset class="outline-editor-panel__fieldset" :disabled="!isEditing">'))
assert.ok(outlineSection.includes("'creator-mode-blurred': showVersionCreator"))
assert.ok(outlineSection.includes("'creator-mode-blurred': showVersionCreator || showCourseCreator"))
assert.ok(outlineSection.includes("if (event.key === 'Escape' && showVersionCreator.value)"))
assert.ok(outlineSection.includes("if (event.key === 'Escape' && showCourseCreator.value)"))
assert.equal(
  normalizedOutlineSection.includes('v-if="showVersionCreator" class="outline-version-creator"'),
  false,
)
assert.ok(normalizedOutlineSection.includes('class="outline-course-create-button" type="button" @click="openCourseCreator"'))
assert.ok(normalizedOutlineSection.includes('<WorkbenchTablePagination'))
assert.ok(normalizedOutlineSection.includes('@page-change="handleCoursePageChange"'))
assert.ok(normalizedOutlineSection.includes('@page-size-change="handleCoursePageSizeChange"'))
assert.ok(normalizedOutlineSection.includes('class="outline-course-group__pagination"'))
assert.ok(normalizedOutlineSection.includes('@page-change="handleCourseVersionPageChange(course.id, $event)"'))
assert.ok(normalizedOutlineSection.includes('@page-size-change="handleCourseVersionPageSizeChange(course.id, $event)"'))
assert.ok(normalizedOutlineSection.includes('simple'))
assert.ok(normalizedOutlineSection.includes('class="outline-course-tree__pagination"'))
assert.ok(normalizedOutlineSection.indexOf('class="outline-course-tree__pagination"') < normalizedOutlineSection.indexOf('</aside>'))
assert.ok(normalizedOutlineSection.includes('当前查看版本不在本页列表中。'))
assert.ok(normalizedOutlineSection.includes('v-else-if="!viewModel.currentVersion && viewModel.currentCourse && selectedCourseHasVersions" class="outline-empty-state"'))
assert.ok(normalizedOutlineSection.includes('v-else-if="!viewModel.currentVersion && viewModel.currentCourse && !selectedCourseHasVersions" class="outline-empty-state"'))
assert.ok(normalizedOutlineSection.includes('此课程尚未创建任何大纲版本。点击下方按钮创建第一个版本。'))
assert.ok(normalizedOutlineSection.includes('v-if="showCourseCreator" class="outline-version-creator-mode"'))
assert.ok(normalizedOutlineSection.includes('创建新课程'))
assert.ok(normalizedOutlineSection.includes('创建一个新的课程，随后可在此课程下新建大纲版本。'))
assert.ok(normalizedOutlineSection.includes('<span>课程名称</span>'))
assert.ok(normalizedOutlineSection.includes('<span>授课教师</span>'))
assert.ok(normalizedOutlineSection.includes('<span>教研室</span>'))
assert.ok(normalizedOutlineSection.includes('@click.stop="handleCreateCourse"'))
assert.ok(normalizedOutlineSection.includes('@click.stop="closeCourseCreator"'))
assert.ok(normalizedOutlineSection.includes('v-if="isEditing" class="outline-inline-button" type="button" @click="addGoal(\'knowledge\')"'))
assert.ok(
  normalizedOutlineSection.includes(
    'v-if="isEditing" class="outline-inline-button danger" type="button" @click="removeGoal(\'knowledge\', goal.id)"',
  ),
)
assert.ok(normalizedOutlineSection.includes('v-if="isEditing" class="outline-inline-button" type="button" @click="addGoal(\'ability\')"'))
assert.ok(
  normalizedOutlineSection.includes(
    'v-if="isEditing" class="outline-inline-button danger" type="button" @click="removeGoal(\'ability\', goal.id)"',
  ),
)
assert.ok(normalizedOutlineSection.includes('v-if="isEditing" class="outline-inline-button" type="button" @click="addScheduleItem"'))
assert.ok(
  normalizedOutlineSection.includes(
    'v-if="isEditing" class="outline-inline-button danger" type="button" @click="removeScheduleItem(item.id)"',
  ),
)
assert.ok(normalizedOutlineSection.includes('v-if="isEditing" class="outline-method-tags"'))
assert.ok(normalizedOutlineSection.includes('v-else class="outline-method-tags outline-method-tags--readonly"'))
assert.ok(normalizedOutlineSection.includes('v-for="option in draft.sections.teachingMethods.selected"'))
assert.ok(
  normalizedOutlineSection.includes(
    'v-if="isEditing" class="outline-inline-button danger" type="button" @click="removeAssessmentItem(item.id)"',
  ),
)
assert.ok(normalizedOutlineSection.includes('v-if="isEditing" class="outline-inline-button" type="button" @click="addAssessmentItem"'))
assert.ok(normalizedOutlineSection.includes('v-if="isEditing" class="outline-inline-button" type="button" @click="addMaterial(\'primary\')"'))
assert.ok(
  normalizedOutlineSection.includes(
    'v-if="isEditing" class="outline-inline-button danger" type="button" @click="removeMaterial(\'primary\', item.id)"',
  ),
)
assert.ok(
  normalizedOutlineSection.includes(
    'v-if="isEditing" class="outline-inline-button" type="button" @click="addMaterial(\'references\')"',
  ),
)
assert.ok(
  normalizedOutlineSection.includes(
    'v-if="isEditing" class="outline-inline-button danger" type="button" @click="removeMaterial(\'references\', item.id)"',
  ),
)
assert.ok(
  outlineSection.includes(
    '{{ viewModel.toolbar.versionLabel }} · {{ viewModel.toolbar.statusLabel }} - {{ viewModel.toolbar.updatedLabel }}',
  ),
)
assert.ok(
  outlineSection.includes(
    "{{ liveCompletion.percent }}% · {{ liveCompletion.completedSectionCount }}/{{ liveCompletion.totalSectionCount }} 分区可导出 · {{ liveCompletion.issues[0]?.message || '当前版本已满足导出要求' }}",
  ),
)
assert.ok(outlineSection.includes('<h2>{{ props.section.title }}</h2>'))
assert.equal(outlineStyles.includes('.outline-management__scope-pill'), false)
assert.equal(outlineSection.includes('class="outline-workspace__completion"'), false)
assert.equal(outlineSection.includes('Teacher Workspace'), false)
assert.equal(outlineSection.includes('class="outline-overview-shell"'), false)
assert.equal(outlineSection.includes('class="outline-editor-drawer"'), false)
assert.equal(outlineSection.includes('currentTeacherName'), false)

assert.match(
  outlineStyles,
  /\.outline-management\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-rows:\s*auto\s+auto\s+minmax\(0,\s*1fr\);[\s\S]*?height:\s*100%;[\s\S]*?min-height:\s*0;[\s\S]*?overflow:\s*hidden;/i,
)
assert.ok(outlineStyles.includes("@import '../../shared/styles/workbench-header.css';"))
assert.equal(/\.outline-management__head,\s*[\r\n]+\s*\.outline-query-bar/i.test(outlineStyles), false)
assert.equal(/\.outline-query-bar,\s*[\r\n]+\s*\.outline-course-tree/i.test(outlineStyles), false)
assert.match(
  outlineStyles,
  /\.outline-query-bar\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*148px\)\)\s+auto\s+auto;[\s\S]*?gap:\s*14px;/i,
)
assert.match(
  outlineStyles,
  /\.outline-query-bar\s*\{[\s\S]*?grid-column:\s*2;[\s\S]*?grid-row:\s*2;[\s\S]*?justify-self:\s*end;[\s\S]*?width:\s*fit-content;[\s\S]*?max-width:\s*100%;/i,
)
assert.match(
  outlineStyles,
  /\.outline-management__top-row\s*\{[\s\S]*?display:\s*contents;/i,
)
assert.match(
  outlineStyles,
  /\.outline-management__head\s*\{[\s\S]*?display:\s*contents;/i,
)
assert.match(
  outlineStyles,
  /\.outline-management__top-row-main\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-columns:\s*minmax\(420px,\s*1fr\)\s+auto;[\s\S]*?grid-column:\s*2;/i,
)
assert.match(
  outlineStyles,
  /\.outline-management__top-row-main\s*\{[\s\S]*?justify-self:\s*end;[\s\S]*?width:\s*min\(100%,\s*1320px\);/i,
)
assert.match(
  outlineStyles,
  /\.outline-management__body\s*\{[\s\S]*?display:\s*contents;/i,
)
assert.match(
  outlineStyles,
  /\.outline-course-tree\s*\{[\s\S]*?grid-column:\s*1;[\s\S]*?grid-row:\s*2\s*\/\s*-1;[\s\S]*?display:\s*flex;[\s\S]*?flex-direction:\s*column;[\s\S]*?overflow:\s*hidden;/i,
)
assert.ok(outlineStyles.includes('.outline-course-tree__pagination'))
assert.ok(outlineStyles.includes('.outline-course-group__pagination'))
assert.ok(outlineStyles.includes('.outline-course-tree__scroll'))
assert.ok(normalizedOutlineSection.includes('class="outline-course-tree__scroll"'))
assert.match(outlineStyles, /\.outline-course-tree__pagination\s*\{[\s\S]*?flex-shrink:\s*0;/i)
assert.match(
  outlineStyles,
  /\.outline-course-create-button\s*\{[\s\S]*?width:\s*100%;[\s\S]*?min-height:\s*48px;/i,
)
assert.match(
  outlineStyles,
  /\.outline-management\s+\.ps\s*\{[\s\S]*?position:\s*relative;[\s\S]*?overflow:\s*hidden\s*!important;/i,
)
assert.match(
  outlineStyles,
  /\.outline-management\s+\.ps__rail-y\s*\{[\s\S]*?width:\s*10px;[\s\S]*?background:\s*transparent;/i,
)
assert.match(
  outlineStyles,
  /\.outline-management\s+\.ps__thumb-y\s*\{[\s\S]*?right:\s*2px;[\s\S]*?border-radius:\s*999px;[\s\S]*?background:\s*var\(--outline-scroll-tree-thumb\);/i,
)
assert.match(
  outlineStyles,
  /\.outline-workspace__body\.ps\s+\.ps__thumb-y\s*\{[\s\S]*?background:\s*var\(--outline-scroll-body-thumb\);/i,
)
assert.match(
  outlineStyles,
  /\.outline-management\s*\{[\s\S]*?--outline-scroll-track:[\s\S]*?--outline-scroll-tree-thumb:[\s\S]*?--outline-scroll-body-thumb:/i,
)
assert.match(
  outlineStyles,
  /\.outline-course-tree__scroll\s*\{[\s\S]*?scrollbar-gutter:\s*stable[\s\S]*?scrollbar-width:\s*thin;[\s\S]*?scrollbar-color:\s*var\(--outline-scroll-tree-thumb\)\s+var\(--outline-scroll-track\);/i,
)
assert.match(
  outlineStyles,
  /\.outline-course-tree__scroll::-webkit-scrollbar\s*\{[\s\S]*?width:\s*\d+px;/i,
)
assert.match(
  outlineStyles,
  /\.outline-course-tree__scroll::-webkit-scrollbar-track\s*\{[\s\S]*?border-radius:\s*999px;[\s\S]*?background:\s*var\(--outline-scroll-track\);/i,
)
assert.match(
  outlineStyles,
  /\.outline-course-tree__scroll::-webkit-scrollbar-thumb\s*\{[\s\S]*?border-radius:\s*999px;[\s\S]*?background:\s*var\(--outline-scroll-tree-thumb\)\s+padding-box;/i,
)
assert.match(
  outlineStyles,
  /\.outline-course-tree__scroll::-webkit-scrollbar-button\s*\{[\s\S]*?display:\s*none;[\s\S]*?width:\s*0;[\s\S]*?height:\s*0;/i,
)
assert.match(
  outlineStyles,
  /\.outline-course-group\.collapsed\s*\{[\s\S]*?gap:/i,
)
assert.match(
  outlineStyles,
  /\.outline-course-group__head\s*\{[\s\S]*?display:\s*flex;[\s\S]*?justify-content:\s*space-between;[\s\S]*?align-items:\s*center;/i,
)
assert.match(
  outlineStyles,
  /\.outline-course-group__chevron\s*\{[\s\S]*?transition:\s*transform/i,
)
assert.match(
  outlineStyles,
  /\.outline-course-group:not\(\.collapsed\)\s+\.outline-course-group__chevron\s*\{[\s\S]*?transform:\s*rotate\(180deg\);/i,
)
assert.match(
  outlineStyles,
  /\.outline-course-group__versions-shell\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-rows:\s*0fr;[\s\S]*?overflow:\s*hidden;[\s\S]*?transition:/i,
)
assert.match(
  outlineStyles,
  /\.outline-course-group__versions-shell\.expanded\s*\{[\s\S]*?grid-template-rows:\s*1fr;/i,
)
assert.match(
  outlineStyles,
  /\.outline-course-group__versions-body\s*\{[\s\S]*?opacity:\s*0;[\s\S]*?transform:\s*translateY\(-/i,
)
assert.match(
  outlineStyles,
  /\.outline-course-group__versions-shell\.expanded\s+\.outline-course-group__versions-body\s*\{[\s\S]*?opacity:\s*1;[\s\S]*?transform:\s*translateY\(0\);/i,
)
assert.match(
  outlineStyles,
  /\.outline-course-group__versions-shell\.collapsed\s+\.outline-course-group__versions-body\s*\{[\s\S]*?pointer-events:\s*none;/i,
)
assert.match(
  outlineStyles,
  /\.outline-course-group__head:active\s*\{[\s\S]*?background:/i,
)
assert.match(
  outlineStyles,
  /@media \(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.outline-course-group__versions-shell[\s\S]*?transition:\s*none;[\s\S]*?\.outline-course-group__versions-body[\s\S]*?transition:\s*none;/i,
)
assert.match(
  outlineStyles,
  /\.outline-version-row\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-columns:\s*1fr;[\s\S]*?align-items:\s*stretch;/i,
)
assert.match(
  outlineStyles,
  /\.archive-pending\s*\{[\s\S]*?border-color:/i,
)
assert.match(
  outlineStyles,
  /\.outline-archive-mode\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?inset:\s*0;/i,
)
assert.match(
  outlineStyles,
  /\.outline-archive-mode__scrim\s*\{[\s\S]*?backdrop-filter:/i,
)
assert.match(
  outlineStyles,
  /\.outline-archive-mode__panel\s*\{[\s\S]*?z-index:\s*1;/i,
)
assert.match(
  outlineStyles,
  /\.outline-workspace__content\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-rows:\s*auto\s+minmax\(0,\s*1fr\);[\s\S]*?min-height:\s*0;/i,
)
assert.match(
  outlineStyles,
  /\.outline-workspace__content\.archive-blurred\s*\{[\s\S]*?filter:/i,
)
assert.match(
  outlineStyles,
  /\.outline-archive-mode__actions\s*\{[\s\S]*?display:\s*flex;[\s\S]*?flex-wrap:\s*wrap;/i,
)
assert.match(
  outlineStyles,
  /\.outline-version-creator-mode\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?inset:\s*0;/i,
)
assert.match(
  outlineStyles,
  /\.outline-version-creator-mode__scrim\s*\{[\s\S]*?backdrop-filter:/i,
)
assert.match(
  outlineStyles,
  /\.outline-version-creator-mode__panel\s*\{[\s\S]*?z-index:\s*1;/i,
)
assert.match(
  outlineStyles,
  /\.outline-version-creator-mode__actions\s*\{[\s\S]*?display:\s*flex;[\s\S]*?flex-wrap:\s*wrap;/i,
)
assert.match(
  outlineStyles,
  /\.outline-empty-state\s*\{[\s\S]*?display:\s*grid;[\s\S]*?justify-items:\s*center;/i,
)
assert.match(
  outlineStyles,
  /\.outline-workspace__content\.creator-mode-blurred\s*\{[\s\S]*?filter:/i,
)
assert.match(
  outlineStyles,
  /\.outline-workspace__body\s*\{[\s\S]*?min-height:\s*0;[\s\S]*?overflow:\s*auto;/i,
)
assert.match(
  outlineStyles,
  /\.outline-workspace__body\s*\{[\s\S]*?scrollbar-gutter:\s*stable[\s\S]*?scrollbar-width:\s*thin;[\s\S]*?scrollbar-color:\s*var\(--outline-scroll-body-thumb\)\s+var\(--outline-scroll-track\);/i,
)
assert.match(
  outlineStyles,
  /\.outline-workspace__body::-webkit-scrollbar\s*\{[\s\S]*?width:\s*\d+px;/i,
)
assert.match(
  outlineStyles,
  /\.outline-workspace__body::-webkit-scrollbar-track\s*\{[\s\S]*?border-radius:\s*999px;[\s\S]*?background:\s*var\(--outline-scroll-track\);/i,
)
assert.match(
  outlineStyles,
  /\.outline-workspace__body::-webkit-scrollbar-thumb\s*\{[\s\S]*?border-radius:\s*999px;[\s\S]*?background:\s*var\(--outline-scroll-body-thumb\)\s+padding-box;/i,
)
assert.match(
  outlineStyles,
  /\.outline-workspace__body::-webkit-scrollbar-button\s*\{[\s\S]*?display:\s*none;[\s\S]*?width:\s*0;[\s\S]*?height:\s*0;/i,
)
assert.match(
  outlineStyles,
  /\.outline-status-message__action\s*\{[\s\S]*?display:\s*inline-flex;/i,
)
assert.equal(/\.outline-archive-popconfirm\s*\{/i.test(outlineStyles), false)
assert.match(
  outlineStyles,
  /\.outline-workspace\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-rows:\s*auto\s+minmax\(0,\s*1fr\);[\s\S]*?min-height:\s*0;/i,
)
assert.match(
  outlineStyles,
  /\.outline-workspace__top\s*\{[\s\S]*?display:\s*grid;[\s\S]*?gap:\s*14px;[\s\S]*?align-content:\s*start;/i,
)
assert.match(
  statusPillStyles,
  /\.workbench-status-pill__anchor\s*\{[\s\S]*?position:\s*relative;/i,
)
assert.match(
  statusPillStyles,
  /\.workbench-status-pill__button\s*\{[\s\S]*?border-radius:\s*999px;/i,
)
assert.match(
  statusPillStyles,
  /\.workbench-status-pill__popover\s*\{[\s\S]*?position:\s*absolute;/i,
)
assert.match(
  outlineStyles,
  /\.outline-workspace__feedback\s*\{[\s\S]*?display:\s*grid;[\s\S]*?gap:\s*8px;/i,
)
assert.match(
  outlineStyles,
  /\.outline-toast\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?animation:\s*outline-toast-in/i,
)
assert.match(
  outlineStyles,
  /\.outline-status-message__close\s*\{[\s\S]*?cursor:\s*pointer;/i,
)
assert.match(
  outlineStyles,
  /\.outline-status-message--error\s*\{[\s\S]*?border-left-color:\s*var\(--outline-status-color\);/i,
)
assert.match(
  outlineStyles,
  /\.outline-editor-panel\s*\{[\s\S]*?padding:\s*20px;[\s\S]*?border:\s*1px solid var\(--outline-line\);[\s\S]*?border-radius:\s*22px;[\s\S]*?background:\s*var\(--outline-surface\);/i,
)
assert.equal(/\.outline-workspace__completion\s*\{/i.test(outlineStyles), false)
assert.match(
  outlineStyles,
  /\.outline-editor-panel__fieldset\s*\{[\s\S]*?margin:\s*0;[\s\S]*?padding:\s*0;[\s\S]*?border:\s*0;/i,
)
assert.match(
  outlineStyles,
  /\.outline-section-tabs\s*\{[\s\S]*?display:\s*flex;[\s\S]*?align-items:\s*flex-start;[\s\S]*?align-self:\s*start;[\s\S]*?padding-bottom:\s*8px;/i,
)
assert.match(
  outlineStyles,
  /\.outline-method-tags--readonly\s*\{[\s\S]*?min-height:\s*42px;/i,
)
assert.equal(/\.outline-inline-notice\.warning\s*\{/i.test(outlineStyles), false)
assert.match(
  outlineStyles,
  /@media \(max-width: 1180px\)\s*\{[\s\S]*?\.outline-management\s*\{[\s\S]*?grid-template-columns:\s*1fr;[\s\S]*?\}[\s\S]*?\.outline-management__top-row\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-columns:\s*1fr;[\s\S]*?\}[\s\S]*?\.outline-management__heading,\s*[\r\n]+\s*\.outline-management__top-row-main\s*\{[\s\S]*?grid-column:\s*auto;[\s\S]*?grid-row:\s*auto;[\s\S]*?\}[\s\S]*?\.outline-management__top-row-main\s*\{[\s\S]*?grid-template-columns:\s*1fr;[\s\S]*?\}[\s\S]*?\.outline-query-bar\s*\{[\s\S]*?grid-column:\s*auto;[\s\S]*?grid-row:\s*auto;[\s\S]*?grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);/i,
)
assert.ok(
  normalizedOutlineSection.includes(
    'v-if="draft.sections.knowledgeGoals.length === 0" class="outline-group-empty-state"',
  ),
)
assert.ok(
  normalizedOutlineSection.includes(
    'v-if="draft.sections.abilityGoals.length === 0" class="outline-group-empty-state"',
  ),
)
assert.ok(
  normalizedOutlineSection.includes(
    'v-if="draft.sections.materials.primary.length === 0" class="outline-group-empty-state"',
  ),
)
assert.ok(
  normalizedOutlineSection.includes(
    'v-if="draft.sections.materials.references.length === 0" class="outline-group-empty-state"',
  ),
)
assert.match(
  outlineStyles,
  /\.outline-goals-grid,\s*[\r\n]+\s*\.outline-materials-grid\s*\{[\s\S]*?align-items:\s*stretch;/i,
)
assert.match(
  outlineStyles,
  /\.outline-goal-group,\s*[\r\n]+\s*\.outline-material-group\s*\{[\s\S]*?align-content:\s*start;/i,
)
assert.match(
  outlineStyles,
  /\.outline-group-empty-state\s*\{[\s\S]*?border:\s*1px dashed var\(--outline-line\);[\s\S]*?background:\s*var\(--outline-surface-soft\);/i,
)
assert.match(
  outlineStyles,
  /\.outline-offline-state\s*\{[\s\S]*?display:\s*grid;[\s\S]*?justify-items:\s*center;/i,
)
assert.match(
  outlineStyles,
  /\.outline-offline-state__icon\s*\{[\s\S]*?place-items:\s*center;[\s\S]*?width:\s*72px;/i,
)
assert.ok(outlineSection.includes('v-if="connectionStatus === \'offline\'"'))
assert.ok(outlineSection.includes('function retryConnection()'))
assert.ok(outlineSection.includes('后端服务暂时无法连接'))
