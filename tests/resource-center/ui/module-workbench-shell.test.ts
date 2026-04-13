import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const moduleWorkbenchShell = readFileSync(
  new URL('../../../src/views/resource-center/sections/ModuleWorkbenchShell.vue', import.meta.url),
  'utf8',
)
const moduleWorkbenchShellStyles = readFileSync(
  new URL('../../../src/views/resource-center/sections/module-workbench-shell.css', import.meta.url),
  'utf8',
)
const panelPrimitivesStyles = readFileSync(
  new URL('../../../src/features/resource-center/shared/styles/panel-primitives.css', import.meta.url),
  'utf8',
)
const surfaceStyles = readFileSync(
  new URL('../../../src/views/resource-center/styles/workbench-surface.css', import.meta.url),
  'utf8',
)

assert.match(moduleWorkbenchShell, /import\s+['"]\.\/module-workbench-shell\.css['"]/)
assert.match(
  moduleWorkbenchShell,
  /defineProps<\{[\s\S]*?kicker:\s*string;[\s\S]*?title:\s*string;[\s\S]*?description:\s*string;[\s\S]*?status:\s*string;?[\s\S]*?\}>\(\)/,
)
assert.ok(moduleWorkbenchShell.includes('class="module-workbench-shell workbench-surface"'))
assert.ok(moduleWorkbenchShell.includes('class="module-workbench-shell__head"'))
assert.ok(moduleWorkbenchShell.includes('class="module-workbench-shell__copy"'))
assert.ok(moduleWorkbenchShell.includes('class="module-workbench-shell__panel"'))
assert.ok(moduleWorkbenchShell.includes('<slot />'))
assert.match(moduleWorkbenchShell, /<p class="panel-kicker">\s*\{\{\s*kicker\s*\}\}\s*<\/p>/)
assert.match(moduleWorkbenchShell, /<h2>\s*\{\{\s*title\s*\}\}\s*<\/h2>/)
assert.match(
  moduleWorkbenchShell,
  /<p class="module-workbench-shell__description">\s*\{\{\s*description\s*\}\}\s*<\/p>/,
)
assert.match(moduleWorkbenchShell, /<span class="panel-pill">\s*\{\{\s*status\s*\}\}\s*<\/span>/)

assert.match(
  moduleWorkbenchShellStyles,
  /@import ['"]\.\.\/\.\.\/\.\.\/features\/resource-center\/shared\/styles\/panel-primitives\.css['"];/i,
)
assert.match(
  moduleWorkbenchShellStyles,
  /\.module-workbench-shell\s*\{[\s\S]*?display:\s*grid;[\s\S]*?gap:\s*18px;/i,
)
assert.match(
  moduleWorkbenchShellStyles,
  /\.module-workbench-shell__head\s*\{[\s\S]*?display:\s*flex;[\s\S]*?align-items:\s*flex-start;[\s\S]*?justify-content:\s*space-between;[\s\S]*?gap:\s*16px;/,
)
assert.match(
  moduleWorkbenchShellStyles,
  /\.module-workbench-shell__copy\s*\{[\s\S]*?display:\s*grid;[\s\S]*?gap:\s*8px;[\s\S]*?min-width:\s*0;/,
)
assert.match(
  moduleWorkbenchShellStyles,
  /\.module-workbench-shell__description\s*\{[\s\S]*?margin:\s*0;[\s\S]*?max-width:\s*56rem;[\s\S]*?color:\s*var\(--text-soft\);[\s\S]*?font-size:\s*0\.98rem;[\s\S]*?line-height:\s*1\.8;/,
)
assert.match(
  moduleWorkbenchShellStyles,
  /\.module-workbench-shell__panel\s*\{[\s\S]*?min-width:\s*0;[\s\S]*?padding:\s*clamp\(20px,\s*2\.2vw,\s*28px\);[\s\S]*?border:\s*1px solid oklch\(1 0 0 \/ 0\.72\);[\s\S]*?border-radius:\s*26px;[\s\S]*?background:\s*#FFFFFF;[\s\S]*?box-shadow:\s*var\(--shadow-soft\);/,
)
assert.match(
  moduleWorkbenchShellStyles,
  /\.module-workbench-placeholder\s*\{[\s\S]*?display:\s*grid;[\s\S]*?gap:\s*10px;/,
)
assert.match(
  moduleWorkbenchShellStyles,
  /\.module-workbench-placeholder strong\s*\{[\s\S]*?display:\s*block;[\s\S]*?font-size:\s*1\.08rem;[\s\S]*?letter-spacing:\s*-0\.02em;/,
)
assert.match(
  moduleWorkbenchShellStyles,
  /\.module-workbench-placeholder p\s*\{[\s\S]*?margin:\s*0;[\s\S]*?color:\s*var\(--text-soft\);[\s\S]*?font-size:\s*0\.98rem;[\s\S]*?line-height:\s*1\.8;/,
)
assert.match(
  moduleWorkbenchShellStyles,
  /@media \(max-width: 760px\)\s*\{[\s\S]*?\.module-workbench-shell__head\s*\{[\s\S]*?flex-direction:\s*column;[\s\S]*?justify-content:\s*flex-start;/,
)
assert.match(
  moduleWorkbenchShellStyles,
  /@media \(max-width: 760px\)\s*\{[\s\S]*?\.module-workbench-shell__panel\s*\{[\s\S]*?padding:\s*20px;[\s\S]*?border-radius:\s*22px;/,
)

assert.match(
  panelPrimitivesStyles,
  /\.panel-kicker\s*\{[\s\S]*?letter-spacing:\s*0\.08em;[\s\S]*?text-transform:\s*uppercase;/i,
)
assert.match(panelPrimitivesStyles, /\.panel-pill\s*\{[\s\S]*?border-radius:\s*999px;/i)
assert.match(panelPrimitivesStyles, /\.panel-pill\.solid\s*\{[\s\S]*?background:\s*linear-gradient\(/i)

assert.match(
  surfaceStyles,
  /\.workbench-surface\s*\{[\s\S]*?width:\s*100%;[\s\S]*?min-width:\s*0;[\s\S]*?padding:\s*clamp\(18px,\s*2vw,\s*26px\);[\s\S]*?border:\s*1px solid oklch\(1 0 0 \/ 0\.65\);[\s\S]*?border-radius:\s*30px;[\s\S]*?background:\s*#F7F7F7;[\s\S]*?box-shadow:\s*var\(--shadow-panel\);/i,
)
assert.match(
  surfaceStyles,
  /@media \(max-width: 760px\)\s*\{[\s\S]*?\.workbench-surface\s*\{[\s\S]*?padding:\s*16px;[\s\S]*?border-radius:\s*24px;/,
)
