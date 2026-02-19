<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { BaseTable, AppLoading, StudentProfileDrawer, DataTableFilterBar, KpiStatCard } from '@/components/common'
import { ActionMenu } from '@/components/ui'
import type { ApiResponse } from '@/services/api'
import type { Student } from '@/services/teacher.service'
import { getAdminStudent, getAdminAttendances, type AdminAttendance, type AdminAttendancesData } from '@/services/admin.service'
import { ADMIN_WEEKLY_REPORT_PAGE } from '@/config/admin.constants'

const loading = ref(true)
const error = ref<string | null>(null)
const data = ref<AdminAttendancesData | null>(null)

const programFilter = ref<'all' | number>('all')
const searchQuery = ref('')
const statusFilter = ref('')
const studentFilter = ref('')
const dateFilter = ref('')

const showProfileDrawer = ref(false)
const selectedStudentId = ref<number | null>(null)

async function fetchAttendances() {
  loading.value = true
  error.value = null
  try {
    const programId = programFilter.value === 'all' ? undefined : (programFilter.value as number)
    const response = await getAdminAttendances(programId)
    if (response.success && response.data) {
      data.value = response.data
    } else {
      data.value = null
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'حدث خطأ في تحميل الحضور'
    data.value = null
  } finally {
    loading.value = false
  }
}

const statCards = computed(() => {
  const c = data.value?.counts
  return [
    {
      key: 'present',
      icon: 'present' as const,
      value: c?.present_count ?? 0,
      label: ADMIN_WEEKLY_REPORT_PAGE.STATS.PRESENT.LABEL,
      tag: ADMIN_WEEKLY_REPORT_PAGE.STATS.PRESENT.TAG,
      tagColor: ADMIN_WEEKLY_REPORT_PAGE.STATS.PRESENT.TAG_COLOR,
      iconBg: 'rgba(232, 245, 233, 1)',
    },
    {
      key: 'absent',
      icon: 'absent' as const,
      value: c?.absent_count ?? 0,
      label: ADMIN_WEEKLY_REPORT_PAGE.STATS.ABSENT.LABEL,
      tag: ADMIN_WEEKLY_REPORT_PAGE.STATS.ABSENT.TAG,
      tagColor: ADMIN_WEEKLY_REPORT_PAGE.STATS.ABSENT.TAG_COLOR,
      iconBg: 'rgba(255, 235, 238, 1)',
    },
    {
      key: 'delayed',
      icon: 'delayed' as const,
      value: c?.delayed_count ?? 0,
      label: ADMIN_WEEKLY_REPORT_PAGE.STATS.DELAYED.LABEL,
      tag: ADMIN_WEEKLY_REPORT_PAGE.STATS.DELAYED.TAG,
      tagColor: ADMIN_WEEKLY_REPORT_PAGE.STATS.DELAYED.TAG_COLOR,
      iconBg: 'rgba(255, 243, 224, 1)',
    },
    {
      key: 'permission',
      icon: 'permission' as const,
      value: c?.permission_count ?? 0,
      label: ADMIN_WEEKLY_REPORT_PAGE.STATS.PERMISSION.LABEL,
      tag: ADMIN_WEEKLY_REPORT_PAGE.STATS.PERMISSION.TAG,
      tagColor: ADMIN_WEEKLY_REPORT_PAGE.STATS.PERMISSION.TAG_COLOR,
      iconBg: 'rgba(227, 242, 253, 1)',
    },
  ]
})

const attendances = computed(() => data.value?.data ?? [])

const filteredAttendances = computed(() => {
  let list = attendances.value
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter((a) => a.full_name?.toLowerCase().includes(q))
  }
  if (statusFilter.value) {
    list = list.filter((a) => a.status === statusFilter.value)
  }
  if (studentFilter.value) {
    list = list.filter((a) => a.full_name === studentFilter.value)
  }
  if (dateFilter.value) {
    list = list.filter((a) => a.date === dateFilter.value)
  }
  return list
})

const uniqueStudents = computed(() => {
  const seen = new Set<string>()
  return attendances.value
    .filter((a) => {
      if (seen.has(a.full_name)) return false
      seen.add(a.full_name)
      return true
    })
    .map((a) => ({ id: a.full_name, name: a.full_name }))
})

const uniqueStatuses = computed(() => {
  const seen = new Set<string>()
  return attendances.value
    .filter((a) => {
      if (!a.status || seen.has(a.status)) return false
      seen.add(a.status)
      return true
    })
    .map((a) => a.status)
})

const statusOptionsForFilter = computed(() =>
  uniqueStatuses.value.map((s) => ({ value: s, label: s }))
)

const studentOptionsForFilter = computed(() =>
  uniqueStudents.value.map((u) => ({ value: u.id, label: u.name }))
)

function openStudentProfile(row: AdminAttendance) {
  const studentId = row.student_id ?? row.id
  selectedStudentId.value = studentId
  showProfileDrawer.value = true
}

