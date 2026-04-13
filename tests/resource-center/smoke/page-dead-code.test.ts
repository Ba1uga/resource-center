import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const globalsCss = readFileSync(
  new URL('../../../src/app/styles/globals.css', import.meta.url),
  'utf8',
)
const pageCss = readFileSync(
  new URL('../../../src/views/resource-center/resource-center-page.css', import.meta.url),
  'utf8',
)
const profileCss = readFileSync(
  new URL('../../../src/features/resource-center/profile/ui/profile-card.css', import.meta.url),
  'utf8',
)
const iconsTs = readFileSync(
  new URL('../../../src/features/resource-center/shared/config/icons.ts', import.meta.url),
  'utf8',
)
const featureIndexUrl = new URL('../../../src/features/resource-center/index.ts', import.meta.url)
const workbenchRegistry = readFileSync(
  new URL('../../../src/features/resource-center/workbench/shared/model/workbench.registry.ts', import.meta.url),
  'utf8',
)
const outlineEditor = readFileSync(
  new URL('../../../src/features/resource-center/workbench/outline/model/outline-workbench.editor.ts', import.meta.url),
  'utf8',
)
const outlineValidation = readFileSync(
  new URL('../../../src/features/resource-center/workbench/outline/model/outline-workbench.validation.ts', import.meta.url),
  'utf8',
)
const questionEditor = readFileSync(
  new URL('../../../src/features/resource-center/workbench/question/model/question-workbench.editor.ts', import.meta.url),
  'utf8',
)
const questionRepository = readFileSync(
  new URL('../../../src/features/resource-center/workbench/question/model/question-workbench.repository.ts', import.meta.url),
  'utf8',
)
const questionViewModel = readFileSync(
  new URL('../../../src/features/resource-center/workbench/question/model/question-workbench.view-model.ts', import.meta.url),
  'utf8',
)

for (const selector of [
  '.page-shell',
  '.page-glow',
  '.page-glow-left',
  '.page-glow-right',
  '.dashboard-frame',
  '.dashboard-main',
  '.profile-card',
  '.profile-avatar',
  '.avatar-chip',
]) {
  assert.equal(globalsCss.includes(selector), false, `globals.css must not own ${selector}`)
}

for (const selector of [
  '.topbar',
  '.topbar-shell',
  '.notify-button',
  '.metrics-grid',
  '.home-view',
  '.metric-card',
  '.panel-head',
  '.activity-list',
  '.suggestion-card',
  '.module-grid',
  '.analysis-overview',
  '.distribution-chart',
  '.chapter-item',
  '.action-strip',
]) {
  assert.equal(globalsCss.includes(selector), false, `globals.css must not keep legacy dashboard selector ${selector}`)
}

for (const selector of ['.page-shell', '.dashboard-frame', '.dashboard-main']) {
  assert.equal(pageCss.includes(selector), true, `resource-center-page.css must own ${selector}`)
}

for (const selector of ['.profile-card', '.profile-avatar']) {
  assert.equal(profileCss.includes(selector), true, `profile-card.css must own ${selector}`)
}

for (const iconKey of [
  'dashboard',
  'mail',
  'bell',
  'spark',
  'radar',
  'arrowUp',
  'arrowTrend',
  'more',
  'grid',
  'folder',
  'folderOpen',
  'chevronRight',
]) {
  assert.equal(iconsTs.includes(`${iconKey}:`), false, `icons.ts must not keep unused icon ${iconKey}`)
}

assert.equal(existsSync(featureIndexUrl), false, 'feature barrel index.ts must be removed once runtime imports are direct')

assert.equal(workbenchRegistry.includes('export const workbenchSectionMetas'), false, 'workbench registry must not export unused workbenchSectionMetas')
assert.equal(outlineEditor.includes('export function createEmptyOutlineSections'), false, 'outline editor must not export createEmptyOutlineSections')
assert.equal(outlineValidation.includes('export const outlineDocumentSections'), false, 'outline validation must not export outlineDocumentSections')
assert.equal(questionEditor.includes('export function createDefaultChoiceOptions'), false, 'question editor must not export createDefaultChoiceOptions')
assert.equal(questionRepository.includes('export interface QuestionWorkbenchRepository'), false, 'question repository must not export QuestionWorkbenchRepository')
assert.equal(questionRepository.includes('export interface CreateQuestionWorkbenchRepositoryOptions'), false, 'question repository must not export CreateQuestionWorkbenchRepositoryOptions')
assert.equal(questionViewModel.includes('export const questionTypeOptions'), false, 'question view model must not export questionTypeOptions')
assert.equal(questionViewModel.includes('export const questionDifficultyOptions'), false, 'question view model must not export questionDifficultyOptions')
assert.equal(questionViewModel.includes('export function getQuestionTypeLabel'), false, 'question view model must not export getQuestionTypeLabel')
assert.equal(questionViewModel.includes('export function getQuestionDifficultyLabel'), false, 'question view model must not export getQuestionDifficultyLabel')
assert.equal(questionViewModel.includes('export function getQuestionStatusLabel'), false, 'question view model must not export getQuestionStatusLabel')
assert.equal(questionViewModel.includes('export function mapQuestionRecordToListRow'), false, 'question view model must not export mapQuestionRecordToListRow')
