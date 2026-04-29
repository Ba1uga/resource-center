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

assert.equal(existsSync(outlineSectionUrl), true, 'OutlineWorkbenchSection.vue must exist')
assert.equal(existsSync(outlineStylesUrl), true, 'outline-workbench.css must exist')

const outlineSection = readFileSync(outlineSectionUrl, 'utf8')
const outlineStyles = readFileSync(outlineStylesUrl, 'utf8')
const normalizedOutlineSection = outlineSection.replace(/\s+/g, ' ')

assert.ok(outlineSection.includes("import '../styles/outline-workbench.css'"))
assert.ok(outlineSection.includes('const props = defineProps<{'))
assert.ok(outlineSection.includes('currentAdminName: string'))
assert.ok(outlineSection.includes('class="outline-management workbench-surface"'))
assert.ok(outlineSection.includes('class="outline-management__head"'))
assert.ok(outlineSection.includes('class="outline-management__heading"'))
assert.ok(outlineSection.includes('class="outline-management__scope-pill"'))
assert.ok(outlineSection.includes('class="outline-query-bar"'))
assert.ok(outlineSection.includes('class="outline-management__body"'))
assert.ok(outlineSection.includes('class="outline-course-tree"'))
assert.ok(outlineSection.includes('class="outline-workspace"'))
assert.ok(outlineSection.includes('class="outline-workspace__top"'))
assert.ok(outlineSection.includes('class="outline-workspace__feedback"'))
assert.ok(outlineSection.includes('class="outline-workspace__summary"'))
assert.ok(outlineSection.includes('class="outline-workspace__content"'))
assert.ok(outlineSection.includes('class="outline-workspace__body"'))
assert.ok(outlineSection.includes('class="outline-version-creator-mode"'))
assert.ok(outlineSection.includes('class="outline-version-creator-mode__scrim"'))
assert.ok(outlineSection.includes('class="outline-version-creator-mode__panel"'))
assert.ok(outlineSection.includes('class="outline-version-creator-mode__actions"'))
assert.ok(outlineSection.includes('class="outline-section-tabs"'))
assert.ok(outlineSection.includes('class="outline-editor-panel"'))
assert.ok(outlineSection.includes("const activeEditorSection = ref<OutlineSectionId>('basic-info')"))
assert.ok(
  outlineSection.includes(
    'const queryState = reactive(createDefaultOutlineWorkbenchQueryState(repository.listCourses()))',
  ),
)
assert.equal(outlineSection.includes('currentAdminName: props.currentAdminName'), false)
assert.ok(outlineSection.includes('@click="handleResetFilters"'))
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
  /v-if="pendingArchive" class="outline-archive-mode"[\s\S]*?class="outline-archive-mode__scrim"[\s\S]*?class="outline-archive-mode__panel"/i,
)
assert.ok(outlineSection.includes('const savedSnapshot = ref('))
assert.ok(outlineSection.includes('const pendingSelection = ref<'))
assert.ok(outlineSection.includes('const pendingArchive = ref<'))
assert.ok(outlineSection.includes('const isEditing = ref(false)'))
assert.ok(outlineSection.includes('const hasUnsavedChanges = computed(() =>'))
assert.ok(outlineSection.includes('function requestVersionSelection('))
assert.ok(outlineSection.includes('function confirmPendingSelectionWithSave()'))
assert.ok(outlineSection.includes('function discardPendingSelection()'))
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
assert.ok(outlineSection.includes('@click="openBlankVersionCreator"'))
assert.ok(outlineSection.includes('@click="openCopyVersionCreator"'))
assert.ok(outlineSection.includes('@click="handleEditAction"'))
assert.ok(outlineSection.includes("{{ isEditing ? '保存' : '修改' }}"))
assert.ok(outlineSection.includes('<fieldset class="outline-editor-panel__fieldset" :disabled="!isEditing">'))
assert.ok(outlineSection.includes("'creator-mode-blurred': showVersionCreator"))
assert.ok(outlineSection.includes("if (event.key === 'Escape' && showVersionCreator.value)"))
assert.equal(
  normalizedOutlineSection.includes('v-if="showVersionCreator" class="outline-version-creator"'),
  false,
)
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
  /\.outline-query-bar\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1\.45fr\)\s+repeat\(4,\s*minmax\(0,\s*150px\)\)\s+auto\s+auto;/i,
)
assert.match(
  outlineStyles,
  /\.outline-management__body\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-columns:\s*minmax\(260px,\s*320px\)\s+minmax\(0,\s*1fr\);[\s\S]*?min-height:\s*0;/i,
)
assert.match(
  outlineStyles,
  /\.outline-course-tree\s*\{[\s\S]*?display:\s*grid;[\s\S]*?align-content:\s*start;[\s\S]*?overflow:\s*auto;/i,
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
  /\.outline-workspace__content\.creator-mode-blurred\s*\{[\s\S]*?filter:/i,
)
assert.match(
  outlineStyles,
  /\.outline-workspace__body\s*\{[\s\S]*?min-height:\s*0;[\s\S]*?overflow:\s*auto;/i,
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
  outlineStyles,
  /\.outline-workspace__feedback\s*\{[\s\S]*?display:\s*grid;[\s\S]*?gap:\s*8px;/i,
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
  /@media \(max-width: 1180px\)\s*\{[\s\S]*?\.outline-management__body\s*\{[\s\S]*?grid-template-columns:\s*1fr;[\s\S]*?\}[\s\S]*?\.outline-query-bar\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/i,
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
  /\.outline-goals-grid,\s*[\r\n]+\s*\.outline-materials-grid\s*\{[\s\S]*?align-items:\s*start;/i,
)
assert.match(
  outlineStyles,
  /\.outline-goal-group,\s*[\r\n]+\s*\.outline-material-group\s*\{[\s\S]*?align-content:\s*start;/i,
)
assert.match(
  outlineStyles,
  /\.outline-group-empty-state\s*\{[\s\S]*?border:\s*1px dashed var\(--outline-line\);[\s\S]*?background:\s*var\(--outline-surface-soft\);/i,
)
