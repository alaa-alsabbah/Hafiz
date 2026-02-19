<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { BaseTable, AppLoading, StudentProfileDrawer, AssignStudentDialog, EditStudentDialog, DataTableFilterBar, KpiStatCard } from '@/components/common'
import type { AssignStudentPayload } from '@/components/common/AssignStudentDialog.vue'
import { ActionMenu } from '@/components/ui'
import type { ActionMenuItem } from '@/components/ui/ActionMenu.vue'
import type { ApiResponse } from '@/services/api'
import type { Student } from '@/services/teacher.service'
import { getAdminStudents, getAdminStudent, deleteAdminStudent, type AdminStudent, type AdminStudentsData } from '@/services/admin.service'
import { ADMIN_STUDENTS_PAGE } from '@/config/admin.constants'
import { STUDENT_STATUS_COLORS } from '@/config/teacher.constants'

const loading = ref(true)
const error = ref<string | null>(null)
const data = ref<AdminStudentsData | null>(null)

const programFilter = ref<'all' | number>('all')
const searchQuery = ref('')
const statusFilter = ref('')
const studentFilter = ref('')

const showProfileDrawer = ref(false)
const selectedStudentId = ref<number | null>(null)

const showAssignDialog = ref(false)
const assignStudent = ref<AssignStudentPayload | null>(null)

const showEditDialog = ref(false)
const editStudentId = ref<number | null>(null)

const deleteConfirm = ref<AdminStudent | null>(null)
const deleteLoading = ref(false)

async function fetchStudents() {
  loading.value = true
  error.value = null
  try {
    const programId = programFilter.value === 'all' ? undefined : (programFilter.value as number)
    const response = await getAdminStudents(programId)
    if (response.success && response.data) {
      data.value = response.data
    } else {
      data.value = null
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'حدث خطأ في تحميل الطلاب'
    data.value = null
  } finally {
    loading.value = false
  }
}

const statCards = computed(() => {
  const d = data.value
  return [
    {
      key: 'total',
      icon: 'total' as const,
      value: d?.full_counts ?? 0,
      label: ADMIN_STUDENTS_PAGE.STATS.TOTAL.LABEL,
      tag: ADMIN_STUDENTS_PAGE.STATS.TOTAL.TAG,
      tagColor: ADMIN_STUDENTS_PAGE.STATS.TOTAL.TAG_COLOR,
      iconBg: 'rgba(232, 245, 233, 1)',
    },
    {
      key: 'active',
      icon: 'active' as const,
      value: d?.active_count ?? 0,
      label: ADMIN_STUDENTS_PAGE.STATS.ACTIVE.LABEL,
      tag: ADMIN_STUDENTS_PAGE.STATS.ACTIVE.TAG,
      tagColor: ADMIN_STUDENTS_PAGE.STATS.ACTIVE.TAG_COLOR,
      iconBg: 'rgba(227, 242, 253, 1)',
    },
    {
      key: 'hefaza',
      icon: 'hefaza' as const,
      value: d?.hafaza_count ?? 0,
      label: ADMIN_STUDENTS_PAGE.STATS.HEFAZA.LABEL,
      tag: ADMIN_STUDENTS_PAGE.STATS.HEFAZA.TAG,
      tagColor: ADMIN_STUDENTS_PAGE.STATS.HEFAZA.TAG_COLOR,
      iconBg: 'rgba(232, 245, 233, 1)',
    },
    {
      key: 'fursan',
      icon: 'fursan' as const,
      value: d?.fursan_count ?? 0,
      label: ADMIN_STUDENTS_PAGE.STATS.FURSAN.LABEL,
      tag: ADMIN_STUDENTS_PAGE.STATS.FURSAN.TAG,
      tagColor: ADMIN_STUDENTS_PAGE.STATS.FURSAN.TAG_COLOR,
      iconBg: 'rgba(232, 245, 233, 1)',
    },
  ]
})

const students = computed(() => data.value?.students ?? [])

const filteredStudents = computed(() => {
  let list = students.value
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(
      (s) =>
        s.full_name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q)
    )
  }
  return list
})

function getStatusLabel(student: AdminStudent): string {
  if (!student.teacher) return 'غير معين'
  if (student.level) return student.level
  return 'معلق'
}

function openStudentProfile(id: number) {
  selectedStudentId.value = id
  showProfileDrawer.value = true
}

function openAssignDialog(row: AdminStudent) {
  assignStudent.value = {
    id: row.id,
    full_name: row.full_name,
    level: row.level,
    program: row.program,
    teacher: row.teacher,
  }
  showAssignDialog.value = true
}

function openEditDialog(row: AdminStudent) {
  editStudentId.value = row.id
  showEditDialog.value = true
}

function onAssignSuccess() {
  fetchStudents()
}

function onEditSuccess() {
  fetchStudents()
}

function openDeleteConfirm(row: AdminStudent) {
  deleteConfirm.value = row
}

function closeDeleteConfirm() {
  deleteConfirm.value = null
}

