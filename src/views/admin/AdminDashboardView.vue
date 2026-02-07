<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { BaseTable, AppLoading } from '@/components/common'
import { BaseDropdown } from '@/components/ui'
import {
  getAdminDashboard,
  type AdminDashboardData,
  type AdminDashboardTeacher,
} from '@/services/admin.service'
import {
  ADMIN_DASHBOARD_LABELS,
  AdminStatCardType,
} from '@/config/admin.constants'

const loading = ref(true)
const error = ref<string | null>(null)
const dashboardData = ref<AdminDashboardData | null>(null)

const yearFilter = ref<string>('هذا العام')

async function fetchDashboard() {
  loading.value = true
  error.value = null
  try {
    const response = await getAdminDashboard()
    if (response.success && response.data) {
      dashboardData.value = response.data
    } else {
      dashboardData.value = null
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'حدث خطأ في تحميل لوحة التحكم'
    dashboardData.value = null
  } finally {
    loading.value = false
  }
}

const statCards = computed(() => {
  const d = dashboardData.value
  return [
    {
      type: AdminStatCardType.TOTAL_REGISTRATIONS,
      value: d?.registerationCount ?? 0,
      ...ADMIN_DASHBOARD_LABELS.STATS.TOTAL_REGISTRATIONS,
      iconBg: 'rgba(232, 245, 233, 1)',
    },
    {
      type: AdminStatCardType.PENDING_INTERVIEWS,
      value: d?.interview_count ?? 0,
      ...ADMIN_DASHBOARD_LABELS.STATS.PENDING_INTERVIEWS,
      iconBg: 'rgba(255, 235, 238, 1)',
    },
    {
      type: AdminStatCardType.ACTIVE_STUDENTS,
      value: d?.active_count ?? 0,
      ...ADMIN_DASHBOARD_LABELS.STATS.ACTIVE_STUDENTS,
      iconBg: 'rgba(227, 242, 253, 1)',
    },
    {
      type: AdminStatCardType.WEEKLY_SUBMISSIONS,
      value: d?.attendance_count ?? 0,
      ...ADMIN_DASHBOARD_LABELS.STATS.WEEKLY_SUBMISSIONS,
      iconBg: 'rgba(255, 248, 225, 1)',
    },
  ]
})

const lastActivity = computed(() => dashboardData.value?.last_activity ?? [])

const teachers = computed(() => dashboardData.value?.teachers ?? [])

const monthlyData = computed(() => dashboardData.value?.registerationMonthly ?? [])

const hefazLevels = computed(() => dashboardData.value?.hefaz_levels ?? null)

const hefazLevelsWithPercent = computed(() => {
  const levels = hefazLevels.value
  if (!levels) return []
  const total =
    levels.full + levels.more_20 + levels.from_10_to_20 + levels.from_5_to_9 + levels.less_5
  if (total === 0) return []
  return [
    { key: 'full', percent: Math.round((levels.full / total) * 100), label: ADMIN_DASHBOARD_LABELS.HEFAZ_LEVELS.FULL, color: '#059669' },
    { key: 'more_20', percent: Math.round((levels.more_20 / total) * 100), label: ADMIN_DASHBOARD_LABELS.HEFAZ_LEVELS.MORE_20, color: '#34D399' },
    { key: 'from_10_to_20', percent: Math.round((levels.from_10_to_20 / total) * 100), label: ADMIN_DASHBOARD_LABELS.HEFAZ_LEVELS.FROM_10_TO_20, color: '#6EE7B7' },
    { key: 'from_5_to_9', percent: Math.round((levels.from_5_to_9 / total) * 100), label: ADMIN_DASHBOARD_LABELS.HEFAZ_LEVELS.FROM_5_TO_9, color: '#9CA3AF' },
    { key: 'less_5', percent: Math.round((levels.less_5 / total) * 100), label: ADMIN_DASHBOARD_LABELS.HEFAZ_LEVELS.LESS_5, color: '#6B7280' },
  ]
})

const totalStudentsForChart = computed(() => {
  const levels = hefazLevels.value
  if (!levels) return 0
  return levels.full + levels.more_20 + levels.from_10_to_20 + levels.from_5_to_9 + levels.less_5
})

const hefazConicGradient = computed(() => {
  const levels = hefazLevelsWithPercent.value
  if (levels.length === 0) return '#E5E7EB'
  let prev = 0
  const parts = levels.map((l) => {
    const start = prev
    prev += l.percent
    return `${l.color} ${start}% ${prev}%`
  })
  return `conic-gradient(${parts.join(', ')})`
})

const maxMonthlyValue = computed(() => {
  const arr = monthlyData.value
  if (arr.length === 0) return 1
  const max = Math.max(...arr.map((m) => m.total), 1)
  return Math.ceil(max / 1500) * 1500 || 1500
})

const chartHoverIndex = ref<number | null>(null)

const chartPoints = computed(() => {
  const arr = monthlyData.value
  const max = maxMonthlyValue.value
  const pad = { top: 25, right: 20, bottom: 35, left: 50 }
  const w = 400
  const h = 200
  const chartW = w - pad.left - pad.right
  const chartH = h - pad.top - pad.bottom
  if (arr.length === 0) return { line: '', area: '', points: [] }
  const points = arr.map((m, i) => {
    const x = pad.left + (i / Math.max(arr.length - 1, 1)) * chartW
    const y = pad.top + chartH - (m.total / max) * chartH
    return { x, y, ...m, index: i }
  })
  const smoothPath = createSmoothPath(points.map((p) => [p.x, p.y]))
  const bottomY = pad.top + chartH
  const areaPath = `${smoothPath} L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`
  return { line: smoothPath, area: areaPath, points }
})

function createSmoothPath(pts: number[][]): string {
  if (pts.length === 0) return ''
  if (pts.length === 1) return `M ${pts[0][0]} ${pts[0][1]}`
  const toStr = (x: number, y: number) => `${x} ${y}`
  let d = `M ${toStr(pts[0][0], pts[0][1])}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C ${toStr(cp1x, cp1y)} ${toStr(cp2x, cp2y)} ${toStr(p2[0], p2[1])}`
  }
  return d
}

