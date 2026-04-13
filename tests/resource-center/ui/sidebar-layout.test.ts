import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const sidebar = readFileSync(
  new URL('../../../src/features/resource-center/navigation/ui/ResourceCenterSidebar.vue', import.meta.url),
  'utf8',
)
const css = readFileSync(
  new URL('../../../src/features/resource-center/navigation/ui/resource-center-sidebar.css', import.meta.url),
  'utf8',
)

assert.ok(sidebar.includes('class="nav-unsaved-dot"'))
assert.ok(sidebar.includes('aria-label="主导航"'))
assert.ok(sidebar.includes('资源中台'))
assert.match(css, /\.sidebar\s*\{[\s\S]*?#F7F7F7/i)
assert.match(css, /\.nav-item\.active::before\s*\{[\s\S]*?width:\s*11px;/i)
assert.match(css, /\.nav-item\.active::before\s*\{[\s\S]*?top:\s*calc\(50%\s*\+\s*2px\);/i)
assert.match(css, /\.nav-item\.active\s+\.nav-icon\s*\{[\s\S]*?color:\s*#34425C;/i)
assert.match(
  css,
  /@media \(max-width: 760px\)\s*\{[\s\S]*?\.sidebar-nav\s*\{[\s\S]*?grid-template-columns:\s*1fr;/,
)
