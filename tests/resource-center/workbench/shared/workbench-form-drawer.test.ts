import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const componentUrl = new URL(
  '../../../../src/features/resource-center/workbench/shared/ui/WorkbenchFormDrawer.vue',
  import.meta.url,
)
const stylesUrl = new URL(
  '../../../../src/features/resource-center/workbench/shared/styles/workbench-drawer-form.css',
  import.meta.url,
)

assert.equal(existsSync(componentUrl), true, 'WorkbenchFormDrawer.vue must exist')
assert.equal(existsSync(stylesUrl), true, 'workbench-drawer-form.css must exist')

const componentContent = readFileSync(componentUrl, 'utf8')
const stylesContent = readFileSync(stylesUrl, 'utf8')

// Component imports
assert.ok(componentContent.includes("import '../styles/workbench-drawer-form.css'"))
assert.ok(componentContent.includes("import WorkbenchDrawerHost from './WorkbenchDrawerHost.vue'"))

// Props
assert.ok(componentContent.includes('open: boolean'))
assert.ok(componentContent.includes("width?: 'md' | 'lg' | 'xl'"))
assert.ok(componentContent.includes('title: string'))
assert.ok(componentContent.includes('confirmText?: string'))
assert.ok(componentContent.includes('cancelText?: string'))
assert.ok(componentContent.includes('loading?: boolean'))
assert.ok(componentContent.includes('confirmDisabled?: boolean'))
assert.ok(componentContent.includes('hideFooter?: boolean'))
assert.ok(componentContent.includes('closeOnBackdrop?: boolean'))

// Emits
assert.ok(componentContent.includes("emit('close')"))
assert.ok(componentContent.includes("emit('confirm')"))

// Template classes
assert.ok(componentContent.includes('class="workbench-drawer-form__head"'))
assert.ok(componentContent.includes('class="workbench-drawer-form__head-title"'))
assert.ok(componentContent.includes('class="workbench-drawer-form__head-close"'))
assert.ok(componentContent.includes('class="workbench-drawer-form__body"'))
assert.ok(componentContent.includes('class="workbench-drawer-form__actions"'))
assert.ok(componentContent.includes('workbench-drawer-form__action-btn--ghost'))
assert.ok(componentContent.includes('workbench-drawer-form__action-btn--solid'))
assert.ok(componentContent.includes('workbench-drawer-form__action-btn--loading'))

// Slots
assert.ok(componentContent.includes('<slot />'))
assert.ok(componentContent.includes('name="footer-extra"'))

// Loading + disabled
assert.ok(componentContent.includes(':disabled="loading || confirmDisabled"'))

// CSS
assert.match(
  stylesContent,
  /\.workbench-drawer-form__field-input\s*\{[\s\S]*?height:\s*46px;[\s\S]*?border-radius:\s*12px;/i,
)
assert.match(
  stylesContent,
  /\.workbench-drawer-form__field-input:focus\s*\{[\s\S]*?box-shadow:\s*0\s+0\s+0\s+3px/i,
)
assert.match(
  stylesContent,
  /\.workbench-drawer-form__head-close\s*\{[\s\S]*?width:\s*32px;[\s\S]*?height:\s*32px;/i,
)
assert.match(
  stylesContent,
  /\.workbench-drawer-form__action-btn\s*\{[\s\S]*?height:\s*44px;[\s\S]*?border-radius:\s*12px;/i,
)
assert.match(
  stylesContent,
  /\.workbench-drawer-form__action-btn--solid\s*\{[\s\S]*?min-width:\s*110px;/i,
)
assert.match(
  stylesContent,
  /\.workbench-drawer-form__action-btn--loading\s*\{[\s\S]*?opacity:\s*0\.7;/i,
)
assert.match(
  stylesContent,
  /\.workbench-drawer-form__body\s*\{[\s\S]*?overflow-y:\s*auto;[\s\S]*?gap:\s*14px;/i,
)
assert.match(
  stylesContent,
  /\.workbench-drawer-form__head\s*\{[\s\S]*?display:\s*flex;[\s\S]*?justify-content:\s*space-between;/i,
)
