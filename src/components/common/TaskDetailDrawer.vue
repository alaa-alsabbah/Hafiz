<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ApiResponse } from '@/services/api'
import { getAdminTaskDetail, type AdminTask } from '@/services/admin.service'
import AppLoading from '@/components/common/AppLoading.vue'
import { ADMIN_TASKS_PAGE } from '@/config/admin.constants'

interface Props {
  modelValue: boolean
  taskId: number | null
  /** Optional: id of task currently being completed (disables complete button) */
  completingTaskId?: number | null
  /** Optional: override the default fetch. When provided, used instead of getAdminTaskDetail */
  getTask?: (id: number) => Promise<ApiResponse<AdminTask>>
}

const props = withDefaults(defineProps<Props>(), {
  completingTaskId: null,
})
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'complete': [task: AdminTask]
}>()

const task = ref<AdminTask | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'تم الإرسال': { bg: 'rgba(232, 245, 233, 1)', text: '#2E7D32' },
  'متأخر': { bg: 'rgba(255, 235, 238, 1)', text: '#C62828' },
  'اترك': { bg: 'rgba(255, 243, 224, 1)', text: '#E65100' },
}

const statusStyle = computed(() => {
  const s = task.value?.status
  const c = (s && STATUS_COLORS[s]) ?? { bg: 'rgba(245, 245, 245, 1)', text: '#616161' }
  return { backgroundColor: c.bg, color: c.text }
})

function close() {
  emit('update:modelValue', false)
}

function handleOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) close()
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '---'
  const d = new Date(dateStr)
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
}

// Grouped sections for better visual hierarchy
const taskContentRows = computed(() => {
  const t = task.value
  if (!t) return []
  return [
    { key: 'from_to', label: ADMIN_TASKS_PAGE.FROM_TO, value: t.from_to || '---', icon: 'book' },
    { key: 'listening', label: ADMIN_TASKS_PAGE.LISTENING, value: t.listening || '---', icon: 'headphones' },
    { key: 'repetition', label: ADMIN_TASKS_PAGE.REPETITION, value: t.repetition || '---', icon: 'repeat' },
    { key: 'link', label: ADMIN_TASKS_PAGE.LINK, value: t.link || '---', icon: 'link' },
    { key: 'review', label: ADMIN_TASKS_PAGE.REVIEW, value: t.review || '---', icon: 'refresh' },
  ]
})

const programRows = computed(() => {
  const t = task.value
  if (!t) return []
  return [
    { key: 'program', label: ADMIN_TASKS_PAGE.PROGRAM, value: t.program || '---', icon: 'graduation' },
    { key: 'track', label: ADMIN_TASKS_PAGE.PROGRAM_TRACK, value: t.program_track || '---', icon: 'track' },
  ]
})