async function getStudentForDrawer(id: number): Promise<ApiResponse<Student>> {
  const res = await getAdminStudent(id)
  if (!res.success || !res.data) {
    return { success: false, message: res.message ?? 'فشل تحميل بيانات الطالب' }
  }
  const d = res.data
  const status = !d.teacher ? 'غير معين' : (d.level || 'معلق')
  const student: Student = {
    id: d.id,
    full_name: d.full_name,
    email: d.email,
    country: d.country,
    gender: d.gender,
    age: d.age ?? '',
    education_level: d.education_level,
    how_did_you_know_us: d.how_did_you_know_us,
    phone_number: d.phone_number ?? '',
    residence: d.residence,
    quran_memorization_level: d.quran_memorization_level,
    has_ijaza_id: d.has_ijaza,
    watched_intro_video: d.watched_intro_video,
    interview_time_preference: d.interview_time_preference,
    interview_date: d.interview_date,
    score: d.score,
    level: d.level ?? '',
    program: d.program,
    program_track: d.program_track,
    teacher: d.teacher ?? '',
    created_at: d.created_at,
    status,
  }
  return { ...res, data: student }
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  حاضر: { bg: 'rgba(232, 245, 233, 1)', text: '#2E7D32' },
  غائب: { bg: 'rgba(255, 235, 238, 1)', text: '#C62828' },
  مؤجل: { bg: 'rgba(255, 243, 224, 1)', text: '#E65100' },
  مستأذن: { bg: 'rgba(227, 242, 253, 1)', text: '#1565C0' },
  انتظار: { bg: 'rgba(245, 245, 245, 1)', text: '#616161' },
  موافق: { bg: 'rgba(232, 245, 233, 1)', text: '#2E7D32' },
}

function getStatusStyle(status: string): { backgroundColor: string; color: string } {
  const colors = STATUS_COLORS[status] || { bg: 'rgba(245, 245, 245, 1)', text: '#616161' }
  return { backgroundColor: colors.bg, color: colors.text }
}