const yAxisLabels = computed(() => {
  const max = maxMonthlyValue.value
  let step = 1
  if (max > 1000) step = 1500
  else if (max > 100) step = Math.ceil(max / 4 / 100) * 100
  else if (max > 10) step = 25
  else if (max > 1) step = 2
  const labels: string[] = []
  for (let v = 0; v <= max; v += step) {
    labels.push(v >= 1000 ? `${v / 1000}K` : String(v))
  }
  return labels.length > 1 ? labels : ['0', String(max)]
})

const MONTH_SHORT: Record<string, string> = {
  يناير: 'Jan', فبراير: 'Feb', مارس: 'Mar', أبريل: 'Apr', مايو: 'May', يونيو: 'Jun',
  يوليو: 'Jul', أغسطس: 'Aug', سبتمبر: 'Sep', أكتوبر: 'Oct', نوفمبر: 'Nov', ديسمبر: 'Dec',
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

// Light avatar backgrounds for Last Activity timeline (matches design)
const AVATAR_LIGHT_COLORS = [
  { bg: '#D1FAE5', text: '#065F46' },   // light green
  { bg: '#FEE2E2', text: '#991B1B' },   // light red
  { bg: '#DBEAFE', text: '#1E40AF' },   // light blue
  { bg: '#E9D5FF', text: '#6B21A8' },   // light purple
  { bg: '#D1FAE5', text: '#065F46' },   // light green (repeat)
]

function getAvatarStyle(index: number): { backgroundColor: string; color: string } {
  const c = AVATAR_LIGHT_COLORS[index % AVATAR_LIGHT_COLORS.length]
  return { backgroundColor: c.bg, color: c.text }
}

// Group activities by day for timeline display
const lastActivityByDay = computed(() => {
  const items = lastActivity.value
  const groups: { day: string; activities: { item: typeof items[0]; idx: number }[] }[] = []
  let currentDay = ''
  let group: { day: string; activities: { item: typeof items[0]; idx: number }[] } | null = null
  items.forEach((item, idx) => {
    const d = item.day || 'أخرى'
    if (d !== currentDay) {
      currentDay = d
      group = { day: d, activities: [] }
      groups.push(group)
    }
    group!.activities.push({ item, idx })
  })
  return groups
})


function getTeacherAvailability(teacher: AdminDashboardTeacher): number {
  return Math.max(0, teacher.students_count - teacher.current_count)
}

const teacherColumns = [
  { key: 'full_name', label: ADMIN_DASHBOARD_LABELS.TABLE.TEACHER_NAME, width: '25%' },
  { key: 'experience_years', label: ADMIN_DASHBOARD_LABELS.TABLE.SPECIALIZATION, width: '25%' },
  { key: 'current_count', label: ADMIN_DASHBOARD_LABELS.TABLE.ASSIGNED, width: '15%' },
  { key: 'students_count', label: ADMIN_DASHBOARD_LABELS.TABLE.CAPACITY, width: '15%' },
  { key: 'availability', label: ADMIN_DASHBOARD_LABELS.TABLE.AVAILABILITY, width: '20%' },
]

onMounted(() => {
  fetchDashboard()
})
</script>

<template>
  <div class="admin-dashboard" data-component="AdminDashboardView">
    <div v-if="error" class="admin-dashboard__error">{{ error }}</div>

    <div v-if="loading" class="admin-dashboard__loading">
      <AppLoading :full-screen="false" text="جاري تحميل لوحة التحكم..." />
    </div>

    <template v-else-if="dashboardData">
      <!-- Stats Cards (same design & animation as student-dashboard__stats) -->
      <section class="admin-dashboard__stats">
        <div class="admin-dashboard__stats-grid">
          <div
            v-for="card in statCards"
            :key="card.type"
            class="admin-dashboard__stat-card-wrapper"
          >
            <div class="admin-dashboard__stat-card">
              <div
                class="admin-dashboard__stat-icon"
                :style="{ backgroundColor: card.iconBg }"
              >
                <!-- Document icon (weekly submissions) -->
                <svg
                  v-if="card.type === AdminStatCardType.WEEKLY_SUBMISSIONS"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                <!-- Graduation cap (active students) -->
                <svg
                  v-else-if="card.type === AdminStatCardType.ACTIVE_STUDENTS"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
                <!-- Calendar (pending interviews) -->
                <svg
                  v-else-if="card.type === AdminStatCardType.PENDING_INTERVIEWS"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <!-- People (total registrations) -->
                <svg
                  v-else-if="card.type === AdminStatCardType.TOTAL_REGISTRATIONS"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div class="admin-dashboard__stat-content">
                <div class="admin-dashboard__stat-value">
                  <span v-if="loading" class="admin-dashboard__stat-skeleton">---</span>
                  <span v-else>{{ card.value }}</span>
                </div>
                <div class="admin-dashboard__stat-label">{{ card.LABEL }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Two-column layout: Chart on right (8 cols), Activity+Teachers on left (4 cols) -->
      <div class="admin-dashboard__grid">
        <!-- Right column (RTL): Monthly Chart + Memorization - 8/12 width -->
        <div class="admin-dashboard__right admin-dashboard__right--chart">
          <!-- Monthly Registration Chart (top right) -->
          <div class="admin-dashboard__panel admin-dashboard__chart-panel">
            <div class="admin-dashboard__panel-header admin-dashboard__chart-header">
              <h3 class="admin-dashboard__panel-title">{{ ADMIN_DASHBOARD_LABELS.MONTHLY_REGISTRATION }}</h3>
              <BaseDropdown
                v-model="yearFilter"
                :options="[{ id: 'year', value: 'هذا العام', label: ADMIN_DASHBOARD_LABELS.YEAR_FILTER }]"
                :placeholder="ADMIN_DASHBOARD_LABELS.YEAR_FILTER"
              />
            </div>
            <div class="admin-dashboard__chart-wrapper">
              <svg
                v-if="monthlyData.length > 0"
                class="admin-dashboard__line-chart"
                viewBox="0 0 400 200"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="var(--color-primary)" stop-opacity="0.3" />
                    <stop offset="100%" stop-color="var(--color-primary)" stop-opacity="0" />
                  </linearGradient>
                </defs>
                <!-- Grid lines -->
                <g class="admin-dashboard__chart-grid">
                  <line v-for="(_, i) in 5" :key="i" x1="50" :y1="25 + i * 32.5" x2="380" :y2="25 + i * 32.5" stroke="#E5E7EB" stroke-dasharray="4" stroke-width="1" />
                </g>
                <!-- Area fill -->
                <path
                  v-if="chartPoints.area"
                  :d="chartPoints.area"
                  fill="url(#chartAreaGradient)"
                />
                <!-- Line -->
                <path
                  v-if="chartPoints.line"
                  :d="chartPoints.line"
                  fill="none"
                  stroke="var(--color-primary)"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <!-- Hover points & tooltip -->
                <g v-for="(pt, idx) in chartPoints.points" :key="pt.month">
                  <line
                    v-if="chartHoverIndex === idx"
                    :x1="pt.x"
                    :y1="pt.y"
                    :x2="pt.x"
                    y2="165"
                    class="admin-dashboard__chart-hover-line"
                    stroke="#9CA3AF"
                    stroke-dasharray="4"
                    stroke-width="1"
                  />
                  <circle
                    :cx="pt.x"
                    :cy="pt.y"
                    r="6"
                    fill="var(--color-primary)"
                    class="admin-dashboard__chart-point"
                    @mouseenter="chartHoverIndex = idx"
                    @mouseleave="chartHoverIndex = null"
                  />
                  <g v-if="chartHoverIndex === idx" class="admin-dashboard__chart-tooltip">
                    <rect :x="pt.x - 45" :y="pt.y - 38" width="90" height="32" rx="4" fill="var(--color-primary)" />
                    <text :x="pt.x" :y="pt.y - 18" text-anchor="middle" fill="#fff" font-size="11" font-weight="600">{{ pt.month }}</text>
                    <text :x="pt.x" :y="pt.y - 6" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">{{ pt.total }}</text>
                  </g>
                </g>
              </svg>
              <!-- X-axis labels -->
              <div v-if="monthlyData.length > 0" class="admin-dashboard__chart-x-labels">
                <span
                  v-for="m in monthlyData"
                  :key="m.month"
                  class="admin-dashboard__chart-x-label"
                >
                  {{ MONTH_SHORT[m.month] || m.month.slice(0, 3) }}
                </span>
              </div>
              <!-- Y-axis labels -->
              <div v-if="monthlyData.length > 0" class="admin-dashboard__chart-y-labels">
                <span
                  v-for="lbl in yAxisLabels"
                  :key="lbl"
                  class="admin-dashboard__chart-y-label"
                >
                  {{ lbl }}
                </span>
              </div>
              <div v-if="monthlyData.length === 0" class="admin-dashboard__chart-empty">
                لا توجد بيانات
              </div>
            </div>
          </div>

          <!-- Memorization Level -->
          <div class="admin-dashboard__panel">
            <div class="admin-dashboard__panel-header">
              <h3 class="admin-dashboard__panel-title">{{ ADMIN_DASHBOARD_LABELS.MEMORIZATION_LEVEL }}</h3>
            </div>
            <div class="admin-dashboard__hefaz">
              <div class="admin-dashboard__hefaz-chart">
                <div
                  class="admin-dashboard__hefaz-arc"
                  :style="{ background: hefazConicGradient }"
                />
                <div class="admin-dashboard__hefaz-center">
                  <span class="admin-dashboard__hefaz-label">{{ ADMIN_DASHBOARD_LABELS.STUDENTS }}</span>
                  <span class="admin-dashboard__hefaz-value">{{ totalStudentsForChart }}</span>
                </div>
              </div>
              <div class="admin-dashboard__hefaz-legend">
                <div
                  v-for="level in hefazLevelsWithPercent"
                  :key="level.key"
                  class="admin-dashboard__hefaz-legend-item"
                >
                  <span class="admin-dashboard__hefaz-legend-color" :style="{ backgroundColor: level.color }" />
                  <span class="admin-dashboard__hefaz-legend-text">{{ level.percent }}% {{ level.label }}</span>
                </div>
                <div v-if="hefazLevelsWithPercent.length === 0" class="admin-dashboard__hefaz-empty">
                  لا توجد بيانات
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Left column (RTL): Last Activity + Teachers Table - 4/12 width -->
        <div class="admin-dashboard__left">
          <!-- Last Activity (timeline design with day groups) -->
          <div class="admin-dashboard__panel admin-dashboard__panel--activity">
            <div class="admin-dashboard__panel-header">
              <h3 class="admin-dashboard__panel-title">{{ ADMIN_DASHBOARD_LABELS.LAST_ACTIVITY }}</h3>
              <button type="button" class="admin-dashboard__panel-menu" aria-label="قائمة">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="6" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="18" r="1.5"/></svg>
              </button>
            </div>
            <div class="admin-dashboard__activity-timeline">
              <template v-if="lastActivity.length > 0">
                <div
                  v-for="group in lastActivityByDay"
                  :key="group.day"
                  class="admin-dashboard__activity-day-group"
                >
                  <div class="admin-dashboard__activity-day-header">{{ group.day }}</div>
                  <div class="admin-dashboard__activity-day-list">
                    <div
                      v-for="entry in group.activities"
                      :key="entry.item.id"
                      class="admin-dashboard__activity-item"
                    >
                      <div class="admin-dashboard__activity-timeline-dot" :style="{ backgroundColor: AVATAR_LIGHT_COLORS[entry.idx % AVATAR_LIGHT_COLORS.length].bg }" />
                      <div
                        class="admin-dashboard__activity-avatar"
                        :style="getAvatarStyle(entry.idx)"
                      >
                        {{ getInitials(entry.item.full_name) }}
                      </div>
                      <div class="admin-dashboard__activity-content">
                        <div class="admin-dashboard__activity-desc">
                          <strong>{{ entry.item.full_name }}</strong> مسجل في {{ entry.item.program }}
                        </div>
                        <div class="admin-dashboard__activity-time">{{ entry.item.time }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              <div v-else class="admin-dashboard__activity-empty">
                لا يوجد نشاط حديث
              </div>
            </div>
          </div>

          <!-- Teachers Overview -->
          <div class="admin-dashboard__panel">
            <div class="admin-dashboard__panel-header">
              <h3 class="admin-dashboard__panel-title">{{ ADMIN_DASHBOARD_LABELS.TEACHERS_OVERVIEW }}</h3>
              <button type="button" class="admin-dashboard__panel-menu" aria-label="قائمة">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="6" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="18" r="1.5"/></svg>
              </button>
            </div>
            <BaseTable
              :columns="teacherColumns"
              :data="teachers"
              :loading="false"
              :page-size-options="[5, 10, 25]"
            >
              <template #cell-full_name="{ row }">
                {{ row.full_name }}
              </template>
              <template #cell-experience_years="{ row }">
                {{ row.experience_years || '---' }}
              </template>
              <template #cell-current_count="{ row }">
                {{ row.current_count }}
              </template>
              <template #cell-students_count="{ row }">
                {{ row.students_count }}
              </template>
              <template #cell-availability="{ row }">
                <span class="admin-dashboard__slots-pill">
                  {{ getTeacherAvailability(row) }} {{ ADMIN_DASHBOARD_LABELS.SLOTS }}
                </span>
              </template>
            </BaseTable>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.admin-dashboard {
  direction: rtl;
  width: 100%;
  max-width: 100%;

  @include sm-max {
    padding: 0 $spacing-2;
  }

  &__error {
    padding: $spacing-4;
    color: var(--color-error);
    text-align: center;
    margin-bottom: $spacing-4;
  }

  &__loading {
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__stats {
    width: 100%;
    margin-bottom: $spacing-6;
  }

  &__stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: $spacing-4;
    overflow-x: auto;
    padding-bottom: $spacing-2;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;

    &::-webkit-scrollbar {
      height: 6px;
    }

    &::-webkit-scrollbar-track {
      background: var(--color-background);
      border-radius: $radius-full;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--color-border);
      border-radius: $radius-full;

      &:hover {
        background: var(--color-text-muted);
      }
    }

    @include sm-max {
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: $spacing-3;
    }
  }

  &__stat-card-wrapper {
    position: relative;
  }

  &__stat-card {
    background-color: var(--color-background-card);
    border-radius: $radius-xl;
    padding: $spacing-3;
    box-shadow: $shadow-md;
    min-height: 140px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: visible;
  }

  &__stat-icon {
    width: 48px;
    height: 48px;
    border-radius: $radius-lg;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: $shadow-sm;
    position: absolute;
    top: $spacing-10;
    left: $spacing-4;
    z-index: 2;
    animation: adminFloatIcon 3s ease-in-out infinite;
    transition: transform $transition-fast;

    &:hover {
      transform: scale(1.1) rotate(5deg);
      animation-play-state: paused;
    }

    svg {
      width: 24px;
      height: 24px;
      object-fit: contain;
      animation: adminPulseIcon 2s ease-in-out infinite;
    }
  }

  &__stat-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: $spacing-2;
    margin-top: $spacing-7;
  }

  &__stat-value {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
  }

  &__stat-skeleton {
    color: var(--color-text-muted);
    animation: pulse 1.5s ease-in-out infinite;
  }

  &__stat-label {
    font-size: $font-size-sm;
    color: var(--color-text-secondary);
    font-weight: $font-weight-medium;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: $spacing-6;

    @include sm-max {
      gap: $spacing-4;
    }

    @include md {
      grid-template-columns: 1fr 340px;
    }
  }

  &__left {
    display: flex;
    flex-direction: column;
    gap: $spacing-6;
    min-width: 0;
  }

  &__right {
    display: flex;
    flex-direction: column;
    gap: $spacing-6;
    order: -1;
    min-width: 0;

    @include md {
      order: 0;
    }
  }

  &__right--chart {
    min-width: 0;
  }

  &__panel {
    background-color: var(--color-background-card);
    border-radius: $radius-xl;
    padding: $spacing-4;
    box-shadow: $shadow-md;
    overflow-x: auto;

    @include sm-max {
      padding: $spacing-3;
    }
  }

  &__panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-4;
  }

  &__panel-title {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
    margin: 0;
  }

  &__panel-menu {
    background: none;
    border: none;
    padding: $spacing-1;
    cursor: pointer;
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__activity-timeline {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: $spacing-4;
  }

  &__activity-day-group {
    display: flex;
    flex-direction: column;
    gap: $spacing-2;
  }

  &__activity-day-header {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: var(--color-text-muted);
  }

  &__activity-day-list {
    display: flex;
    flex-direction: column;
    gap: 0;
    position: relative;
    padding-right: $spacing-1;

    &::before {
      content: '';
      position: absolute;
      right: 8px;
      top: 20px;
      bottom: 20px;
      width: 2px;
      background-color: #E5E7EB;
      border-radius: 1px;
      z-index: 0;
    }
  }

  &__activity-item {
    display: flex;
    align-items: flex-start;
    gap: $spacing-3;
    padding: $spacing-2 0;
    position: relative;
    //direction: ltr;

    &:not(:last-child) {
      margin-bottom: 1.65rem;
    }

    @include sm-max {
      gap: $spacing-2;
      padding: $spacing-2 0;
    }
  }

  &__activity-timeline-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 12px;
    z-index: 1;
  }

  &__activity-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: $font-weight-bold;
    font-size: $font-size-sm;
    flex-shrink: 0;
  }

  &__activity-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: $spacing-1;
    min-width: 0;
    text-align: right;
    direction: rtl;
  }

  &__activity-desc {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: var(--color-text-primary);
    line-height: 1.4;
  }

  &__activity-time {
    font-size: $font-size-xs;
    color: var(--color-text-muted);
  }

  &__activity-empty {
    padding: $spacing-6;
    text-align: center;
    color: var(--color-text-muted);
  }

  &__slots-pill {
    display: inline-block;
    padding: $spacing-1 $spacing-3;
    border-radius: $radius-full;
    background-color: var(--color-stat-green);
    color: #10B981;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
  }

  &__chart-panel {
    overflow: visible;
    min-height: 340px;
    display: flex;
    flex-direction: column;

    @include sm-max {
      min-height: 280px;
    }
  }

  &__panel--activity {
    min-height: 340px;

    @include sm-max {
      min-height: 280px;
    }
    display: flex;
    flex-direction: column;

    .admin-dashboard__activity-timeline {
      flex: 1;
      min-height: 0;
    }
  }

  &__chart-header {
    flex-wrap: wrap;
  }

  &__chart-wrapper {
    position: relative;
    flex: 1;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    width: 100%;

    @include sm-max {
      min-height: 160px;
    }
  }

  &__line-chart {
    width: 100%;
    flex: 1;
    min-height: 160px;

    @include sm-max {
      min-height: 140px;
    }
    display: block;
    cursor: default;
  }

  &__chart-grid {
    pointer-events: none;
  }

  &__chart-point {
    cursor: pointer;
    transition: r 0.15s ease;

    &:hover {
      r: 8;
    }
  }

  &__chart-hover-line {
    pointer-events: none;
  }

  &__chart-tooltip {
    pointer-events: none;
  }

  &__chart-x-labels {
    display: flex;
    justify-content: space-between;
    margin-top: $spacing-2;
    padding: 0 50px 0 10px;
    font-size: 11px;
    color: var(--color-text-muted);

    @include sm-max {
      padding: 0 40px 0 8px;
      font-size: 10px;
    }
  }

  &__chart-x-label {
    flex: 1;
    text-align: center;
    min-width: 0;
  }

  &__chart-y-labels {
    position: absolute;
    top: 25px;
    left: 0;
    bottom: 35px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    font-size: 11px;
    color: var(--color-text-muted);
    padding: 0 $spacing-2 0 0;
    width: 40px;
  }

  &__chart-y-label {
    text-align: right;
  }

  &__chart-empty,
  &__hefaz-empty {
    padding: $spacing-6;
    text-align: center;
    color: var(--color-text-muted);
  }

  &__hefaz {
    display: flex;
    align-items: center;
    gap: $spacing-6;
    flex-wrap: wrap;

    @include sm-max {
      flex-direction: column;
      gap: $spacing-4;
    }
  }

  &__hefaz-chart {
    position: relative;
    width: 140px;
    height: 140px;
    flex-shrink: 0;
  }

  &__hefaz-arc {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }

  &__hefaz-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background: var(--color-background-card);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 0 4px #fff;
  }

  &__hefaz-label {
    font-size: $font-size-xs;
    color: var(--color-text-secondary);
  }

  &__hefaz-value {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
  }

  &__hefaz-legend {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: $spacing-2;
  }

  &__hefaz-legend-item {
    display: flex;
    align-items: center;
    gap: $spacing-2;
  }

  &__hefaz-legend-color {
    width: 12px;
    height: 12px;
    border-radius: $radius-sm;
    flex-shrink: 0;
  }

  &__hefaz-legend-text {
    font-size: $font-size-sm;
    color: var(--color-text-primary);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes adminFloatIcon {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes adminPulseIcon {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.9; }
}
</style>
