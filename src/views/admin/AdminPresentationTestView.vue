<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { BaseTable, AppLoading, StudentProfileDrawer, DataTableFilterBar, KpiStatCard } from '@/components/common'
import { ActionMenu } from '@/components/ui'
import type { ApiResponse } from '@/services/api'
import type { Student } from '@/services/teacher.service'
import {
  getAdminStudent,
  getAdminPresentationTests,
  type AdminPresentationTest,
  type AdminPresentationTestsData,
} from '@/services/admin.service'
import { ADMIN_PRESENTATION_TEST_PAGE } from '@/config/admin.constants'

const loading = ref(true)
const error = ref<string | null>(null)
const data = ref<AdminPresentationTestsData | null>(null)

const programFilter = ref<'all' | number>('all')
const searchQuery = ref('')
const dateFilter = ref('')

const showProfileDrawer = ref(false)
const selectedStudentId = ref<number | null>(null)

async function fetchPresentationTests() {
  loading.value = true
  error.value = null
  try {
    const programId = programFilter.value === 'all' ? undefined : (programFilter.value as number)
    const response = await getAdminPresentationTests(programId)
    if (response.success && response.data) {
      data.value = response.data
    } else {
      data.value = null
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'حدث خطأ في تحميل العرض والاختبار'
    data.value = null
  } finally {
    loading.value = false
  }
}

const presentation40Count = computed(() => {
  const list = data.value?.data ?? []
  return list.filter((r) => parseFloat(r.score_presentation || '0') >= 40).length
})

const statCards = computed(() => {
  const c = data.value?.counts
  return [
    {
      key: 'golden',
      icon: 'golden' as const,
      value: c?.three_years_golden_count ?? 0,
      label: ADMIN_PRESENTATION_TEST_PAGE.STATS.GOLDEN.LABEL,
      tag: ADMIN_PRESENTATION_TEST_PAGE.STATS.GOLDEN.TAG,
      tagColor: ADMIN_PRESENTATION_TEST_PAGE.STATS.GOLDEN.TAG_COLOR,
      iconBg: 'rgba(255, 243, 224, 1)',
    },
    {
      key: 'silver',
      icon: 'silver' as const,
      value: c?.one_years_silver_count ?? 0,
      label: ADMIN_PRESENTATION_TEST_PAGE.STATS.SILVER.LABEL,
      tag: ADMIN_PRESENTATION_TEST_PAGE.STATS.SILVER.TAG,
      tagColor: ADMIN_PRESENTATION_TEST_PAGE.STATS.SILVER.TAG_COLOR,
      iconBg: 'rgba(227, 242, 253, 1)',
    },
    {
      key: 'presentation40',
      icon: 'active' as const,
      value: 0,
      label: ADMIN_PRESENTATION_TEST_PAGE.STATS.PRESENTATION_40.LABEL,
      tag: ADMIN_PRESENTATION_TEST_PAGE.STATS.PRESENTATION_40.TAG,
      tagColor: ADMIN_PRESENTATION_TEST_PAGE.STATS.PRESENTATION_40.TAG_COLOR,
      iconBg: 'rgba(227, 242, 253, 1)',
    },
    {
      key: 'six_months',
      icon: 'hefaza' as const,
      value: c?.six_months_huffaz_count ?? 0,
      label: ADMIN_PRESENTATION_TEST_PAGE.STATS.SIX_MONTHS.LABEL,
      tag: ADMIN_PRESENTATION_TEST_PAGE.STATS.SIX_MONTHS.TAG,
      tagColor: ADMIN_PRESENTATION_TEST_PAGE.STATS.SIX_MONTHS.TAG_COLOR,
      iconBg: 'rgba(232, 245, 233, 1)',
    },
    {
      key: 'two_years',
      icon: 'hefaza' as const,
      value: c?.two_years_itqan_count ?? 0,
      label: ADMIN_PRESENTATION_TEST_PAGE.STATS.TWO_YEARS.LABEL,
      tag: ADMIN_PRESENTATION_TEST_PAGE.STATS.TWO_YEARS.TAG,
      tagColor: ADMIN_PRESENTATION_TEST_PAGE.STATS.TWO_YEARS.TAG_COLOR,
      iconBg: 'rgba(232, 245, 233, 1)',
    },
  ]
})

const presentationTests = computed(() => data.value?.data ?? [])

const filteredPresentationTests = computed(() => {
  let list = presentationTests.value
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter((r) => r.full_name?.toLowerCase().includes(q))
  }
  if (dateFilter.value) {
    list = list.filter((r) => r.created_at?.startsWith(dateFilter.value))
  }
  return list
})

