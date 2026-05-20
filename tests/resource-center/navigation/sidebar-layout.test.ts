import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const sidebar = readFileSync(
  new URL('../../../src/features/resource-center/navigation/ui/ResourceCenterSidebar.vue', import.meta.url),
  'utf8',
)
const sidebarCss = readFileSync(
  new URL('../../../src/features/resource-center/navigation/ui/resource-center-sidebar.css', import.meta.url),
  'utf8',
)
const profileCard = readFileSync(
  new URL('../../../src/features/resource-center/profile/ui/ProfileCard.vue', import.meta.url),
  'utf8',
)
const profileCardCss = readFileSync(
  new URL('../../../src/features/resource-center/profile/ui/profile-card.css', import.meta.url),
  'utf8',
)

assert.ok(sidebar.includes('class="nav-unsaved-dot"'))
assert.ok(sidebar.includes('aria-label="主导航"'))
assert.ok(sidebar.includes('资源中台'))
assert.ok(sidebar.includes('ProfileCard'))
assert.ok(sidebar.includes(':profile="profile"'))
assert.ok(sidebar.includes('class="sidebar-profile"'))
assert.match(sidebarCss, /\.sidebar\s*\{[\s\S]*?#F7F7F7/i)
assert.match(sidebarCss, /\.sidebar-profile\s*\{[\s\S]*?margin-top:\s*auto;/i)
assert.match(sidebarCss, /\.nav-item\.active::before\s*\{[\s\S]*?width:\s*11px;/i)
assert.match(sidebarCss, /\.nav-item\.active::before\s*\{[\s\S]*?top:\s*calc\(50%\s*\+\s*2px\);/i)
assert.match(sidebarCss, /\.nav-item\.active\s+\.nav-icon\s*\{[\s\S]*?color:\s*#34425C;/i)
assert.match(
  sidebarCss,
  /@media \(max-width: 760px\)\s*\{[\s\S]*?\.sidebar-nav\s*\{[\s\S]*?grid-template-columns:\s*1fr;/,
)
assert.ok(profileCard.includes('{{ profile.name }}'))
assert.ok(!profileCard.includes('profile.role'))
assert.ok(!profileCard.includes('profile.campus'))
assert.match(profileCardCss, /\.profile-avatar\s*\{[\s\S]*?border-radius:\s*999px;/i)
