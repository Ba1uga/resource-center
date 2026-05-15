import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const componentUrl = new URL(
  '../../../../src/features/resource-center/workbench/shared/ui/WorkbenchSelect.vue',
  import.meta.url,
)
const stylesUrl = new URL(
  '../../../../src/features/resource-center/workbench/shared/styles/workbench-select.css',
  import.meta.url,
)

assert.equal(existsSync(componentUrl), true, 'WorkbenchSelect.vue must exist')
assert.equal(existsSync(stylesUrl), true, 'workbench-select.css must exist')

const componentContent = readFileSync(componentUrl, 'utf8')
const stylesContent = readFileSync(stylesUrl, 'utf8')

assert.ok(componentContent.includes("import '../styles/workbench-select.css'"))
assert.ok(componentContent.includes('const props = withDefaults('))
assert.ok(componentContent.includes('options: Array<'))
assert.ok(componentContent.includes('modelValue: string'))
assert.ok(componentContent.includes("const open = ref(false)"))
assert.ok(componentContent.includes('const highlightedIndex = ref(-1)'))
assert.ok(componentContent.includes("emit('update:modelValue'"))
assert.ok(componentContent.includes('function toggleOpen()'))
assert.ok(componentContent.includes('function handleOptionSelect('))
assert.ok(componentContent.includes('function handleTriggerKeydown('))
assert.ok(componentContent.includes('function handleListKeydown('))
assert.ok(componentContent.includes('function syncHighlightedIndex()'))
assert.ok(componentContent.includes('class="workbench-select"'))
assert.ok(componentContent.includes('class="workbench-select__trigger"'))
assert.ok(componentContent.includes('class="workbench-select__label"'))
assert.ok(componentContent.includes('class="workbench-select__chevron"'))
assert.ok(componentContent.includes('class="workbench-select__menu"'))
assert.ok(componentContent.includes('class="workbench-select__option"'))
assert.ok(componentContent.includes(":class=\"[{ 'is-open': open, 'is-disabled': disabled }, `is-${size}`]\""))
assert.ok(componentContent.includes("'is-selected': option.value === modelValue"))

assert.match(
  stylesContent,
  /\.workbench-select\s*\{[\s\S]*?position:\s*relative;[\s\S]*?display:\s*grid;[\s\S]*?width:\s*100%;/i,
)
assert.match(
  stylesContent,
  /\.workbench-select__trigger\s*\{[\s\S]*?width:\s*100%;[\s\S]*?display:\s*flex;[\s\S]*?justify-content:\s*space-between;/i,
)
assert.match(
  stylesContent,
  /\.workbench-select__chevron\s*\{[\s\S]*?transition:\s*transform\s+240ms/i,
)
assert.match(
  stylesContent,
  /\.workbench-select\.is-open\s+\.workbench-select__chevron\s*\{[\s\S]*?transform:\s*rotate\(225deg\).*?;/i,
)
assert.match(
  stylesContent,
  /\.workbench-select__menu\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?top:\s*calc\(100% \+ 10px\);[\s\S]*?min-width:\s*100%;[\s\S]*?width:\s*max-content;/i,
)
assert.match(
  stylesContent,
  /\.workbench-select__option\.is-selected\s*\{[\s\S]*?background:\s*var\(--workbench-select-selected-bg/i,
)
assert.match(
  stylesContent,
  /\.workbench-select__option\s*\{[\s\S]*?white-space:\s*nowrap;/i,
)
