<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { AppLoading, TaskDetailDrawer } from '@/components/common'
import {
  getAdminStudents,
  getAdminTasks,
  completeAdminTask,
  type AdminTask,
  type AdminStudentsData,
} from '@/services/admin.service'
import { ADMIN_TASKS_PAGE } from '@/config/admin.constants'

const studentPickerOpen = ref(false)
const studentSearchQuery = ref('')
const studentPickerRef = ref<HTMLElement | null>(null)
const pickerDropdownRef = ref<HTMLElement | null>(null)
const dropdownPosition = ref({ top: 0, left: 0, width: 0 })

function updateDropdownPosition() {
  if (!studentPickerRef.value) return
  const rect = studentPickerRef.value.getBoundingClientRect()
  dropdownPosition.value = {
    top: rect.bottom + 12,
    left: rect.left,
    width: rect.width,
  }
}

onClickOutside(
  studentPickerRef,
  () => { studentPickerOpen.value = false },
  { ignore: [pickerDropdownRef] }
)

const loadingStudents = ref(true)
const loadingTasks = ref(false)
const error = ref<string | null>(null)
const studentsData = ref<AdminStudentsData | null>(null)
const tasks = ref<AdminTask[]>([])

const selectedStudentId = ref<number | null>(null)
const showDetailDrawer = ref(false)
const detailTaskId = ref<number | null>(null)
const completeLoading = ref<number | null>(null)

const students = computed(() => studentsData.value?.students ?? [])

const studentOptions = computed(() =>
  students.value.map((s) => ({ value: s.id, label: s.full_name }))
)

const filteredStudentOptions = computed(() => {
  const q = studentSearchQuery.value.trim().toLowerCase()
  if (!q) return studentOptions.value
  return studentOptions.value.filter((s) =>
    s.label.toLowerCase().includes(q)
  )
})

const selectedStudent = computed(() => {
  if (!selectedStudentId.value) return null
  return studentOptions.value.find((s) => s.value === selectedStudentId.value)
})

function selectStudent(id: number | null) {
  selectedStudentId.value = id
  studentPickerOpen.value = false
  studentSearchQuery.value = ''
}

function getInitials(name: string): string {
  const parts = (name ?? '').trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] || '') + (parts[1][0] || '')
  return (name?.[0] ?? '?').toUpperCase()
}