async function fetchTask() {
  if (!props.taskId) return
  loading.value = true
  error.value = null
  task.value = null
  try {
    const fetcher = props.getTask ?? getAdminTaskDetail
    const res = await fetcher(props.taskId)
    if (res.success && res.data) {
      task.value = res.data
    } else {
      error.value = res.message || 'فشل تحميل تفاصيل المهمة'
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'حدث خطأ أثناء التحميل'
  } finally {
    loading.value = false
  }
}

function handleComplete() {
  if (task.value) emit('complete', task.value)
}

watch(
  () => [props.modelValue, props.taskId] as const,
  ([open, id]) => {
    if (open && id) fetchTask()
  },
  { immediate: true }
)
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div
        v-if="modelValue"
        class="task-detail-drawer"
        @click="handleOverlayClick"
      >
        <aside class="task-detail-drawer__panel">
          <button
            type="button"
            class="task-detail-drawer__close"
            aria-label="إغلاق"
            @click="close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <template v-if="loading">
            <div class="task-detail-drawer__loading">
              <AppLoading :full-screen="false" size="md" />
            </div>
          </template>

          <template v-else-if="error">
            <div class="task-detail-drawer__error">{{ error }}</div>
          </template>

          <template v-else-if="task">
            <div class="task-detail-drawer__header">
              <div class="task-detail-drawer__header-main">
                <div class="task-detail-drawer__avatar">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div class="task-detail-drawer__header-info">
                  <div class="task-detail-drawer__header-name-row">
                    <h2 class="task-detail-drawer__name">{{ task.from_to }}</h2>
                    <span
                      class="task-detail-drawer__status"
                      :style="statusStyle"
                    >
                      {{ task.status || '---' }}
                    </span>
                  </div>
                  <p class="task-detail-drawer__level">{{ task.full_name }}</p>
                </div>
              </div>
            </div>

            <div class="task-detail-drawer__content">
              <!-- Task content section -->
              <section class="task-detail-drawer__section">
                <h3 class="task-detail-drawer__section-title">محتوى المهمة</h3>
                <div class="task-detail-drawer__cards">
                  <div
                    v-for="row in taskContentRows"
                    :key="row.key"
                    class="task-detail-drawer__card"
                  >
                    <div class="task-detail-drawer__card-icon" :data-icon="row.icon">
                      <svg v-if="row.icon === 'book'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                      <svg v-else-if="row.icon === 'headphones'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
                      <svg v-else-if="row.icon === 'repeat'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                      <svg v-else-if="row.icon === 'link'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                      <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                    </div>
                    <div class="task-detail-drawer__card-body">
                      <span class="task-detail-drawer__card-label">{{ row.label }}</span>
                      <span class="task-detail-drawer__card-value">{{ row.value }}</span>
                    </div>
                  </div>
                </div>
              </section>

              <!-- Program info section -->
              <section class="task-detail-drawer__section">
                <h3 class="task-detail-drawer__section-title">معلومات البرنامج</h3>
                <div class="task-detail-drawer__cards">
                  <div
                    v-for="row in programRows"
                    :key="row.key"
                    class="task-detail-drawer__card"
                  >
                    <div class="task-detail-drawer__card-icon" :data-icon="row.icon">
                      <svg v-if="row.icon === 'graduation'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                      <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M8 7h8"/><path d="M8 11h8"/></svg>
                    </div>
                    <div class="task-detail-drawer__card-body">
                      <span class="task-detail-drawer__card-label">{{ row.label }}</span>
                      <span class="task-detail-drawer__card-value">{{ row.value }}</span>
                    </div>
                  </div>
                </div>
              </section>

              <!-- Dates section -->
              <section class="task-detail-drawer__section">
                <h3 class="task-detail-drawer__section-title">التواريخ</h3>
                <div class="task-detail-drawer__dates">
                  <div class="task-detail-drawer__date-card">
                    <svg class="task-detail-drawer__date-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <div>
                      <span class="task-detail-drawer__date-label">{{ ADMIN_TASKS_PAGE.DUE_DATE }}</span>
                      <span class="task-detail-drawer__date-value">{{ task ? formatDate(task.due_date) : '---' }}</span>
                    </div>
                  </div>
                  <div class="task-detail-drawer__date-card">
                    <svg class="task-detail-drawer__date-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <div>
                      <span class="task-detail-drawer__date-label">{{ ADMIN_TASKS_PAGE.CREATED_AT }}</span>
                      <span class="task-detail-drawer__date-value">{{ task ? formatDate(task.created_at) : '---' }}</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div class="task-detail-drawer__footer">
              <button
                v-if="!task.completed"
                type="button"
                class="task-detail-drawer__complete-btn"
                :disabled="completingTaskId === task.id"
                @click="handleComplete"
              >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                {{ completingTaskId === task.id ? 'جاري...' : ADMIN_TASKS_PAGE.MARK_COMPLETE }}
              </button>
            </div>
          </template>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.task-detail-drawer {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
  align-items: stretch;
  direction: rtl;
}

.task-detail-drawer__panel {
  width: 100%;
  max-width: 640px;
  font-size: 0.8125rem;
  background: #fff;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  border-radius: 0 $radius-2xl $radius-2xl 0;
  direction: rtl;

  @include sm-max {
    max-width: 100%;
    border-radius: 0;
  }
}

.task-detail-drawer__close {
  position: absolute;
  top: $spacing-1;
  right: $spacing-3;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all $transition-fast;
  z-index: 10;

  &:hover {
    background: rgba(0, 0, 0, 0.08);
    color: var(--color-text-primary);
  }
}

.task-detail-drawer__loading,
.task-detail-drawer__error {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-6;
  font-size: 0.75rem;
}

.task-detail-drawer__error {
  color: var(--color-error);
  text-align: center;
}

.task-detail-drawer__header {
  padding: $spacing-4 $spacing-5 $spacing-3;
  padding-top: $spacing-10;
  background: #fff;
  flex-shrink: 0;
  border-bottom: none;
}

.task-detail-drawer__header-main {
  display: flex;
  align-items: flex-start;
  gap: $spacing-3;
}

.task-detail-drawer__avatar {
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #009968 0%, #136047 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.task-detail-drawer__header-info {
  flex: 1;
  min-width: 0;
}

.task-detail-drawer__header-name-row {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  flex-wrap: wrap;
  margin-bottom: $spacing-1;
}

.task-detail-drawer__name {
  font-size: 1rem;
  font-weight: $font-weight-bold;
  color: var(--color-text-primary);
  margin: 0;
}

.task-detail-drawer__level {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.task-detail-drawer__status {
  display: inline-block;
  padding: 2px $spacing-2;
  border-radius: $radius-full;
  font-size: 0.6875rem;
  font-weight: $font-weight-medium;
}

.task-detail-drawer__content {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-4 $spacing-5;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  gap: $spacing-5;
}

.task-detail-drawer__section {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.task-detail-drawer__section-title {
  font-size: 0.75rem;
  font-weight: $font-weight-bold;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0;
  padding-bottom: $spacing-1;
  border-bottom: 1px solid var(--color-border);
}

.task-detail-drawer__cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-3;

  @include sm-max {
    grid-template-columns: 1fr;
  }
}

.task-detail-drawer__card {
  display: flex;
  align-items: flex-start;
  gap: $spacing-3;
  padding: $spacing-3 $spacing-4;
  background: rgba(0, 138, 92, 0.04);
  border-radius: $radius-lg;
  border: 1px solid rgba(0, 138, 92, 0.12);
  transition: background $transition-fast;
}

.task-detail-drawer__card:hover {
  background: rgba(0, 138, 92, 0.06);
}

.task-detail-drawer__card-icon {
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: $radius-md;
  background: rgba(0, 138, 92, 0.12);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.task-detail-drawer__card-icon svg {
  flex-shrink: 0;
}

.task-detail-drawer__card-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-1;
}

.task-detail-drawer__card-label {
  font-size: 0.6875rem;
  font-weight: $font-weight-bold;
  color: var(--color-text-secondary);
}

.task-detail-drawer__card-value {
  font-size: 0.875rem;
  font-weight: $font-weight-medium;
  color: var(--color-text-primary);
  line-height: 1.5;
}

.task-detail-drawer__dates {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-3;

  @include sm-max {
    grid-template-columns: 1fr;
  }
}

.task-detail-drawer__date-card {
  display: flex;
  align-items: flex-start;
  gap: $spacing-3;
  padding: $spacing-4;
  background: linear-gradient(135deg, rgba(0, 138, 92, 0.06) 0%, rgba(0, 138, 92, 0.02) 100%);
  border-radius: $radius-lg;
  border: 1px solid rgba(0, 138, 92, 0.1);
}

.task-detail-drawer__date-icon {
  flex-shrink: 0;
  color: var(--color-primary);
  margin-top: 2px;
}

.task-detail-drawer__date-label {
  display: block;
  font-size: 0.6875rem;
  font-weight: $font-weight-bold;
  color: var(--color-text-secondary);
  margin-bottom: $spacing-1;
}

.task-detail-drawer__date-value {
  font-size: 0.875rem;
  font-weight: $font-weight-medium;
  color: var(--color-text-primary);
}

.task-detail-drawer__footer {
  display: flex;
  align-items: center;
  padding: $spacing-3 $spacing-4;
  border-top: 1px solid var(--color-border);
  background: #fff;
  flex-shrink: 0;
}

.task-detail-drawer__complete-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  width: 100%;
  padding: $spacing-2 $spacing-4;
  border: none;
  border-radius: $radius-md;
  background: linear-gradient(90deg, #009968 0%, #136047 100%);
  color: #fff;
  font-size: 0.875rem;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: all $transition-fast;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    opacity: 0.95;
    filter: brightness(1.05);
  }

  svg {
    flex-shrink: 0;
  }
}

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity $transition-normal;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-active .task-detail-drawer__panel,
.drawer-leave-active .task-detail-drawer__panel {
  transition: transform $transition-normal ease-out;
}

.drawer-enter-from .task-detail-drawer__panel,
.drawer-leave-to .task-detail-drawer__panel {
  transform: translateX(100%);
}
</style>
