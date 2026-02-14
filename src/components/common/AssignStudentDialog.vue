<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import {
  getAdminTeachers,
  assignStudentToTeacher,
  type AdminDashboardTeacher,
} from '@/services/admin.service'
import { ADMIN_STUDENTS_PAGE } from '@/config/admin.constants'
import { STUDENT_STATUS_COLORS } from '@/config/teacher.constants'

export interface AssignStudentPayload {
  id: number
  full_name: string
  level: string | null
  program: string
  teacher: string | null
}

interface Props {
  modelValue: boolean
  student: AssignStudentPayload | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
}>()

const LABELS = ADMIN_STUDENTS_PAGE.ASSIGN_DIALOG

const teachers = ref<AdminDashboardTeacher[]>([])
const teachersLoading = ref(false)
const selectedTeacherId = ref<number | null>(null)
const submitting = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const teacherOptions = computed(() => {
  const capacity = (t: AdminDashboardTeacher) => t.students_count ?? 10
  const current = (t: AdminDashboardTeacher) => t.current_count ?? 0
  return teachers.value.map((t) => ({
    id: t.id,
    value: t.id,
    label: t.full_name,
    disabled: current(t) >= capacity(t),
  }))
})

const selectedTeacher = computed(() =>
  teachers.value.find((t) => t.id === selectedTeacherId.value)
)

const selectedTeacherSlots = computed(() => {
  const t = selectedTeacher.value
  if (!t) return null
  const cap = t.students_count ?? 10
  const cur = t.current_count ?? 0
  const available = Math.max(0, cap - cur)
  return { available, current: cur, capacity: cap }
})

const statusLabel = computed(() => {
  if (!props.student?.teacher) return 'غير معين'
  if (props.student?.level) return props.student.level
  return 'نشط'
})

const statusStyle = computed(() => {
  const status = statusLabel.value
  return STUDENT_STATUS_COLORS[status] || STUDENT_STATUS_COLORS['نشط']
})

const initials = computed(() => {
  const name = props.student?.full_name ?? ''
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '—'
})

watch(
  () => props.modelValue,
  async (open) => {
    if (!open) {
      selectedTeacherId.value = null
      error.value = null
      successMessage.value = null
      return
    }
    successMessage.value = null
    teachersLoading.value = true
    error.value = null
    try {
      const res = await getAdminTeachers()
      if (res.success && res.data) {
        teachers.value = res.data
      } else {
        teachers.value = []
      }
    } catch {
      teachers.value = []
    } finally {
      teachersLoading.value = false
    }
  }
)

function closeDialog() {
  emit('update:modelValue', false)
}

function handleOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) closeDialog()
}

