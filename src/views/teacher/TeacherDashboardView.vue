<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { DataTable, PageToolbar, StudentProfileDrawer } from '@/components/common'
import { BaseButton, BaseTabs, BaseDropdown, ActionMenu } from '@/components/ui'
import { getStudents, type Student } from '@/services/teacher.service'
import {
  STUDENT_MANAGEMENT_LABELS,
  STUDENT_STATUS_COLORS,
  ProgramId,
} from '@/config/teacher.constants'

const students = ref<Student[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const programFilter = ref<number | null>(null)
const searchQuery = ref('')
const statusFilter = ref<string | null>(null)
const studentFilter = ref<number | null>(null)
const showProfileDrawer = ref(false)
const selectedStudentId = ref<number | null>(null)

const programTabs = [
  { id: 'all', label: STUDENT_MANAGEMENT_LABELS.PROGRAM_FILTER_ALL, value: null },
  { id: '1', label: STUDENT_MANAGEMENT_LABELS.PROGRAM_FILTER_HAFIZ, value: ProgramId.HAFIZA },
  { id: '2', label: STUDENT_MANAGEMENT_LABELS.PROGRAM_FILTER_FURSAN, value: ProgramId.FURSAN },
]

const statusOptions = [
  { id: 'all', value: null, label: STUDENT_MANAGEMENT_LABELS.STATUS_ALL },
  { id: 'complete', value: 'مكتمل', label: 'مكتمل' },
  { id: 'test', value: 'عرض واختبار', label: 'عرض واختبار' },
  { id: 'withdrawn', value: 'انسحب', label: 'انسحب' },
  { id: 'pending', value: 'معلق', label: 'معلق' },
  { id: 'unassigned', value: 'غير معين', label: 'غير معين' },
]

const columns = [
  { key: 'student', label: STUDENT_MANAGEMENT_LABELS.TABLE.STUDENT, width: '20%' },
  { key: 'program', label: STUDENT_MANAGEMENT_LABELS.TABLE.PROGRAM, width: '12%' },
  { key: 'program_track', label: STUDENT_MANAGEMENT_LABELS.TABLE.TRACK, width: '22%' },
  { key: 'status', label: STUDENT_MANAGEMENT_LABELS.TABLE.STATUS, width: '12%' },
  { key: 'score', label: STUDENT_MANAGEMENT_LABELS.TABLE.RATING, width: '10%' },
  { key: 'actions', label: STUDENT_MANAGEMENT_LABELS.TABLE.ACTIONS, width: '8%', align: 'center' as const },
]

const tableData = computed(() => {
  let result = [...students.value]

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    result = result.filter(
      (s) =>
        s.full_name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q)
    )
  }

  if (statusFilter.value != null && statusFilter.value !== '') {
    result = result.filter((s) => (s.status || 'غير معين') === statusFilter.value)
  }

  if (studentFilter.value != null) {
    result = result.filter((s) => s.id === studentFilter.value)
  }

  return result
})

const studentOptions = computed(() => [
  { id: 'all', value: null, label: STUDENT_MANAGEMENT_LABELS.STUDENT_SELECT_PLACEHOLDER },
  ...students.value.map((s) => ({
    id: String(s.id),
    value: s.id,
    label: s.full_name,
  })),
])

