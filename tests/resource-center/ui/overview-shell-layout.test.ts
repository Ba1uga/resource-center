import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const overviewSection = readFileSync(
  new URL('../../../src/views/resource-center/sections/ResourceOverviewSection.vue', import.meta.url),
  'utf8',
)
const overviewStyles = readFileSync(
  new URL('../../../src/features/resource-center/dashboard/ui/dashboard-overview.css', import.meta.url),
  'utf8',
)
const sharedSurfaceStyles = readFileSync(
  new URL('../../../src/views/resource-center/styles/workbench-surface.css', import.meta.url),
  'utf8',
)

assert.match(overviewSection, /<section class="overview-shell workbench-surface">[\s\S]*?<DashboardMetricsGrid/)
assert.match(
  overviewSection,
  /<section class="overview-shell workbench-surface">[\s\S]*?<section class="analysis-row">[\s\S]*?<ResourceAnalysisPanel/,
)
assert.match(
  overviewSection,
  /<section class="module-section">[\s\S]*?<ResourceModulePanel/,
)
assert.ok(
  overviewSection.indexOf('ResourceAnalysisPanel') < overviewSection.indexOf('ResourceModulePanel'),
  'ResourceAnalysisPanel should remain inside the overview shell before ResourceModulePanel renders below it',
)

assert.match(
  overviewStyles,
  /\.overview-shell\s+\.panel,\s*[\r\n]+\s*\.overview-shell\s+\.metric-card[\s\S]*?background:\s*#FFFFFF;/i,
)
assert.match(overviewStyles, /\.analysis-row,\s*\.module-section\s*\{[\s\S]*?display:\s*grid;/)
assert.match(
  overviewStyles,
  /@import ['"]\.\.\/\.\.\/shared\/styles\/panel-primitives\.css['"];/i,
)
assert.match(
  overviewStyles,
  /\.overview-shell\s*\{[\s\S]*?width:\s*100%;[\s\S]*?min-width:\s*0;/i,
)
assert.match(
  sharedSurfaceStyles,
  /\.workbench-surface\s*\{[\s\S]*?padding:\s*clamp\(18px,\s*2vw,\s*26px\);[\s\S]*?border-radius:\s*30px;/i,
)
assert.match(
  sharedSurfaceStyles,
  /@media \(max-width: 760px\)\s*\{[\s\S]*?\.workbench-surface\s*\{[\s\S]*?padding:\s*16px;[\s\S]*?border-radius:\s*24px;/,
)