function openStudentProfile(row: AdminPresentationTest) {
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

function getActionItems(row: AdminPresentationTest) {
  return [
    { id: 'view', label: ADMIN_PRESENTATION_TEST_PAGE.ACTIONS.VIEW, icon: 'eye' as const, onClick: () => openStudentProfile(row) },
    { id: 'email', label: ADMIN_PRESENTATION_TEST_PAGE.ACTIONS.EMAIL, icon: 'email' as const, onClick: () => {} },
    { id: 'whatsapp', label: ADMIN_PRESENTATION_TEST_PAGE.ACTIONS.WHATSAPP, icon: 'whatsapp' as const, onClick: () => {} },
  ]
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '---'
  const d = new Date(dateStr)
  return d.toLocaleDateString('ar-EG', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
}

function getTrackTagStyle(track: string): { backgroundColor: string; color: string } {
  if (track?.includes('ذهبي') || track?.includes('الذهبي')) {
    return { backgroundColor: 'rgba(255, 243, 224, 1)', color: '#E65100' }
  }
  if (track?.includes('فضي') || track?.includes('الفضي') || track?.includes('الفضة')) {
    return { backgroundColor: 'rgba(227, 242, 253, 1)', color: '#1565C0' }
  }
  return { backgroundColor: 'rgba(244, 244, 244, 1)', color: 'var(--color-text-primary)' }
}

const programTabs = [
  { id: 'all', label: ADMIN_PRESENTATION_TEST_PAGE.FILTERS.ALL, value: 'all' as const },
  { id: 'hefaza', label: ADMIN_PRESENTATION_TEST_PAGE.FILTERS.HEFAZA, value: 1 },
  { id: 'fursan', label: ADMIN_PRESENTATION_TEST_PAGE.FILTERS.FURSAN, value: 2 },
]

const tableColumns = [
  { key: 'student', label: ADMIN_PRESENTATION_TEST_PAGE.TABLE.STUDENT, width: '16%' },
  { key: 'program', label: ADMIN_PRESENTATION_TEST_PAGE.TABLE.PROGRAM, width: '10%' },
  { key: 'program_track', label: ADMIN_PRESENTATION_TEST_PAGE.TABLE.TRACK, width: '18%' },
  { key: 'level', label: ADMIN_PRESENTATION_TEST_PAGE.TABLE.LEVEL, width: '14%' },
  { key: 'score_presentation', label: ADMIN_PRESENTATION_TEST_PAGE.TABLE.SCORE_PRESENTATION, width: '10%' },
  { key: 'score_tests', label: ADMIN_PRESENTATION_TEST_PAGE.TABLE.SCORE_TESTS, width: '10%' },
  { key: 'date', label: ADMIN_PRESENTATION_TEST_PAGE.TABLE.DATE, width: '10%' },
  { key: 'actions', label: ADMIN_PRESENTATION_TEST_PAGE.TABLE.ACTIONS, width: '5%' },
]

watch(programFilter, () => fetchPresentationTests())
onMounted(() => fetchPresentationTests())
</script>

<template>
  <div class="admin-presentation-test" data-component="AdminPresentationTestView">
    <div class="admin-presentation-test__header">
      <h1 class="admin-presentation-test__title">{{ ADMIN_PRESENTATION_TEST_PAGE.PAGE_TITLE }}</h1>
    </div>

    <div v-if="error" class="admin-presentation-test__error">{{ error }}</div>

    <div v-if="loading && !data" class="admin-presentation-test__loading">
      <AppLoading :full-screen="false" text="جاري تحميل العرض والاختبار..." />
    </div>

    <template v-else>
      <!-- KPI Cards -->
      <section class="admin-presentation-test__stats">
        <div class="admin-presentation-test__stats-grid">
          <div v-for="card in statCards" :key="card.key" class="admin-presentation-test__stat-card-wrapper">
            <KpiStatCard
              :value="card.key === 'presentation40' ? presentation40Count : card.value"
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
        :search-placeholder="ADMIN_PRESENTATION_TEST_PAGE.FILTERS.SEARCH_PLACEHOLDER"
        :search-model-value="searchQuery"
        @update:search-model-value="searchQuery = $event"
        :show-status-filter="false"
        :show-student-filter="false"
        :show-date="true"
        :date-model-value="dateFilter"
        @update:date-model-value="dateFilter = $event"
        :export-label="ADMIN_PRESENTATION_TEST_PAGE.FILTERS.EXPORT"
        class="admin-presentation-test__filter-bar"
      />

      <!-- Table -->
      <div class="admin-presentation-test__table-section">
        <h2 class="admin-presentation-test__section-title">{{ ADMIN_PRESENTATION_TEST_PAGE.SECTION_TITLE }}</h2>
        <BaseTable
          :columns="tableColumns"
          :data="filteredPresentationTests"
          :loading="loading"
          :page-size-options="[5, 10, 25]"
          empty-message="لا توجد سجلات عرض واختبار"
        >
          <template #cell-student="{ row }">
            <div class="admin-presentation-test__cell-student">
              <span class="admin-presentation-test__cell-name">{{ row.full_name }}</span>
            </div>
          </template>
          <template #cell-program="{ row }">
            <span v-if="row.program" class="admin-presentation-test__badge admin-presentation-test__badge--program">
              {{ row.program }}
            </span>
            <span v-else>---</span>
          </template>
          <template #cell-program_track="{ row }">
            <span
              v-if="row.program_track"
              class="admin-presentation-test__badge admin-presentation-test__badge--track"
              :style="getTrackTagStyle(row.program_track)"
            >
              {{ row.program_track }}
            </span>
            <span v-else>---</span>
          </template>
          <template #cell-level="{ row }">
            {{ row.level || '---' }}
          </template>
          <template #cell-score_presentation="{ row }">
            {{ row.score_presentation ?? '---' }}
          </template>
          <template #cell-score_tests="{ row }">
            {{ row.score_tests ?? '---' }}
          </template>
          <template #cell-date="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
          <template #cell-actions="{ row }">
            <div class="admin-presentation-test__actions-cell" @click.stop>
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
.admin-presentation-test {
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

    &--track {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__actions-cell {
    display: flex;
    justify-content: center;
  }
}
</style>