async function fetchStudents() {
  loading.value = true
  error.value = null
  try {
    const response = await getStudents(programFilter.value ?? undefined)
    if (response.success && response.data) {
      students.value = response.data.map((s) => ({
        ...s,
        status: s.status || 'غير معين',
      }))
    } else {
      students.value = []
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'حدث خطأ في تحميل الطلاب'
    students.value = []
  } finally {
    loading.value = false
  }
}

function getStatusStyle(status: string): { backgroundColor: string; color: string } {
  const colors = STUDENT_STATUS_COLORS[status] || STUDENT_STATUS_COLORS['غير معين']
  return { backgroundColor: colors.bg, color: colors.text }
}

function handleExport() {
  // TODO: Implement export
  console.log('Export clicked')
}

function openStudentProfile(student: Student) {
  selectedStudentId.value = student.id
  showProfileDrawer.value = true
}

function getActionItems(student: Student) {
  return [
    {
      id: 'view',
      label: STUDENT_MANAGEMENT_LABELS.ACTIONS.VIEW_STUDENT,
      icon: 'eye' as const,
      onClick: () => openStudentProfile(student),
    },
    {
      id: 'email',
      label: STUDENT_MANAGEMENT_LABELS.ACTIONS.SEND_EMAIL,
      icon: 'email' as const,
      onClick: () => window.open(`mailto:${student.email}`),
    },
    {
      id: 'whatsapp',
      label: STUDENT_MANAGEMENT_LABELS.ACTIONS.SEND_WHATSAPP,
      icon: 'whatsapp' as const,
      onClick: () => {
        const phone = student.phone_number?.replace(/\D/g, '') || ''
        window.open(`https://wa.me/${phone}`, '_blank')
      },
    },
  ]
}

watch([programFilter], () => {
  fetchStudents()
})

onMounted(() => {
  fetchStudents()
})
</script>

<template>
  <div class="teacher-dashboard" data-component="TeacherDashboardView">
   

    <PageToolbar>
      <template #tabs>
        <BaseTabs v-model="programFilter" :tabs="programTabs" />
      </template>
      <template #filters>
        <BaseDropdown
          v-model="statusFilter"
          :options="statusOptions"
          :placeholder="STUDENT_MANAGEMENT_LABELS.STATUS_ALL"
        />
        <BaseDropdown
          v-model="studentFilter"
          :options="studentOptions"
          :placeholder="STUDENT_MANAGEMENT_LABELS.STUDENT_SELECT_PLACEHOLDER"
        />
      </template>
      <template #search>
        <div class="teacher-dashboard__search-wrapper">
          <svg class="teacher-dashboard__search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            class="teacher-dashboard__search-input"
            :placeholder="STUDENT_MANAGEMENT_LABELS.SEARCH_PLACEHOLDER"
          />
        </div>
      </template>
      <template #actions>
        <BaseButton
          variant="primary"
          size="sm"
          class="teacher-dashboard__export-btn"
          @click="handleExport"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {{ STUDENT_MANAGEMENT_LABELS.EXPORT }}
        </BaseButton>
      </template>
    </PageToolbar>

    <div v-if="error" class="teacher-dashboard__error">{{ error }}</div>

    <div class="teacher-dashboard__section">
      <h2 class="teacher-dashboard__section-title">{{ STUDENT_MANAGEMENT_LABELS.SECTION_TITLE }}</h2>

      <DataTable
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :page-size-options="[10, 25, 50]"
      >
        <template #cell-student="{ row }">
          <div class="teacher-dashboard__student-cell">
            <span class="teacher-dashboard__student-name">{{ row.full_name }}</span>
            <span class="teacher-dashboard__student-level">{{ row.level }}</span>
          </div>
        </template>

        <template #cell-program="{ row }">
          <span class="teacher-dashboard__badge teacher-dashboard__badge--program">
            {{ row.program }}
          </span>
        </template>

        <template #cell-program_track="{ row }">
          {{ row.program_track || '---' }}
        </template>

        <template #cell-status="{ row }">
          <span
            class="teacher-dashboard__badge teacher-dashboard__badge--status"
            :style="getStatusStyle(row.status || 'غير معين')"
          >
            {{ row.status || 'غير معين' }}
          </span>
        </template>

        <template #cell-score="{ row }">
          <span class="teacher-dashboard__rating">
            {{ row.score ?? 0 }}
            <svg class="teacher-dashboard__star" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </span>
        </template>

        <template #cell-actions="{ row }">
          <div class="teacher-dashboard__actions" @click.stop>
            <ActionMenu :items="getActionItems(row)" />
          </div>
        </template>
      </DataTable>
    </div>

    <StudentProfileDrawer
      v-model="showProfileDrawer"
      :student-id="selectedStudentId"
    />
  </div>
</template>

<style lang="scss" scoped>
.teacher-dashboard {
  direction: rtl;
  width: 100%;
  max-width: 100%;
  

  @include sm-max {
    padding: 0 $spacing-2;
  }

  &__header {
    margin-bottom: $spacing-4;
  }

  &__title {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
    margin: 0;
    text-align: right;
  }

  &__export-btn {
    display: flex;
    align-items: center;
    gap: $spacing-2;
  }

  &__search-wrapper {
    flex: 1;
    min-width: 200px;
    position: relative;
    display: flex;
    align-items: center;

    @include sm-max {
      min-width: 0;
      width: 100%;
    }
  }

  &__search-icon {
    position: absolute;
    right: $spacing-3;
    color: var(--color-text-muted);
    pointer-events: none;
  }

  &__search-input {
    width: 100%;
    height: 40px;
    padding: 0 $spacing-10 0 $spacing-10;
    border: 1px solid var(--color-border);
    border-radius: $radius-lg;
    font-size: $font-size-sm;
    font-family: var(--font-family);
    color: var(--color-text-primary);
    background: #fff;

    &::placeholder {
      color: var(--color-text-muted);
    }

    &:focus {
      outline: none;
      border-color: var(--color-primary);
    }
  }

  &__error {
    padding: $spacing-4;
    color: var(--color-error);
    text-align: center;
    margin-bottom: $spacing-4;
  }

  &__section {
    margin-top: $spacing-6;
  }

  &__section-title {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
    margin: 0 0 $spacing-4 0;
    text-align: right;

    @include sm-max {
      font-size: $font-size-base;
      margin-bottom: $spacing-3;
    }
  }

  &__student-cell {
    display: flex;
    flex-direction: column;
    gap: $spacing-1;
  }

  &__student-name {
    font-weight: $font-weight-medium;
    color: var(--color-text-primary);
  }

  &__student-level {
    font-size: $font-size-xs;
    color: var(--color-text-secondary);
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
      // Applied via :style
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

  &__actions {
    display: flex;
    justify-content: center;
  }
}
</style>
