import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  resolveWorkbenchSectionMeta,
  workbenchSectionByKey,
  workbenchSectionKeys,
} from '../../../../src/features/resource-center/workbench/shared/model/workbench.registry.ts'

const genericSection = readFileSync(
  new URL('../../../../src/features/resource-center/workbench/shared/ui/WorkbenchSection.vue', import.meta.url),
  'utf8',
)

assert.equal(workbenchSectionKeys.length, 6)
for (const key of workbenchSectionKeys) {
  const meta = resolveWorkbenchSectionMeta(key)
  assert.equal(meta.key, key)
  assert.equal(meta.navigationLabel, workbenchSectionByKey[key].navigationLabel)
  assert.ok(meta.title.length > 0)
  assert.ok(meta.description.length > 0)
  assert.ok(meta.placeholderTitle.length > 0)
  assert.ok(meta.placeholderDescription.length > 0)
}

assert.ok(genericSection.includes("import OutlineWorkbenchSection from '../../outline/ui/OutlineWorkbenchSection.vue'"))
assert.ok(genericSection.includes("import TextbookWorkbenchSection from '../../textbook/ui/TextbookWorkbenchSection.vue'"))
assert.ok(genericSection.includes("import QuestionWorkbenchSection from '../../question/ui/QuestionWorkbenchSection.vue'"))
assert.ok(genericSection.includes("import CoursewareWorkbenchSection from '../../courseware/ui/CoursewareWorkbenchSection.vue'"))
assert.ok(genericSection.includes("import VideoWorkbenchSection from '../../video/ui/VideoWorkbenchSection.vue'"))
assert.ok(genericSection.includes("import MappingWorkbenchSection from '../../mapping/ui/MappingWorkbenchSection.vue'"))
assert.ok(genericSection.includes("import type { WorkbenchSectionMeta }"))
assert.ok(genericSection.includes(`section.key === 'outline'`))
assert.ok(genericSection.includes(`section.key === 'textbook'`))
assert.ok(genericSection.includes(`section.key === 'question'`))
assert.ok(genericSection.includes(`section.key === 'courseware'`))
assert.ok(genericSection.includes(`section.key === 'video'`))
assert.ok(genericSection.includes('<OutlineWorkbenchSection'))
assert.ok(genericSection.includes('<TextbookWorkbenchSection'))
assert.ok(genericSection.includes('<QuestionWorkbenchSection'))
assert.ok(genericSection.includes('<CoursewareWorkbenchSection'))
assert.ok(genericSection.includes('<VideoWorkbenchSection'))
assert.ok(genericSection.includes('<MappingWorkbenchSection'))
assert.match(
  genericSection,
  /\.workbench-section-host\s*\{[\s\S]*?height:\s*100%;[\s\S]*?display:\s*grid;[\s\S]*?grid-template-rows:\s*minmax\(0,\s*1fr\);/i,
)
assert.match(
  genericSection,
  /\.workbench-section-host__content\s*\{[\s\S]*?width:\s*100%;[\s\S]*?height:\s*100%;[\s\S]*?min-height:\s*100%;[\s\S]*?display:\s*grid;[\s\S]*?align-self:\s*stretch;/i,
)