async function handleAssign() {
  if (!props.student || selectedTeacherId.value == null) {
    error.value = 'اختر معلمًا'
    return
  }
  error.value = null
  successMessage.value = null
  submitting.value = true
  try {
    const res = await assignStudentToTeacher(props.student.id, selectedTeacherId.value)
    if (res.success) {
      successMessage.value = res.message ?? 'تم ربط الطالب بالمعلم بنجاح'
      setTimeout(() => {
        closeDialog()
        emit('success')
      }, 1800)
    } else {
      error.value = res.message ?? 'فشل تعيين المعلم'
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'حدث خطأ أثناء التعيين'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="modelValue"
        class="assign-student-dialog"
        @click="handleOverlayClick"
      >
        <div class="assign-student-dialog__content">
          <button
            type="button"
            class="assign-student-dialog__close"
            aria-label="إغلاق"
            @click="closeDialog"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <h2 class="assign-student-dialog__title">{{ LABELS.TITLE }}</h2>
          <p class="assign-student-dialog__subtitle">
            {{ LABELS.SUBTITLE }}
            <template v-if="student">{{ student.full_name }}</template>
            {{ LABELS.SUBTITLE_SUFFIX }}
          </p>

          <!-- Student info -->
          <div class="assign-student-dialog__student">
            <div class="assign-student-dialog__student-main">
              <div
                class="assign-student-dialog__avatar"
                :style="{ backgroundColor: statusStyle.bg, color: statusStyle.text }"
              >
                {{ initials }}
              </div>
              <div class="assign-student-dialog__student-info">
                <div class="assign-student-dialog__student-name-row">
                  <span class="assign-student-dialog__student-name">{{ student?.full_name ?? '—' }}</span>
                  <span
                    class="assign-student-dialog__status-badge"
                    :style="{ backgroundColor: statusStyle.bg, color: statusStyle.text }"
                  >
                    {{ statusLabel }}
                  </span>
                </div>
                <span v-if="student?.level" class="assign-student-dialog__student-level">
                  {{ student.level }}
                </span>
              </div>
            </div>
            <div class="assign-student-dialog__program-card">
              <span class="assign-student-dialog__program-label">{{ LABELS.PROGRAM }}</span>
              <span class="assign-student-dialog__program-value">{{ student?.program ?? '—' }}</span>
            </div>
          </div>

          <!-- Choose teacher -->
          <div class="assign-student-dialog__field">
            <label class="assign-student-dialog__label">{{ LABELS.CHOOSE_TEACHER }}</label>
            <div class="assign-student-dialog__select-row">
              <BaseSelect
                :model-value="selectedTeacherId"
                :options="teacherOptions"
                :placeholder="LABELS.CHOOSE_TEACHER"
                :disabled="teachersLoading"
                class="assign-student-dialog__select"
                @update:model-value="(v) => { selectedTeacherId = v === null || v === '' ? null : Number(v) }"
              />
              <span
                v-if="selectedTeacherSlots"
                class="assign-student-dialog__slots"
              >
                {{ selectedTeacherSlots.available }} {{ LABELS.SLOTS_AVAILABLE }}
                {{ selectedTeacherSlots.current }}/{{ selectedTeacherSlots.capacity }} {{ LABELS.STUDENTS_COUNT }}
              </span>
            </div>
          </div>

          <!-- Current teacher -->
          <div class="assign-student-dialog__current-teacher">
            {{ LABELS.CURRENT_TEACHER }}: {{ student?.teacher ?? LABELS.NO_CURRENT_TEACHER }}
          </div>

          <p v-if="successMessage" class="assign-student-dialog__success">{{ successMessage }}</p>
          <p v-if="error" class="assign-student-dialog__error">{{ error }}</p>

          <div class="assign-student-dialog__actions">
            <button
              type="button"
              class="assign-student-dialog__btn assign-student-dialog__btn--primary"
              :disabled="submitting || selectedTeacherId == null"
              @click="handleAssign"
            >
              {{ submitting ? 'جاري التعيين...' : LABELS.ASSIGN_BTN }}
            </button>
            <button
              type="button"
              class="assign-student-dialog__btn assign-student-dialog__btn--cancel"
              @click="closeDialog"
            >
              {{ LABELS.CANCEL }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.assign-student-dialog {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-4;
  background: rgba(0, 0, 0, 0.4);
  direction: rtl;
}

.assign-student-dialog__content {
  position: relative;
  width: 100%;
  max-width: 480px;
  background: #fff;
  border-radius: $radius-xl;
  box-shadow: $shadow-lg;
  padding: $spacing-6;
}

.assign-student-dialog__close {
  position: absolute;
  top: $spacing-4;
  left: $spacing-4;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: $radius-md;
  cursor: pointer;
  color: var(--color-text-secondary);

  &:hover {
    background: var(--color-border);
    color: var(--color-text-primary);
  }
}

.assign-student-dialog__title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: var(--color-text-primary);
  margin: 0 0 $spacing-2;
  text-align: right;
}

.assign-student-dialog__subtitle {
  font-size: $font-size-base;
  color: var(--color-text-secondary);
  margin: 0 0 $spacing-5;
  text-align: right;
}

.assign-student-dialog__student {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: $spacing-4;
  margin-bottom: $spacing-5;
  flex-wrap: wrap;
}

.assign-student-dialog__student-main {
  display: flex;
  align-items: center;
  gap: $spacing-3;
}

.assign-student-dialog__avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-base;
  font-weight: $font-weight-bold;
  flex-shrink: 0;
}

.assign-student-dialog__student-info {
  display: flex;
  flex-direction: column;
  gap: $spacing-1;
}

.assign-student-dialog__student-name-row {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  flex-wrap: wrap;
}

.assign-student-dialog__student-name {
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: var(--color-text-primary);
}

.assign-student-dialog__status-badge {
  font-size: $font-size-xs;
  padding: 2px 8px;
  border-radius: $radius-full;
  font-weight: $font-weight-medium;
}

.assign-student-dialog__student-level {
  font-size: $font-size-sm;
  color: var(--color-text-secondary);
}

.assign-student-dialog__program-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-2 $spacing-4;
  background: var(--color-primary-lighter);
  border-radius: $radius-lg;
  min-width: 80px;
}

.assign-student-dialog__program-label {
  font-size: $font-size-xs;
  color: var(--color-text-secondary);
}

.assign-student-dialog__program-value {
  font-size: $font-size-sm;
  font-weight: $font-weight-bold;
  color: var(--color-primary);
}

.assign-student-dialog__field {
  margin-bottom: $spacing-4;
}

.assign-student-dialog__label {
  display: block;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: var(--color-text-primary);
  margin-bottom: $spacing-2;
  text-align: right;
}

.assign-student-dialog__select-row {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  flex-wrap: wrap;
}

.assign-student-dialog__select {
  flex: 1;
  min-width: 180px;
}

.assign-student-dialog__slots {
  font-size: $font-size-sm;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.assign-student-dialog__current-teacher {
  padding: $spacing-3 $spacing-4;
  background: rgba(227, 242, 253, 0.8);
  border-radius: $radius-lg;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: var(--color-text-primary);
  margin-bottom: $spacing-4;
  text-align: right;
}

.assign-student-dialog__success {
  padding: $spacing-3 $spacing-4;
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  border-radius: $radius-lg;
  margin: 0 0 $spacing-4;
  text-align: right;
}

.assign-student-dialog__error {
  color: var(--color-error);
  font-size: $font-size-sm;
  margin: 0 0 $spacing-4;
  text-align: right;
}

.assign-student-dialog__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: $spacing-3;
  flex-wrap: wrap;
}

.assign-student-dialog__btn {
  padding: $spacing-2 $spacing-5;
  border-radius: $radius-lg;
  font-size: $font-size-base;
  font-weight: $font-weight-bold;
  cursor: pointer;
  transition: all $transition-fast;

  &--primary {
    background: var(--color-primary);
    color: #fff;
    border: none;

    &:hover:not(:disabled) {
      filter: brightness(1.05);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &--cancel {
    background: #fff;
    color: var(--color-text-primary);
    border: 1px solid var(--color-border);

    &:hover {
      background: var(--color-border);
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

.dialog-enter-active .assign-student-dialog__content,
.dialog-leave-active .assign-student-dialog__content {
  transition: transform 0.2s ease;
}

.dialog-enter-from .assign-student-dialog__content,
.dialog-leave-to .assign-student-dialog__content {
  transform: scale(0.96);
}
</style>