function getAvatarColor(name: string): string {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']
  let hash = 0
  for (let i = 0; i < (name || '').length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

const statCards = computed(() => {
  const total = tasks.value.length
  const completed = tasks.value.filter((t) => t.completed).length
  const pending = total - completed
  return [
    {
      key: 'total',
      icon: 'total' as const,
      value: total,
      label: ADMIN_TASKS_PAGE.TOTAL,
      tag: 'إجمالي',
      tagColor: { background: 'var(--color-stat-blue)', text: '#3B82F6' },
      iconBg: 'rgba(227, 242, 253, 1)',
    },
    {
      key: 'completed',
      icon: 'present' as const,
      value: completed,
      label: ADMIN_TASKS_PAGE.COMPLETED,
      tag: 'مكتمل',
      tagColor: { background: 'var(--color-stat-green)', text: '#10B981' },
      iconBg: 'rgba(232, 245, 233, 1)',
    },
    {
      key: 'pending',
      icon: 'delayed' as const,
      value: pending,
      label: ADMIN_TASKS_PAGE.PENDING,
      tag: 'معلق',
      tagColor: { background: 'var(--color-stat-yellow)', text: '#F59E0B' },
      iconBg: 'rgba(255, 243, 224, 1)',
    },
  ]
})

async function fetchStudents() {
  loadingStudents.value = true
  error.value = null
  try {
    const res = await getAdminStudents()
    if (res.success && res.data) {
      studentsData.value = res.data
    } else {
      studentsData.value = null
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'حدث خطأ في تحميل الطلاب'
    studentsData.value = null
  } finally {
    loadingStudents.value = false
  }
}

async function fetchTasks() {
  if (!selectedStudentId.value) {
    tasks.value = []
    return
  }
  loadingTasks.value = true
  error.value = null
  try {
    const res = await getAdminTasks(selectedStudentId.value)
    if (res.success && res.data) {
      tasks.value = Array.isArray(res.data) ? res.data : []
    } else {
      tasks.value = []
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'حدث خطأ في تحميل المهام'
    tasks.value = []
  } finally {
    loadingTasks.value = false
  }
}

function openDetail(task: AdminTask) {
  detailTaskId.value = task.id
  showDetailDrawer.value = true
}

function closeDetail() {
  showDetailDrawer.value = false
  detailTaskId.value = null
}

async function handleComplete(task: AdminTask) {
  if (task.completed) return
  completeLoading.value = task.id
  try {
    const res = await completeAdminTask(task.id)
    if (res.success) {
      await fetchTasks()
      closeDetail()
    } else {
      error.value = res.message ?? 'فشل تسجيل الإكمال'
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'حدث خطأ'
  } finally {
    completeLoading.value = null
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '---'
  const d = new Date(dateStr)
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'تم الإرسال': { bg: 'rgba(232, 245, 233, 1)', text: '#2E7D32' },
  'متأخر': { bg: 'rgba(255, 235, 238, 1)', text: '#C62828' },
  'اترك': { bg: 'rgba(255, 243, 224, 1)', text: '#E65100' },
}

function getStatusStyle(status: string): { backgroundColor: string; color: string } {
  const c = STATUS_COLORS[status] ?? { bg: 'rgba(245, 245, 245, 1)', text: '#616161' }
  return { backgroundColor: c.bg, color: c.text }
}

watch(selectedStudentId, () => {
  if (selectedStudentId.value) fetchTasks()
  else tasks.value = []
})

onMounted(() => fetchStudents())
</script>

<template>
  <div class="admin-tasks" data-component="AdminTasksView">


    <div v-if="error" class="admin-tasks__error">{{ error }}</div>

    <!-- Student picker - hero section -->
    <section class="admin-tasks__picker-hero">
      <div class="admin-tasks__picker-hero-bg" />
      <div class="admin-tasks__picker-hero-content">
        <div class="admin-tasks__picker-badge">الخطوة الأولى</div>
        <h2 class="admin-tasks__picker-title">{{ ADMIN_TASKS_PAGE.SELECT_STUDENT }}</h2>
        <p class="admin-tasks__picker-subtitle">اختر طالبًا من القائمة لعرض وإدارة مهامه</p>

        <div ref="studentPickerRef" class="admin-tasks__picker-trigger-wrap">
          <button
            type="button"
            class="admin-tasks__picker-trigger"
            :class="{
              'admin-tasks__picker-trigger--open': studentPickerOpen,
              'admin-tasks__picker-trigger--selected': selectedStudent,
              'admin-tasks__picker-trigger--loading': loadingStudents,
            }"
            :disabled="loadingStudents"
            @click="studentPickerOpen = !studentPickerOpen; studentPickerOpen && updateDropdownPosition()"
          >
            <span class="admin-tasks__picker-trigger-inner">
              <span
                v-if="selectedStudent"
                class="admin-tasks__picker-trigger-avatar"
                :style="{ backgroundColor: getAvatarColor(selectedStudent.label) }"
              >
                {{ getInitials(selectedStudent.label) }}
              </span>
              <span v-else class="admin-tasks__picker-trigger-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </span>
              <span class="admin-tasks__picker-trigger-text">
                {{ selectedStudent ? selectedStudent.label : ADMIN_TASKS_PAGE.SELECT_STUDENT_PLACEHOLDER }}
              </span>
              <span class="admin-tasks__picker-trigger-chevron">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </span>
            </span>
          </button>

          <Teleport to="body">
            <Transition name="picker-dropdown">
              <div
                v-if="studentPickerOpen"
                ref="pickerDropdownRef"
                class="admin-tasks__picker-dropdown admin-tasks__picker-dropdown--teleported"
                :style="{
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                  width: `${dropdownPosition.width}px`,
                }"
              >
              <div class="admin-tasks__picker-search" @click.stop>
                <svg class="admin-tasks__picker-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  v-model="studentSearchQuery"
                  type="search"
                  class="admin-tasks__picker-search-input"
                  placeholder="ابحث بالاسم..."
                  autocomplete="off"
                  @click.stop
                />
              </div>
              <div class="admin-tasks__picker-list">
                <button
                  type="button"
                  class="admin-tasks__picker-item admin-tasks__picker-item--clear"
                  @click.stop="selectStudent(null)"
                >
                  إلغاء الاختيار
                </button>
                <button
                  v-for="opt in filteredStudentOptions"
                  :key="opt.value"
                  type="button"
                  class="admin-tasks__picker-item"
                  :class="{ 'admin-tasks__picker-item--active': selectedStudentId === opt.value }"
                  @click.stop="selectStudent(opt.value)"
                >
                  <span
                    class="admin-tasks__picker-item-avatar"
                    :style="{ backgroundColor: getAvatarColor(opt.label) }"
                  >
                    {{ getInitials(opt.label) }}
                  </span>
                  <span class="admin-tasks__picker-item-name">{{ opt.label }}</span>
                  <span v-if="selectedStudentId === opt.value" class="admin-tasks__picker-item-check">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                </button>
                <div
                  v-if="filteredStudentOptions.length === 0"
                  class="admin-tasks__picker-empty"
                >
                  لا توجد نتائج لـ "{{ studentSearchQuery }}"
                </div>
              </div>
              </div>
            </Transition>
          </Teleport>
        </div>

        <p v-if="selectedStudent" class="admin-tasks__picker-confirm">
          تم اختيار <strong>{{ selectedStudent.label }}</strong> — المهام أدناه
        </p>

        <div v-else class="admin-tasks__picker-empty-state">
          <div class="admin-tasks__picker-empty-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <p class="admin-tasks__picker-empty-text">{{ ADMIN_TASKS_PAGE.EMPTY_NO_STUDENT }}</p>
        </div>
      </div>
    </section>

    <div v-if="loadingStudents" class="admin-tasks__loading">
      <AppLoading :full-screen="false" text="جاري تحميل الطلاب..." />
    </div>

    <template v-else-if="selectedStudentId">
      <!-- KPI Cards - modern design -->
      <section class="admin-tasks__stats">
        <div class="admin-tasks__stats-grid">
          <div
            v-for="card in statCards"
            :key="card.key"
            class="admin-tasks__kpi-card"
            :class="`admin-tasks__kpi-card--${card.key}`"
          >
          <div class="admin-tasks__kpi-content">
              <span v-if="loadingTasks" class="admin-tasks__kpi-value admin-tasks__kpi-value--skeleton">--</span>
              <span v-else class="admin-tasks__kpi-value">{{ card.value }}</span>
              <span class="admin-tasks__kpi-label">{{ card.label }}</span>
              <span class="admin-tasks__kpi-tag">{{ card.tag }}</span>
            </div>

            <div class="admin-tasks__kpi-icon">
              <svg v-if="card.key === 'total'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <svg v-else-if="card.key === 'completed'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
       
          </div>
        </div>
      </section>

      <div v-if="loadingTasks" class="admin-tasks__loading">
        <AppLoading :full-screen="false" text="جاري تحميل المهام..." />
      </div>

      <div
        v-else-if="tasks.length === 0"
        class="admin-tasks__empty"
      >
        {{ ADMIN_TASKS_PAGE.EMPTY }}
      </div>

      <div v-else class="admin-tasks__grid">
        <article
          v-for="task in tasks"
          :key="task.id"
          class="admin-tasks__card"
          :class="{ 'admin-tasks__card--completed': task.completed }"
        >
          <div class="admin-tasks__card-accent" :style="getStatusStyle(task.status)" />
          <div class="admin-tasks__card-inner">
            <header class="admin-tasks__card-header">
              <div class="admin-tasks__card-title-row">
                <h3 class="admin-tasks__card-from-to">{{ task.from_to }}</h3>
                <span
                  class="admin-tasks__card-tag"
                  :style="getStatusStyle(task.status)"
                >
                  {{ task.status }}
                </span>
              </div>
              <span
                class="admin-tasks__card-badge"
                :class="{ 'admin-tasks__card-badge--done': task.completed }"
                :aria-label="task.completed ? 'مكتمل' : 'قيد الانتظار'"
              >
                <svg v-if="task.completed" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                <span v-else class="admin-tasks__card-badge-circle" />
              </span>
            </header>

            <div class="admin-tasks__card-body">
              <div class="admin-tasks__card-meta">
                <span class="admin-tasks__card-meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {{ formatDate(task.due_date) }}
                </span>
                <span class="admin-tasks__card-meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
                  {{ task.listening || '---' }}
                </span>
                <span class="admin-tasks__card-meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                  {{ task.repetition || '---' }}
                </span>
              </div>
            </div>

            <footer class="admin-tasks__card-actions">
              <button
                v-if="!task.completed"
                type="button"
                class="admin-tasks__card-btn admin-tasks__card-btn--primary"
                :disabled="completeLoading === task.id"
                @click="handleComplete(task)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                {{ completeLoading === task.id ? 'جاري...' : ADMIN_TASKS_PAGE.MARK_COMPLETE }}
              </button>
              <button
                type="button"
                class="admin-tasks__card-btn admin-tasks__card-btn--ghost"
                @click="openDetail(task)"
              >
                {{ ADMIN_TASKS_PAGE.VIEW_DETAILS }}
              </button>
            </footer>
          </div>
        </article>
      </div>
    </template>

    <TaskDetailDrawer
      v-model="showDetailDrawer"
      :task-id="detailTaskId"
      :completing-task-id="completeLoading"
      @update:model-value="(v) => { showDetailDrawer = v; if (!v) detailTaskId = null }"
      @complete="handleComplete"
    />
  </div>
</template>

<style lang="scss" scoped>
.admin-tasks {
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
    background: rgba(239, 68, 68, 0.08);
    border-radius: $radius-lg;
  }

  &__picker-hero {
    position: relative;
    margin-bottom: $spacing-6;
    border-radius: $radius-2xl;
    background: linear-gradient(135deg, rgba(0, 138, 92, 0.08) 0%, rgba(19, 96, 71, 0.04) 100%);
    border: 1px solid rgba(0, 138, 92, 0.15);
  }

  &__picker-hero-bg {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0, 138, 92, 0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  &__picker-hero-content {
    position: relative;
    padding: $spacing-6 $spacing-5;
    text-align: center;
    overflow: visible;
  }

  &__picker-badge {
    display: inline-block;
    padding: $spacing-1 $spacing-3;
    font-size: $font-size-xs;
    font-weight: $font-weight-bold;
    color: var(--color-primary);
    background: rgba(0, 138, 92, 0.12);
    border-radius: $radius-full;
    margin-bottom: $spacing-3;
    letter-spacing: 0.02em;
  }

  &__picker-title {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
    margin: 0 0 $spacing-2 0;
  }

  &__picker-subtitle {
    font-size: $font-size-sm;
    color: var(--color-text-secondary);
    margin: 0 0 $spacing-5 0;
    line-height: 1.5;
  }

  &__picker-trigger-wrap {
    position: relative;
    max-width: 440px;
    margin: 0 auto;
    overflow: visible;
  }

  &__picker-trigger {
    width: 100%;
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
    text-align: right;
    font-family: inherit;
    transition: all 0.2s ease;

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }

  &__picker-trigger-inner {
    display: flex;
    align-items: center;
    gap: $spacing-3;
    width: 100%;
    padding: $spacing-4 $spacing-5;
    background: #fff;
    border: 2px solid var(--color-border);
    border-radius: $radius-xl;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.2s ease;

    .admin-tasks__picker-trigger:hover:not(:disabled) & {
      border-color: rgba(0, 138, 92, 0.4);
      box-shadow: 0 4px 16px rgba(0, 138, 92, 0.1);
    }

    .admin-tasks__picker-trigger--open & {
      border-color: var(--color-primary);
      box-shadow: 0 4px 20px rgba(0, 138, 92, 0.15);
    }

    .admin-tasks__picker-trigger--selected & {
      border-color: rgba(0, 138, 92, 0.5);
      background: rgba(0, 138, 92, 0.03);
    }
  }

  &__picker-trigger-icon {
    width: 44px;
    height: 44px;
    border-radius: $radius-lg;
    background: linear-gradient(135deg, rgba(0, 138, 92, 0.12), rgba(0, 138, 92, 0.06));
    color: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__picker-trigger-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $font-size-base;
    font-weight: $font-weight-bold;
    color: #fff;
    flex-shrink: 0;
  }

  &__picker-trigger-text {
    flex: 1;
    min-width: 0;
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
    color: var(--color-text-primary);

    .admin-tasks__picker-trigger:not(.admin-tasks__picker-trigger--selected) & {
      color: var(--color-text-muted);
    }
  }

  &__picker-trigger-chevron {
    color: var(--color-text-muted);
    flex-shrink: 0;
    transition: transform 0.2s ease;

    .admin-tasks__picker-trigger--open & {
      transform: rotate(180deg);
      color: var(--color-primary);
    }
  }

  &__picker-confirm {
    margin: $spacing-4 0 0;
    font-size: $font-size-sm;
    color: var(--color-text-secondary);

    strong {
      color: var(--color-primary);
      font-weight: $font-weight-bold;
    }
  }

  &__picker-empty-state {
    margin-top: $spacing-6;
    padding: $spacing-6;
    text-align: center;
  }

  &__picker-empty-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto $spacing-3;
    border-radius: 50%;
    background: rgba(0, 138, 92, 0.08);
    color: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__picker-empty-text {
    margin: 0;
    font-size: $font-size-sm;
    color: var(--color-text-secondary);
  }

  &__picker-dropdown {
    background: var(--color-background-card);

    &--teleported {
      position: fixed;
      z-index: 1100;
      direction: rtl;
    }
    border-radius: $radius-xl;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06);
    border: 1px solid var(--color-border);
    overflow: hidden;
    z-index: 50;
    max-height: 320px;
    display: flex;
    flex-direction: column;
  }

  &__picker-search {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    padding: $spacing-3;
    border-bottom: 1px solid var(--color-border);
    background: rgba(0, 138, 92, 0.03);
  }

  &__picker-search-icon {
    color: var(--color-text-muted);
    flex-shrink: 0;
  }

  &__picker-search-input {
    flex: 1;
    min-width: 0;
    padding: $spacing-2 $spacing-3;
    font-size: $font-size-sm;
    border: 1px solid var(--color-border);
    border-radius: $radius-md;
    background: var(--color-background);
    color: var(--color-text-primary);

    &::placeholder {
      color: var(--color-text-muted);
    }
  }

  &__picker-list {
    overflow-y: auto;
    padding: $spacing-2;
    max-height: 260px;
  }

  &__picker-item {
    display: flex;
    align-items: center;
    gap: $spacing-3;
    width: 100%;
    padding: $spacing-3;
    border: none;
    border-radius: $radius-lg;
    background: none;
    cursor: pointer;
    text-align: right;
    transition: all 0.15s ease;
    color: var(--color-text-primary);

    &:hover {
      background: rgba(0, 138, 92, 0.08);
    }

    &--active {
      background: rgba(0, 138, 92, 0.12);
      color: var(--color-primary);

      .admin-tasks__picker-item-name {
        font-weight: $font-weight-bold;
        color: var(--color-primary);
      }
    }

    &--clear {
      justify-content: center;
      color: var(--color-text-muted);
      border-bottom: 1px solid var(--color-border);
      margin-bottom: $spacing-2;
      font-size: $font-size-sm;
    }
  }

  &__picker-item-check {
    color: var(--color-primary);
    flex-shrink: 0;
  }

  &__picker-item-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $font-size-sm;
    font-weight: $font-weight-bold;
    color: #fff;
    flex-shrink: 0;
  }

  &__picker-item-name {
    font-size: $font-size-base;
  }

  &__picker-empty {
    padding: $spacing-6;
    text-align: center;
    font-size: $font-size-sm;
    color: var(--color-text-muted);
  }

  &__loading {
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__empty {
    padding: $spacing-8;
    text-align: center;
    color: var(--color-text-secondary);
    background: var(--color-background-card);
    border-radius: $radius-xl;
    border: 1px dashed var(--color-border);

    &--prompt {
      margin-top: $spacing-4;
    }
  }

  &__stats {
    margin-bottom: $spacing-6;
  }

  &__stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-4;

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }

  &__kpi-card {
    display: flex;
    align-items: flex-start;
    gap: $spacing-4;
    padding: $spacing-4 $spacing-5;
    background: #fff;
    border-radius: $radius-xl;
    border: 1px solid var(--color-border);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.2s ease;
    justify-content: space-between;

    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    }

    &--total {
      .admin-tasks__kpi-icon { background: rgba(59, 130, 246, 0.12); color: #3B82F6; }
      .admin-tasks__kpi-tag { background: rgba(59, 130, 246, 0.15); color: #2563EB; }
    }
    &--completed {
      .admin-tasks__kpi-icon { background: rgba(16, 185, 129, 0.12); color: #10B981; }
      .admin-tasks__kpi-tag { background: rgba(16, 185, 129, 0.15); color: #059669; }
    }
    &--pending {
      .admin-tasks__kpi-icon { background: rgba(245, 158, 11, 0.12); color: #F59E0B; }
      .admin-tasks__kpi-tag { background: rgba(245, 158, 11, 0.15); color: #D97706; }
    }
  }

  &__kpi-icon {
    width: 44px;
    height: 44px;
    border-radius: $radius-lg;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__kpi-content {
    display: flex;
    flex-direction: column;
    gap: $spacing-1;
  }

  &__kpi-value {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--color-text-primary);
    line-height: 1.2;

    &--skeleton {
      color: var(--color-text-muted);
      animation: kpiPulse 1.5s ease-in-out infinite;
    }
  }

  &__kpi-label {
    font-size: $font-size-sm;
    font-weight: 500;
    color: var(--color-text-secondary);
  }

  &__kpi-tag {
    font-size: $font-size-xs;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: $radius-full;
    align-self: flex-start;
  }

  @keyframes kpiPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: $spacing-4;
  }

  &__card {
    position: relative;
    background: #fff;
    border-radius: $radius-xl;
    border: 1px solid var(--color-border);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    overflow: hidden;
    transition: all 0.2s ease;

    &:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }

    &--completed .admin-tasks__card-accent {
      background: rgba(16, 185, 129, 0.6) !important;
    }
  }

  &__card-accent {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 4px;
  }

  &__card-inner {
    padding: $spacing-4 $spacing-5;
    padding-right: calc(#{$spacing-5} + 4px);
  }

  &__card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: $spacing-3;
    margin-bottom: $spacing-4;
  }

  &__card-title-row {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    flex-wrap: wrap;
  }

  &__card-from-to {
    font-size: $font-size-lg;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
  }

  &__card-tag {
    padding: 4px 10px;
    border-radius: $radius-full;
    font-size: $font-size-xs;
    font-weight: 600;
  }

  &__card-badge {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.06);
    color: var(--color-text-muted);
    flex-shrink: 0;

    &--done {
      background: rgba(16, 185, 129, 0.15);
      color: #10B981;
    }
  }

  &__card-badge-circle {
    width: 10px;
    height: 10px;
    border: 2px solid currentColor;
    border-radius: 50%;
  }

  &__card-body {
    margin-bottom: $spacing-4;
  }

  &__card-meta {
    display: flex;
    flex-direction: column;
    gap: $spacing-2;
  }

  &__card-meta-item {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    font-size: $font-size-sm;
    color: var(--color-text-secondary);

    svg {
      flex-shrink: 0;
      color: var(--color-text-muted);
    }
  }

  &__card-actions {
    display: flex;
    gap: $spacing-3;
    padding-top: $spacing-4;
    border-top: 1px solid var(--color-border);
    flex-wrap: wrap;
  }

  &__card-btn {
    display: inline-flex;
    align-items: center;
    gap: $spacing-2;
    padding: $spacing-2 $spacing-4;
    border-radius: $radius-lg;
    font-size: $font-size-sm;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    border: none;

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    &--primary {
      background: var(--color-primary);
      color: #fff;

      &:hover:not(:disabled) {
        background: #008a5c;
        transform: translateY(-1px);
      }
    }

    &--ghost {
      background: rgba(0, 138, 92, 0.08);
      color: var(--color-primary);

      &:hover {
        background: rgba(0, 138, 92, 0.12);
      }
    }
  }

}

.picker-dropdown-enter-active,
.picker-dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.picker-dropdown-enter-from,
.picker-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
