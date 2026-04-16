import path from 'node:path'
import { promises as fs } from 'node:fs'

const runningDir = process.cwd()
const appPath = path.join(runningDir, 'src/app/App.vue')
const pagePath = path.join(runningDir, 'src/views/resource-center/ResourceCenterPage.vue')
const pageStylesPath = path.join(runningDir, 'src/views/resource-center/resource-center-page.css')
const shellPath = path.join(runningDir, 'src/features/resource-center/workbench/shared/ui/ModuleWorkbenchShell.vue')
const workbenchSectionPath = path.join(runningDir, 'src/features/resource-center/workbench/shared/ui/WorkbenchSection.vue')

async function assertFileExists(p: string, name: string) {
  try {
    await fs.access(p)
  } catch (error) {
    throw new Error(`${name} must exist at ${p}`)
  }
}

async function readFile(p: string) {
  return fs.readFile(p, 'utf-8')
}

async function main() {
  await assertFileExists(pagePath, 'ResourceCenterPage.vue')
  await assertFileExists(pageStylesPath, 'resource-center-page.css')
  await assertFileExists(shellPath, 'ModuleWorkbenchShell.vue')
  await assertFileExists(workbenchSectionPath, 'WorkbenchSection.vue')

  const pageContent = await readFile(pagePath)
  const pageStyles = await readFile(pageStylesPath)
  if (!/const activeSection = ref(?:<[^>]+>)?\('outline'\)/.test(pageContent)) {
    throw new Error("ResourceCenterPage.vue must define const activeSection = ref('outline') style initializer")
  }

  if (!pageContent.includes('class="dashboard-frame"')) {
    throw new Error('ResourceCenterPage.vue must contain class="dashboard-frame"')
  }

  if (!pageContent.includes('ResourceCenterSidebar')) {
    throw new Error('ResourceCenterPage.vue must include ResourceCenterSidebar')
  }

  if (pageContent.includes('ResourceCenterTopbar')) {
    throw new Error('ResourceCenterPage.vue must not include ResourceCenterTopbar')
  }

  if (!pageContent.includes(':profile="teacherProfile"')) {
    throw new Error('ResourceCenterSidebar must receive teacherProfile')
  }

  if (pageContent.includes('ResourceOverviewSection')) {
    throw new Error('ResourceCenterPage.vue must not include ResourceOverviewSection')
  }

  if (pageContent.includes('ResourcePlaceholderSection')) {
    throw new Error('ResourceCenterPage.vue must not include ResourcePlaceholderSection')
  }

  if (
    !pageContent.includes(
      "import WorkbenchSection from '@/features/resource-center/workbench/shared/ui/WorkbenchSection.vue'",
    )
  ) {
    throw new Error('ResourceCenterPage.vue must include feature-owned WorkbenchSection')
  }

  for (const directImport of [
    "@/features/resource-center/navigation/model/navigation.config.ts",
    "@/features/resource-center/navigation/model/navigation.types.ts",
    "@/features/resource-center/profile/model/profile.fixture.ts",
    "@/features/resource-center/workbench/shared/model/workbench.registry.ts",
  ]) {
    if (!pageContent.includes(directImport)) {
      throw new Error(`ResourceCenterPage.vue must import directly from ${directImport}`)
    }
  }

  if (pageContent.includes("@/features/resource-center/index.ts")) {
    throw new Error('ResourceCenterPage.vue must not import the removed feature barrel')
  }

  if (!pageContent.includes('resolveWorkbenchSectionMeta')) {
    throw new Error('ResourceCenterPage.vue must resolve workbench meta from registry')
  }

  if (pageContent.includes('createDashboardViewModel')) {
    throw new Error('ResourceCenterPage.vue must not depend on createDashboardViewModel after overview removal')
  }

  if (!pageContent.includes('createNavigationItems')) {
    throw new Error('ResourceCenterPage.vue must build sidebar items directly from createNavigationItems')
  }

  if (
    !pageContent.includes('<WorkbenchSection :section="activeWorkbenchSection" :current-teacher-name="teacherProfile.name" />')
  ) {
    throw new Error('ResourceCenterPage.vue must pass teacherProfile.name into WorkbenchSection')
  }

  if (
    !/\.dashboard-main\s*\{[\s\S]*?padding-right:\s*0;[\s\S]*?overflow-y:\s*auto;[\s\S]*?scrollbar-gutter:\s*auto;/i.test(
      pageStyles,
    )
  ) {
    throw new Error(
      'resource-center-page.css must not reserve a persistent right gutter inside dashboard-main',
    )
  }

  if (pageContent.includes("@/views/resource-center/sections/")) {
    throw new Error('ResourceCenterPage.vue must not import workbench sections from views')
  }

  const keepsTabletFrameHeight =
    /@media \(max-width: 1100px\)\s*\{[\s\S]*?\.dashboard-frame\s*\{[\s\S]*?height:\s*calc\(100vh - 48px\);[\s\S]*?min-height:\s*calc\(100vh - 48px\);[\s\S]*?grid-template-columns:\s*1fr;[\s\S]*?grid-template-rows:\s*auto minmax\(0,\s*1fr\);/i.test(
      pageStyles,
    )
  const keepsTabletMainHeight =
    /@media \(max-width: 1100px\)\s*\{[\s\S]*?\.dashboard-main\s*\{[\s\S]*?height:\s*100%;[\s\S]*?min-height:\s*0;/i.test(
      pageStyles,
    )

  if (!keepsTabletFrameHeight || !keepsTabletMainHeight) {
    throw new Error(
      'resource-center-page.css must keep a fixed-height main work area on <=1100px screens',
    )
  }

  if (
    !/@media \(max-width: 760px\)\s*\{[\s\S]*?\.dashboard-frame\s*\{[\s\S]*?height:\s*calc\(100vh - 28px\);[\s\S]*?min-height:\s*calc\(100vh - 28px\);/i.test(
      pageStyles,
    )
  ) {
    throw new Error(
      'resource-center-page.css must resize dashboard-frame to the mobile viewport height budget',
    )
  }

  for (const removedSection of [
    'ResourceOverviewSection',
    'OutlineWorkbenchSection',
    'TextbookWorkbenchSection',
    'CoursewareWorkbenchSection',
    'VideoWorkbenchSection',
    'QuestionWorkbenchSection',
    'MappingWorkbenchSection',
  ]) {
    if (pageContent.includes(removedSection)) {
      throw new Error(`ResourceCenterPage.vue should not import ${removedSection}`)
    }
  }

  const appContent = await readFile(appPath)
  if (!appContent.includes('ResourceCenterPage')) {
    throw new Error('src/app/App.vue must reference ResourceCenterPage')
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
