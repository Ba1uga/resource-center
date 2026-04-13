import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const topbarStyles = readFileSync(
  new URL('../../../src/views/resource-center/layout/resource-center-topbar.css', import.meta.url),
  'utf8',
)

assert.match(
  topbarStyles,
  /\.topbar-shell\s*\{[\s\S]*?position:\s*sticky;[\s\S]*?top:\s*0;[\s\S]*?z-index:\s*\d+;/,
)
assert.match(
  topbarStyles,
  /@media \(max-width: 1100px\)\s*\{[\s\S]*?\.topbar-shell\s*\{[\s\S]*?position:\s*static;[\s\S]*?top:\s*auto;/,
)
