<script setup lang="ts">
import { computed, ref } from 'vue'
import { createDashboardViewModel } from './dashboard-content.js'

const activeSection = ref('home')
const dashboard = computed(() => createDashboardViewModel(activeSection.value))

const iconPaths: Record<string, string> = {
  home: 'M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z',
  dashboard: 'M4 4h7v7H4zm9 0h7v5h-7zM4 13h7v7H4zm9 7v-9h7v9z',
  tree: 'M12 3v5m0 0a3 3 0 1 0 0 6m0-6a3 3 0 1 1 0 6m0 0v7m-6-4h12',
  book: 'M6 5.5A2.5 2.5 0 0 1 8.5 3H19v16H8.5A2.5 2.5 0 0 0 6 21zM6 5.5V21H5a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2z',
  layers: 'M12 4 4 8l8 4 8-4zm-8 8 8 4 8-4m-16 4 8 4 8-4',
  play: 'M8 6.5v11l9-5.5z',
  clipboard:
    'M9 4.5A2.5 2.5 0 0 1 11.5 2h1A2.5 2.5 0 0 1 15 4.5H18A2 2 0 0 1 20 6.5v13A2.5 2.5 0 0 1 17.5 22h-11A2.5 2.5 0 0 1 4 19.5v-13A2 2 0 0 1 6 4.5zM8 9h8m-8 4h8m-8 4h5',
  link: 'M10.5 13.5 13.5 10.5m-5.5 7.5H6.75a3.75 3.75 0 0 1 0-7.5H10m4 0h3.25a3.75 3.75 0 0 1 0 7.5H14',
  mail: 'M4 7.5h16v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm0 0 8 6 8-6',
  bell: 'M12 3a4 4 0 0 1 4 4v1.35c0 .78.23 1.54.66 2.19L18 12.5v1.5H6v-1.5l1.34-1.96A4 4 0 0 0 8 8.35V7a4 4 0 0 1 4-4zm0 18a3 3 0 0 1-2.82-2h5.64A3 3 0 0 1 12 21z',
  spark: 'M12 3 13.9 8.1 19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z',
  radar: 'M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0M12 12l4-4M12 7.5a4.5 4.5 0 1 0 4.5 4.5',
  arrowUp: 'M12 19V7m0 0-5 5m5-5 5 5',
  arrowTrend: 'm6 14 4-4 3 3 5-6',
}
</script>