function getActionItems(row: AdminAttendance) {
  return [
    { id: 'view', label: ADMIN_WEEKLY_REPORT_PAGE.ACTIONS.VIEW, icon: 'eye' as const, onClick: () => openStudentProfile(row) },
    { id: 'email', label: ADMIN_WEEKLY_REPORT_PAGE.ACTIONS.EMAIL, icon: 'email' as const, onClick: () => {} },
    { id: 'whatsapp', label: ADMIN_WEEKLY_REPORT_PAGE.ACTIONS.WHATSAPP, icon: 'whatsapp' as const, onClick: () => {} },
  ]
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '---'
  const d = new Date(dateStr)
  return d.toLocaleDateString('ar-EG', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
}

const programTabs = [
  { id: 'all', label: ADMIN_WEEKLY_REPORT_PAGE.FILTERS.ALL, value: 'all' as const },
  { id: 'hefaza', label: ADMIN_WEEKLY_REPORT_PAGE.FILTERS.HEFAZA, value: 1 },
  { id: 'fursan', label: ADMIN_WEEKLY_REPORT_PAGE.FILTERS.FURSAN, value: 2 },
]

const attendanceColumns = [
  { key: 'student', label: ADMIN_WEEKLY_REPORT_PAGE.TABLE.STUDENT, width: '18%' },
  { key: 'program', label: ADMIN_WEEKLY_REPORT_PAGE.TABLE.PROGRAM, width: '10%' },
  { key: 'session', label: ADMIN_WEEKLY_REPORT_PAGE.TABLE.SESSION, width: '14%' },
  { key: 'status', label: ADMIN_WEEKLY_REPORT_PAGE.TABLE.STATUS, width: '10%' },
  { key: 'page_number', label: ADMIN_WEEKLY_REPORT_PAGE.TABLE.LAST_PAGE, width: '10%' },
  { key: 'score', label: ADMIN_WEEKLY_REPORT_PAGE.TABLE.EVALUATION, width: '8%' },
  { key: 'date', label: ADMIN_WEEKLY_REPORT_PAGE.TABLE.DATE, width: '12%' },
  { key: 'actions', label: ADMIN_WEEKLY_REPORT_PAGE.TABLE.ACTIONS, width: '5%' },
]

watch(programFilter, () => fetchAttendances())
onMounted(() => fetchAttendances())
</script>

<template>
  <div class="admin-weekly-report" data-component="AdminWeeklyReportView">
 

    <div v-if="error" class="admin-weekly-report__error">{{ error }}</div>

    <div v-if="loading && !data" class="admin-weekly-report__loading">
      <AppLoading :full-screen="false" text="جاري تحميل التقرير..." />
    </div>

    <template v-else>
      <!-- KPI Cards -->
      <section class="admin-weekly-report__stats">
        <div class="admin-weekly-report__stats-grid">
          <div v-for="card in statCards" :key="card.key" class="admin-weekly-report__stat-card-wrapper">
            <KpiStatCard
              :value="card.value"
              :label="card.label"
              :tag="card.tag"
              :icon="card.icon"
              :icon-bg="card.iconBg"
              :tag-color="card.tagColor"
              :loading="loading"
            />
          </div>
        </div>
      </section>

      <!-- Filters Bar -->
      <DataTableFilterBar
        :program-tabs="programTabs"
        :program-model-value="programFilter"
        @update:program-model-value="programFilter = ($event ?? 'all') as 'all' | number"
        :search-placeholder="ADMIN_WEEKLY_REPORT_PAGE.FILTERS.SEARCH_PLACEHOLDER"
        :search-model-value="searchQuery"
        @update:search-model-value="searchQuery = $event"
        :status-options="statusOptionsForFilter"
        :status-all-label="ADMIN_WEEKLY_REPORT_PAGE.FILTERS.ALL_STATUSES"
        :status-model-value="statusFilter"
        @update:status-model-value="statusFilter = $event"
        :student-options="studentOptionsForFilter"
        :student-placeholder="ADMIN_WEEKLY_REPORT_PAGE.FILTERS.SELECT_STUDENT"
        :student-model-value="studentFilter"
        @update:student-model-value="studentFilter = $event"
        :show-date="true"
        :date-model-value="dateFilter"
        @update:date-model-value="dateFilter = $event"
        :export-label="ADMIN_WEEKLY_REPORT_PAGE.FILTERS.EXPORT"
        class="admin-weekly-report__filter-bar"
      />

      <!-- Table -->
      <div class="admin-weekly-report__table-section">
        <h2 class="admin-weekly-report__section-title">{{ ADMIN_WEEKLY_REPORT_PAGE.SECTION_TITLE }}</h2>
        <BaseTable
          :columns="attendanceColumns"
          :data="filteredAttendances"
          :loading="loading"
          :page-size-options="[5, 10, 25]"
          empty-message="لا توجد سجلات حضور"
        >
          <template #cell-student="{ row }">
            <div class="admin-weekly-report__cell-student">
              <span class="admin-weekly-report__cell-name">{{ row.full_name }}</span>
            </div>
          </template>
          <template #cell-program="{ row }">
            <span v-if="row.program" class="admin-weekly-report__badge admin-weekly-report__badge--program">
              {{ row.program }}
            </span>
            <span v-else>---</span>
          </template>
          <template #cell-session="{ row }">
            {{ row.session || '---' }}
          </template>
          <template #cell-status="{ row }">
            <span
              class="admin-weekly-report__badge admin-weekly-report__badge--status"
              :style="getStatusStyle(row.status)"
            >
              {{ row.status || '---' }}
            </span>
          </template>
          <template #cell-page_number="{ row }">
            {{ row.page_number ?? '---' }}
          </template>
          <template #cell-score="{ row }">
            <span class="admin-weekly-report__rating">
              {{ row.score ?? 0 }}
              <svg class="admin-weekly-report__star" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </span>
          </template>
          <template #cell-date="{ row }">
            {{ formatDate(row.date) }}
          </template>
          <template #cell-actions="{ row }">
            <div class="admin-weekly-report__actions-cell" @click.stop>
              <ActionMenu :items="getActionItems(row)" />
            </div>
          </template>
        </BaseTable>
      </div>

      <StudentProfileDrawer
        v-model="showProfileDrawer"
        :student-id="selectedStudentId"
        :get-student="getStudentForDrawer"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.admin-weekly-report {
  direction: rtl;
  width: 100%;
  max-width: 100%;

  &__header {
    margin-bottom: $spacing-4;
  }

  &__title {
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
    margin: 0;
    text-align: right;
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
    }

    @include sm-max {
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: $spacing-3;
    }
  }

  &__stat-card-wrapper {
    position: relative;
  }

  &__filter-bar {
    margin-bottom: $spacing-6;
  }

  &__table-section {
    background-color: var(--color-background-card);
    border-radius: $radius-xl;
    padding: $spacing-4;
    box-shadow: $shadow-md;
  }

  &__section-title {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
    margin: 0 0 $spacing-4 0;
    text-align: right;
  }

  &__cell-student {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__cell-name {
    font-weight: $font-weight-medium;
  }

  &__badge {
    display: inline-block;
    padding: $spacing-1 $spacing-3;
    border-radius: $radius-full;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;

    &--program {
      background-color: rgba(244, 244, 244, 1);
      color: var(--color-text-primary);
    }

    &--status {
      min-width: 4rem;
    }
  }

  &__rating {
    display: inline-flex;
    align-items: center;
    gap: $spacing-1;
    font-weight: $font-weight-medium;
    color: var(--color-text-primary);
  }

  &__star {
    color: #F59E0B;
    flex-shrink: 0;
  }

  &__actions-cell {
    display: flex;
    justify-content: center;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
