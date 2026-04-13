import path from 'node:path'
import { promises as fs } from 'node:fs'

const runningDir = process.cwd()
const appPath = path.join(runningDir, 'src/app/App.vue')
const pagePath = path.join(runningDir, 'src/views/resource-center/ResourceCenterPage.vue')
const shellPath = path.join(runningDir, 'src/views/resource-center/sections/ModuleWorkbenchShell.vue')
const workbenchSectionPath = path.join(runningDir, 'src/views/resource-center/sections/WorkbenchSection.vue')

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
  await assertFileExists(shellPath, 'ModuleWorkbenchShell.vue')
  await assertFileExists(workbenchSectionPath, 'WorkbenchSection.vue')

  const pageContent = await readFile(pagePath)
  if (!/const activeSection = ref(?:<[^>]+>)?\('resourceOverview'\)/.test(pageContent)) {
    throw new Error("ResourceCenterPage.vue must define const activeSection = ref('resourceOverview') style initializer")
  }

  if (!pageContent.includes('class="dashboard-frame"')) {
    throw new Error('ResourceCenterPage.vue must contain class="dashboard-frame"')
  }

  if (!pageContent.includes('ResourceCenterSidebar')) {
    throw new Error('ResourceCenterPage.vue must include ResourceCenterSidebar')
  }

  if (!pageContent.includes('ResourceCenterTopbar')) {
    throw new Error('ResourceCenterPage.vue must include ResourceCenterTopbar')
  }

  if (!pageContent.includes('ResourceOverviewSection')) {
    throw new Error('ResourceCenterPage.vue must include ResourceOverviewSection')
  }

  if (pageContent.includes('ResourcePlaceholderSection')) {
    throw new Error('ResourceCenterPage.vue must not include ResourcePlaceholderSection')
  }

  if (!pageContent.includes('WorkbenchSection')) {
    throw new Error('ResourceCenterPage.vue must include WorkbenchSection')
  }

  if (!pageContent.includes('resolveWorkbenchSectionMeta')) {
    throw new Error('ResourceCenterPage.vue must resolve workbench meta from registry')
  }

  if (!pageContent.includes('<WorkbenchSection v-else :section="activeWorkbenchSection" />')) {
    throw new Error(
      'ResourceCenterPage.vue must render WorkbenchSection via <WorkbenchSection v-else :section="activeWorkbenchSection" />',
    )
  }

  for (const removedSection of [
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
