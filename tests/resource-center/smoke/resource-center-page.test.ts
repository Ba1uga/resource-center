import path from 'node:path'
import { promises as fs } from 'node:fs'

const runningDir = process.cwd()
const appPath = path.join(runningDir, 'src/app/App.vue')
const pagePath = path.join(runningDir, 'src/views/resource-center/ResourceCenterPage.vue')

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

  const pageContent = await readFile(pagePath)
  if (!pageContent.includes("const activeSection = ref('resourceOverview')")) {
    throw new Error("ResourceCenterPage.vue must define const activeSection = ref('resourceOverview')")
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

  if (!pageContent.includes('ResourcePlaceholderSection')) {
    throw new Error('ResourceCenterPage.vue must include ResourcePlaceholderSection')
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