<template>
  <div class="page-shell">
    <div class="page-glow page-glow-left"></div>
    <div class="page-glow page-glow-right"></div>

    <div class="dashboard-frame">
      <aside class="sidebar">
        <div class="brand-block">
          <div class="brand-mark">
            <span></span>
          </div>
          <div>
            <p class="brand-eyebrow">Teaching Resource</p>
            <h1 class="brand-title">资源中台</h1>
          </div>
        </div>

        <nav class="sidebar-nav" aria-label="主导航">
          <button
            v-for="item in dashboard.navigation"
            :key="item.key"
            type="button"
            class="nav-item"
            :class="{ active: item.active }"
            @click="activeSection = item.key"
          >
            <span class="nav-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path :d="iconPaths[item.icon]"></path>
              </svg>
            </span>
            <span>{{ item.label }}</span>
          </button>
        </nav>

        <div class="sidebar-footer">
          <p class="sidebar-footnote">今日完成率</p>
          <strong>82%</strong>
          <span>资源挂载建议正在持续学习你的教学节奏。</span>
        </div>
      </aside>

      <main class="dashboard-main">
        <header class="topbar topbar-shell">
          <div class="topbar-leading" aria-hidden="true">
            <div class="topbar-leading-pill"></div>
          </div>

          <div class="topbar-actions topbar-actions-compact">
            <button class="notify-button quiet" type="button" aria-label="快捷消息">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path :d="iconPaths.mail"></path>
              </svg>
            </button>

            <span class="topbar-status-dot" aria-hidden="true"></span>

            <button class="notify-button" type="button" aria-label="提示消息">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path :d="iconPaths.bell"></path>
              </svg>
              <span class="notify-badge">3</span>
            </button>

            <section class="profile-card" aria-label="当前登录用户">
              <div class="profile-avatar">林</div>
              <div>
                <strong>{{ dashboard.profile.name }}</strong>
                <p>{{ dashboard.profile.role }} · {{ dashboard.profile.campus }}</p>
              </div>
            </section>
          </div>
        </header>

        <section v-if="activeSection === 'home'" class="home-view">
          <article class="panel home-hero">
            <div class="panel-head">
              <div>
                <p class="panel-kicker">首页</p>
                <h3>返回首页</h3>
              </div>
              <span class="panel-pill">总入口</span>
            </div>

            <p class="home-hero-copy">
              这里作为资源中台的首页落地层，先提供今日教学节奏、当前备课重点和下一步建议。
              需要查看完整统计卡片、最近动态和 AI 建议时，点击左侧“资源总览”进入。
            </p>

            <div class="home-highlight-grid">
              <article
                v-for="highlight in dashboard.homeHighlights"
                :key="highlight.key"
                class="home-highlight-card"
              >
                <span>{{ highlight.label }}</span>
                <strong>{{ highlight.value }}</strong>
                <p>{{ highlight.detail }}</p>
              </article>
            </div>
          </article>

          <article class="panel home-landing">
            <div class="panel-head">
              <div>
                <p class="panel-kicker">快捷导航</p>
                <h3>从首页进入工作流</h3>
              </div>
              <span class="panel-pill solid">建议先看总览</span>
            </div>

            <div class="home-action-stack">
              <button type="button" class="home-overview-entry" @click="activeSection = 'resourceOverview'">
                <span class="home-entry-badge">资源总览</span>
                <strong>查看资源统计、最近动态与 AI 建议</strong>
                <p>这是你圈出来的三段式主体内容入口，点击后进入完整资源总览视图。</p>
              </button>

              <div class="home-mini-grid">
                <article v-for="item in dashboard.navigation.slice(2)" :key="item.key" class="home-mini-card">
                  <strong>{{ item.label }}</strong>
                  <p>后续可在这里承接对应模块的独立页面或工作台内容。</p>
                </article>
              </div>
            </div>
          </article>
        </section>

        <template v-else-if="activeSection === 'resourceOverview'">
        <section class="metrics-grid">
          <article
            v-for="metric in dashboard.metrics"
            :key="metric.key"
            class="metric-card"
            :class="[`tone-${metric.tone}`, { featured: metric.key === 'outlineNodes' }]"
          >
            <div class="metric-head">
              <span>{{ metric.label }}</span>
              <span class="metric-chip">{{ metric.delta }}</span>
            </div>
            <div class="metric-value">
              {{ metric.value }}
              <small>{{ metric.unit }}</small>
            </div>
            <p>{{ metric.detail }}</p>
          </article>
        </section>

        <section class="content-grid">
          <article class="panel recent-panel">
            <div class="panel-head">
              <div>
                <p class="panel-kicker">最近动态</p>
                <h3>教师最近操作</h3>
              </div>
              <span class="panel-pill">今日 {{ dashboard.activities.length }} 条</span>
            </div>

            <ul class="activity-list">
              <li v-for="activity in dashboard.activities" :key="activity.id" class="activity-item">
                <div class="avatar-chip" :data-accent="activity.accent">{{ activity.initials }}</div>
                <div class="activity-main">
                  <strong>{{ activity.actor }}</strong>
                  <p>{{ activity.action }}</p>
                  <span>{{ activity.note }}</span>
                </div>
                <time>{{ activity.time }}</time>
              </li>
            </ul>
          </article>

          <article class="panel signal-panel">
            <div class="panel-head">
              <div>
                <p class="panel-kicker">AI 智能建议</p>
                <h3>今日优先事项</h3>
              </div>
              <span class="panel-pill solid">建议驱动</span>
            </div>

            <div class="suggestion-stack">
              <article v-for="suggestion in dashboard.suggestions" :key="suggestion.id" class="suggestion-card">
                <span class="suggestion-level">{{ suggestion.level }}</span>
                <h4>{{ suggestion.title }}</h4>
                <p>{{ suggestion.description }}</p>
                <button type="button">{{ suggestion.action }}</button>
              </article>
            </div>
          </article>
        </section>

        <section class="bottom-grid">
          <article class="panel module-panel">
            <div class="panel-head">
              <div>
                <p class="panel-kicker">快捷入口</p>
                <h3>资源模块一览</h3>
              </div>
              <span class="panel-pill">{{ dashboard.summary.coverageLabel }}</span>
            </div>

            <div class="module-grid">
              <article
                v-for="module in dashboard.modules"
                :key="module.key"
                class="module-card"
                :data-accent="module.accent"
              >
                <div class="module-card-head">
                  <h4>{{ module.label }}</h4>
                  <span>{{ module.count }} 项</span>
                </div>
                <p>{{ module.description }}</p>
                <div class="module-progress">
                  <span>完成度</span>
                  <strong>{{ module.completion }}%</strong>
                </div>
              </article>
            </div>
          </article>

          <article class="panel analysis-panel">
            <div class="panel-head">
              <div>
                <p class="panel-kicker">资源分析</p>
                <h3>知识点挂载概况</h3>
              </div>
              <span class="panel-pill">{{ dashboard.summary.totalResources }} 份资源</span>
            </div>

            <div class="analysis-overview">
              <div class="overview-copy">
                <strong>{{ dashboard.summary.topModule.label }}</strong>
                <p>当前资源量最高，建议优先同步讲评资源与视频讲解。</p>
              </div>
              <div class="overview-trend">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path :d="iconPaths.arrowTrend"></path>
                </svg>
                <span>资源增长稳步上升</span>
              </div>
            </div>

            <div class="distribution-chart">
              <div v-for="item in dashboard.distribution" :key="item.label" class="distribution-row">
                <div class="distribution-meta">
                  <span>{{ item.label }}</span>
                  <strong>{{ item.value }}</strong>
                </div>
                <div class="distribution-bar">
                  <span :style="{ width: `${item.ratio}%` }"></span>
                </div>
              </div>
            </div>

            <div class="chapter-list">
              <article v-for="chapter in dashboard.chapters" :key="chapter.chapter" class="chapter-item">
                <div>
                  <strong>{{ chapter.chapter }}</strong>
                  <span>{{ chapter.focus }}</span>
                </div>
                <div class="chapter-progress">
                  <span :style="{ width: `${chapter.completion}%` }"></span>
                </div>
                <em>{{ chapter.completion }}%</em>
              </article>
            </div>

            <div class="action-strip">
              <button v-for="action in dashboard.actions" :key="action.key" class="action-chip" type="button">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path :d="iconPaths[action.icon]"></path>
                </svg>
                <span>
                  <strong>{{ action.label }}</strong>
                  <small>{{ action.caption }}</small>
                </span>
              </button>
            </div>
          </article>
        </section>
        </template>

        <section v-else class="module-placeholder">
          <article class="panel module-placeholder-card">
            <div class="panel-head">
              <div>
                <p class="panel-kicker">模块视图</p>
                <h3>{{ dashboard.activeNavigation?.label }}</h3>
              </div>
              <span class="panel-pill">待展开</span>
            </div>

            <p class="module-placeholder-copy">
              当前先把“资源总览”独立成可切换入口。这个模块后续可以接入对应的详情页、
              列表页或工作台视图。
            </p>
          </article>
        </section>
      </main>
    </div>
  </div>
</template>
