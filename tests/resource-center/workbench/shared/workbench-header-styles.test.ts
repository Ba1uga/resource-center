import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const sharedHeaderStylesUrl = new URL(
  '../../../../src/features/resource-center/workbench/shared/styles/workbench-header.css',
  import.meta.url,
)
const outlineStylesUrl = new URL(
  '../../../../src/features/resource-center/workbench/outline/styles/outline-workbench.css',
  import.meta.url,
)
const textbookStylesUrl = new URL(
  '../../../../src/features/resource-center/workbench/textbook/styles/textbook-workbench.css',
  import.meta.url,
)
const videoStylesUrl = new URL(
  '../../../../src/features/resource-center/workbench/video/styles/video-workbench.css',
  import.meta.url,
)
const coursewareStylesUrl = new URL(
  '../../../../src/features/resource-center/workbench/courseware/styles/courseware-workbench.css',
  import.meta.url,
)
const questionStylesUrl = new URL(
  '../../../../src/features/resource-center/workbench/question/styles/question-workbench.css',
  import.meta.url,
)
const moduleShellStylesUrl = new URL(
  '../../../../src/features/resource-center/workbench/shared/styles/module-workbench-shell.css',
  import.meta.url,
)

for (const fileUrl of [
  sharedHeaderStylesUrl,
  outlineStylesUrl,
  textbookStylesUrl,
  videoStylesUrl,
  coursewareStylesUrl,
  questionStylesUrl,
  moduleShellStylesUrl,
]) {
  assert.equal(existsSync(fileUrl), true, `${fileUrl.pathname.split('/').at(-1)} must exist`)
}

const sharedHeaderStyles = readFileSync(sharedHeaderStylesUrl, 'utf8')
const outlineStyles = readFileSync(outlineStylesUrl, 'utf8')
const textbookStyles = readFileSync(textbookStylesUrl, 'utf8')
const videoStyles = readFileSync(videoStylesUrl, 'utf8')
const coursewareStyles = readFileSync(coursewareStylesUrl, 'utf8')
const questionStyles = readFileSync(questionStylesUrl, 'utf8')
const moduleShellStyles = readFileSync(moduleShellStylesUrl, 'utf8')

assert.ok(outlineStyles.includes("@import '../../shared/styles/workbench-header.css';"))
assert.ok(textbookStyles.includes("@import '../../shared/styles/workbench-header.css';"))
assert.ok(videoStyles.includes("@import '../../shared/styles/workbench-header.css';"))
assert.ok(coursewareStyles.includes("@import '../../shared/styles/workbench-header.css';"))
assert.ok(questionStyles.includes("@import '../../shared/styles/workbench-header.css';"))
assert.ok(moduleShellStyles.includes("@import './workbench-header.css';"))

assert.ok(sharedHeaderStyles.includes('.outline-management__heading h2'))
assert.ok(sharedHeaderStyles.includes('.textbook-management__heading h2'))
assert.ok(sharedHeaderStyles.includes('.video-management__heading h2'))
assert.ok(sharedHeaderStyles.includes('.courseware-management__head h2'))
assert.ok(sharedHeaderStyles.includes('.question-management__head h2'))
assert.ok(sharedHeaderStyles.includes('.module-workbench-shell__title'))
assert.ok(sharedHeaderStyles.includes('.outline-management__scope-pill'))
assert.ok(sharedHeaderStyles.includes('.textbook-management__scope-pill'))
assert.ok(sharedHeaderStyles.includes('.video-management__copy'))

assert.match(
  sharedHeaderStyles,
  /font-size:\s*clamp\(1\.5rem,\s*2vw,\s*1\.95rem\);[\s\S]*?font-weight:\s*700;[\s\S]*?letter-spacing:\s*-0\.04em;[\s\S]*?line-height:\s*1\.1;/i,
)
assert.match(
  sharedHeaderStyles,
  /padding:\s*7px 12px;[\s\S]*?font-size:\s*0\.82rem;[\s\S]*?font-weight:\s*600;[\s\S]*?line-height:\s*1\.2;[\s\S]*?white-space:\s*nowrap;/i,
)