async function confirmDeleteStudent() {
  const row = deleteConfirm.value
  if (!row) return
  deleteLoading.value = true
  try {
    const res = await deleteAdminStudent(row.id)
    if (res.success) {
      closeDeleteConfirm()
      fetchStudents()
    } else {
      error.value = res.message ?? 'فشل حذف الطالب'
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'حدث خطأ أثناء الحذف'
  } finally {
    deleteLoading.value = false
  }
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

function getStatusStyle(status: string): { backgroundColor: string; color: string } {
  const colors = STUDENT_STATUS_COLORS[status] || STUDENT_STATUS_COLORS['غير معين']
  return { backgroundColor: colors.bg, color: colors.text }
}


function getActionItems(row: AdminStudent): ActionMenuItem[] {
  return [
    { id: 'view', label: ADMIN_STUDENTS_PAGE.ACTIONS.VIEW, icon: 'eye', onClick: () => openStudentProfile(row.id) },
    { id: 'assign', label: ADMIN_STUDENTS_PAGE.ACTIONS.ASSIGN, icon: 'user-plus', onClick: () => openAssignDialog(row) },
    { id: 'edit', label: ADMIN_STUDENTS_PAGE.ACTIONS.EDIT, icon: 'edit', onClick: () => openEditDialog(row) },
    { id: 'email', label: ADMIN_STUDENTS_PAGE.ACTIONS.EMAIL, icon: 'email', onClick: () => {} },
    { id: 'whatsapp', label: ADMIN_STUDENTS_PAGE.ACTIONS.WHATSAPP, icon: 'whatsapp', onClick: () => {} },
    { id: 'delete', label: ADMIN_STUDENTS_PAGE.ACTIONS.DELETE, icon: 'trash', onClick: () => openDeleteConfirm(row) },
  ]
}

const programTabs = [
  { id: 'all', label: ADMIN_STUDENTS_PAGE.FILTERS.ALL, value: 'all' as const },
  { id: 'hefaza', label: ADMIN_STUDENTS_PAGE.FILTERS.HEFAZA, value: 1 },
  { id: 'fursan', label: ADMIN_STUDENTS_PAGE.FILTERS.FURSAN, value: 2 },
]

const studentColumns = [
  { key: 'student', label: ADMIN_STUDENTS_PAGE.TABLE.STUDENT, width: '18%' },
  { key: 'program', label: ADMIN_STUDENTS_PAGE.TABLE.PROGRAM, width: '10%' },
  { key: 'program_track', label: ADMIN_STUDENTS_PAGE.TABLE.TRACK, width: '18%' },
  { key: 'teacher', label: ADMIN_STUDENTS_PAGE.TABLE.TEACHER, width: '12%' },
  { key: 'group', label: ADMIN_STUDENTS_PAGE.TABLE.GROUP, width: '10%' },
  { key: 'status', label: ADMIN_STUDENTS_PAGE.TABLE.STATUS, width: '10%' },
  { key: 'warnings_count', label: ADMIN_STUDENTS_PAGE.TABLE.WARNINGS, width: '6%' },
  { key: 'leaves_count', label: ADMIN_STUDENTS_PAGE.TABLE.LEAVES, width: '6%' },
  { key: 'score', label: ADMIN_STUDENTS_PAGE.TABLE.RATING, width: '5%' },
  { key: 'actions', label: ADMIN_STUDENTS_PAGE.TABLE.ACTIONS, width: '5%' },
]

watch(programFilter, () => fetchStudents())
onMounted(() => fetchStudents())
</script>

<template>
  <div class="admin-students" data-component="AdminStudentsView">
  

    <div v-if="error" class="admin-students__error">{{ error }}</div>

    <div v-if="loading && !data" class="admin-students__loading">
      <AppLoading :full-screen="false" text="جاري تحميل الطلاب..." />
    </div>

    <template v-else>
      <!-- Stats Cards -->
      <section class="admin-students__stats">
        <div class="admin-students__stats-grid">
          <div v-for="card in statCards" :key="card.key" class="admin-students__stat-card-wrapper">
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
        :search-placeholder="ADMIN_STUDENTS_PAGE.FILTERS.SEARCH_PLACEHOLDER"
        :search-model-value="searchQuery"
        @update:search-model-value="searchQuery = $event"
        :status-options="[]"
        :status-all-label="ADMIN_STUDENTS_PAGE.FILTERS.ALL_STATUSES"
        :status-model-value="statusFilter"
        @update:status-model-value="statusFilter = $event"
        :student-options="[]"
        :student-placeholder="ADMIN_STUDENTS_PAGE.FILTERS.SELECT_STUDENT"
        :student-model-value="studentFilter"
        @update:student-model-value="studentFilter = $event"
        :show-date="false"
        :show-export="true"
        :export-label="ADMIN_STUDENTS_PAGE.FILTERS.EXPORT"
        class="admin-students__filter-bar"
      />

      <!-- Table -->
      <div class="admin-students__table-section">
        <h2 class="admin-students__section-title">{{ ADMIN_STUDENTS_PAGE.SECTION_TITLE }}</h2>
        <BaseTable
          :columns="studentColumns"
          :data="filteredStudents"
          :loading="loading"
          :page-size-options="[5, 10, 25]"
        >
          <template #cell-student="{ row }">
            <div class="admin-students__cell-student">
              <span class="admin-students__cell-name">{{ row.full_name }}</span>
              <span v-if="row.level" class="admin-students__cell-level">{{ row.level }}</span>
            </div>
          </template>
          <template #cell-program="{ row }">
            <span v-if="row.program" class="admin-students__badge admin-students__badge--program">
              {{ row.program }}
            </span>
            <span v-else>---</span>
          </template>
          <template #cell-program_track="{ row }">
            {{ row.program_track || '---' }}
          </template>
          <template #cell-teacher="{ row }">
            {{ row.teacher || '---' }}
          </template>
          <template #cell-group="{ row }">
            {{ row.level || '---' }}
          </template>
          <template #cell-status="{ row }">
            <span
              class="admin-students__badge admin-students__badge--status"
              :style="getStatusStyle(getStatusLabel(row))"
            >
              {{ getStatusLabel(row) }}
            </span>
          </template>
          <template #cell-warnings_count="{ row }">
            {{ row.warnings_count ?? '---' }}
          </template>
          <template #cell-leaves_count="{ row }">
            {{ row.leaves_count ?? '---' }}
          </template>
          <template #cell-score="{ row }">
            <span class="admin-students__rating">
              {{ row.score ?? 0 }}
              <svg class="admin-students__star" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </span>
          </template>
          <template #cell-actions="{ row }">
            <div class="admin-students__actions-cell" @click.stop>
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

      <AssignStudentDialog
        v-model="showAssignDialog"
        :student="assignStudent"
        @success="onAssignSuccess"
      />

      <EditStudentDialog
        v-model="showEditDialog"
        :student-id="editStudentId"
        @success="onEditSuccess"
      />

      <!-- Delete student confirmation -->
      <Teleport to="body">
        <Transition name="dialog">
          <div
            v-if="deleteConfirm"
            class="admin-students__delete-overlay"
            @click.self="closeDeleteConfirm"
          >
            <div class="admin-students__delete-dialog">
              <h3 class="admin-students__delete-title">
                {{ ADMIN_STUDENTS_PAGE.DELETE_CONFIRM.TITLE }}
              </h3>
              <p class="admin-students__delete-message">
                {{ ADMIN_STUDENTS_PAGE.DELETE_CONFIRM.MESSAGE }}
              </p>
              <p v-if="deleteConfirm" class="admin-students__delete-student-name">
                {{ deleteConfirm.full_name }}
              </p>
              <div class="admin-students__delete-actions">
                <button
                  type="button"
                  class="admin-students__delete-btn admin-students__delete-btn--cancel"
                  :disabled="deleteLoading"
                  @click="closeDeleteConfirm"
                >
                  {{ ADMIN_STUDENTS_PAGE.DELETE_CONFIRM.CANCEL }}
                </button>
                <button
                  type="button"
                  class="admin-students__delete-btn admin-students__delete-btn--delete"
                  :disabled="deleteLoading"
                  @click="confirmDeleteStudent"
                >
                  {{ deleteLoading ? 'جاري الحذف...' : ADMIN_STUDENTS_PAGE.DELETE_CONFIRM.DELETE }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.admin-students {
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

  &__cell-level {
    font-size: $font-size-xs;
    color: var(--color-text-muted);
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
      /* colors applied via :style from getStatusStyle() */
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

.admin-students__delete-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: $spacing-4;
  direction: rtl;
}

.admin-students__delete-dialog {
  background: #fff;
  border-radius: $radius-xl;
  padding: $spacing-6;
  max-width: 420px;
  width: 100%;
  box-shadow: $shadow-lg;
}

.admin-students__delete-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: var(--color-text-primary);
  margin: 0 0 $spacing-3 0;
  text-align: right;
}

.admin-students__delete-message {
  font-size: $font-size-base;
  color: var(--color-text-secondary);
  margin: 0 0 $spacing-2 0;
  line-height: 1.5;
  text-align: right;
}

.admin-students__delete-student-name {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: var(--color-primary);
  margin: 0 0 $spacing-5 0;
  text-align: right;
}

.admin-students__delete-actions {
  display: flex;
  gap: $spacing-3;
  justify-content: flex-start;
}

.admin-students__delete-btn {
  padding: $spacing-2 $spacing-5;
  border-radius: $radius-lg;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: all $transition-fast;
  border: none;

  &--cancel {
    background: #fff;
    border: 1px solid var(--color-border);
    color: var(--color-text-secondary);

    &:hover:not(:disabled) {
      background: #f9fafb;
    }
  }

  &--delete {
    background: #ef4444;
    color: #fff;

    &:hover:not(:disabled) {
      background: #dc2626;
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
}

.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-active .admin-students__delete-dialog,
.dialog-leave-active .admin-students__delete-dialog {
  transition: transform 0.2s ease;
}

.dialog-enter-from .admin-students__delete-dialog,
.dialog-leave-to .admin-students__delete-dialog {
  transform: scale(0.95);
}
</style>
