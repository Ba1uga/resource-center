import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const moduleWorkbenchShell = readFileSync(
  new URL('../../../../src/features/resource-center/workbench/shared/ui/ModuleWorkbenchShell.vue', import.meta.url),
  'utf8',
)
const moduleWorkbenchShellStyles = readFileSync(
  new URL('../../../../src/features/resource-center/workbench/shared/styles/module-workbench-shell.css', import.meta.url),
  'utf8',
)
const surfaceStyles = readFileSync(
  new URL('../../../../src/features/resource-center/workbench/shared/styles/workbench-surface.css', import.meta.url),
  'utf8',
)

assert.match(moduleWorkbenchShell, /import\s+['"]\.\.\/styles\/module-workbench-shell\.css['"]/)
assert.match(moduleWorkbenchShell, /defineProps<\{[\s\S]*?title:\s*string;?[\s\S]*?\}>\(\)/)
assert.ok(moduleWorkbenchShell.includes('class="module-workbench-shell workbench-surface"'))
assert.match(moduleWorkbenchShell, /<h2 class="module-workbench-shell__title">\s*\{\{\s*title\s*\}\}\s*<\/h2>/)
assert.ok(moduleWorkbenchShell.includes('<slot />'))
assert.match(moduleWorkbenchShell, /<\/h2>\s*<slot\s*\/>/)
assert.ok(!moduleWorkbenchShell.includes('module-workbench-shell__head'))
assert.ok(!moduleWorkbenchShell.includes('module-workbench-shell__copy'))
assert.ok(!moduleWorkbenchShell.includes('module-workbench-shell__description'))
assert.ok(!moduleWorkbenchShell.includes('module-workbench-shell__panel'))
assert.ok(!moduleWorkbenchShell.includes('panel-kicker'))
assert.ok(!moduleWorkbenchShell.includes('panel-pill'))
assert.ok(!moduleWorkbenchShell.includes('kicker: string'))
assert.ok(!moduleWorkbenchShell.includes('description: string'))
assert.ok(!moduleWorkbenchShell.includes('status: string'))

assert.ok(!moduleWorkbenchShellStyles.includes('panel-primitives.css'))
assert.match(moduleWorkbenchShellStyles, /@import ['"]\.\/workbench-surface\.css['"];/i)
assert.match(moduleWorkbenchShellStyles, /@import ['"]\.\/workbench-header\.css['"];/i)
assert.match(
  moduleWorkbenchShellStyles,
  /\.module-workbench-shell\s*\{[\s\S]*?display:\s*grid;[\s\S]*?width:\s*100%;[\s\S]*?min-width:\s*0;[\s\S]*?gap:\s*18px;/i,
)
assert.match(
  moduleWorkbenchShellStyles,
  /\.module-workbench-shell\s*\{[\s\S]*?grid-template-rows:\s*auto minmax\(0,\s*1fr\);[\s\S]*?align-self:\s*stretch;[\s\S]*?height:\s*100%;[\s\S]*?min-height:\s*100%;/i,
)
assert.match(moduleWorkbenchShellStyles, /\.module-workbench-shell\s*>\s*\*\s*\{[\s\S]*?min-width:\s*0;/i)
assert.equal(moduleWorkbenchShellStyles.includes('.module-workbench-shell__title'), false)
assert.ok(!moduleWorkbenchShellStyles.includes('.module-workbench-shell__head'))
assert.ok(!moduleWorkbenchShellStyles.includes('.module-workbench-shell__copy'))
assert.ok(!moduleWorkbenchShellStyles.includes('.module-workbench-shell__description'))
assert.ok(!moduleWorkbenchShellStyles.includes('.module-workbench-shell__panel'))

assert.match(
  surfaceStyles,
  /\.workbench-surface\s*\{[\s\S]*?width:\s*100%;[\s\S]*?min-width:\s*0;[\s\S]*?padding:\s*clamp\(18px,\s*2vw,\s*26px\);[\s\S]*?border:\s*1px solid oklch\(1 0 0 \/ 0\.65\);[\s\S]*?border-radius:\s*30px;[\s\S]*?background:\s*#F7F7F7;[\s\S]*?box-shadow:\s*var\(--shadow-panel\);/i,
)
assert.match(
  surfaceStyles,
  /@media \(max-width: 760px\)\s*\{[\s\S]*?\.workbench-surface\s*\{[\s\S]*?padding:\s*16px;[\s\S]*?border-radius:\s*24px;/,
)
