<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { updateAdminStudentAlerts } from '@/services/admin.service'
import { ADMIN_STUDENTS_PAGE } from '@/config/admin.constants'

export interface AlertsStudentPayload {
  id: number
  full_name: string
  warnings_count: number | null
}

interface Props {
  modelValue: boolean
  student: AlertsStudentPayload | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
}>()

const LABELS = ADMIN_STUDENTS_PAGE.ALERTS_DIALOG

const warningsCount = ref(0)
const submitting = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const canDecrement = computed(() => warningsCount.value > 0)

watch(
  () => props.modelValue,
  (open) => {
    if (!open) {
      warningsCount.value = 0
      error.value = null
      successMessage.value = null
      return
    }
    warningsCount.value = Math.max(0, props.student?.warnings_count ?? 0)
    error.value = null
    successMessage.value = null
  }
)

function clampCount(value: number): number {
  if (Number.isNaN(value) || value < 0) return 0
  return Math.floor(value)
}

function increment() {
  warningsCount.value += 1
  error.value = null
}

function decrement() {
  if (warningsCount.value <= 0) return
  warningsCount.value -= 1
  error.value = null
}

function onInputChange(event: Event) {
  const raw = (event.target as HTMLInputElement).value
  if (raw.trim() === '') {
    warningsCount.value = 0
    return
  }
  warningsCount.value = clampCount(Number(raw))
}

function onInputBlur(event: Event) {
  const input = event.target as HTMLInputElement
  warningsCount.value = clampCount(Number(input.value))
  input.value = String(warningsCount.value)
}

function closeDialog() {
  emit('update:modelValue', false)
}

function handleOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) closeDialog()
}

async function handleSave() {
  if (!props.student) return

  const count = clampCount(warningsCount.value)
  warningsCount.value = count

  error.value = null
  successMessage.value = null
  submitting.value = true
  try {
    const res = await updateAdminStudentAlerts(props.student.id, count)
    if (res.success) {
      successMessage.value = res.message ?? 'تم تحديث التنبيهات بنجاح'
      setTimeout(() => {
        closeDialog()
        emit('success')
      }, 1800)
    } else {
      error.value = res.message ?? 'فشل تحديث التنبيهات'
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'حدث خطأ أثناء التحديث'
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
        class="alerts-student-dialog"
        @click="handleOverlayClick"
      >
        <div class="alerts-student-dialog__content">
          <button
            type="button"
            class="alerts-student-dialog__close"
            aria-label="إغلاق"
            @click="closeDialog"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <h2 class="alerts-student-dialog__title">{{ LABELS.TITLE }}</h2>
          <p class="alerts-student-dialog__subtitle">
            {{ LABELS.SUBTITLE }}
            <template v-if="student">{{ student.full_name }}</template>
            {{ LABELS.SUBTITLE_SUFFIX }}
          </p>

          <div class="alerts-student-dialog__field">
            <label class="alerts-student-dialog__label">{{ LABELS.WARNINGS_COUNT }}</label>
            <div class="alerts-student-dialog__stepper">
              <button
                type="button"
                class="alerts-student-dialog__stepper-btn"
                :disabled="!canDecrement"
                aria-label="تقليل"
                @click="decrement"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>

              <input
                :value="warningsCount"
                type="number"
                min="0"
                step="1"
                inputmode="numeric"
                class="alerts-student-dialog__stepper-input"
                @input="onInputChange"
                @blur="onInputBlur"
              />

              <button
                type="button"
                class="alerts-student-dialog__stepper-btn alerts-student-dialog__stepper-btn--plus"
                aria-label="زيادة"
                @click="increment"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
            <p class="alerts-student-dialog__hint">الحد الأدنى 0 — لا يمكن إدخال قيم سالبة</p>
          </div>

          <p v-if="successMessage" class="alerts-student-dialog__success">{{ successMessage }}</p>
          <p v-if="error" class="alerts-student-dialog__error">{{ error }}</p>

          <div class="alerts-student-dialog__actions">
            <button
              type="button"
              class="alerts-student-dialog__btn alerts-student-dialog__btn--primary"
              :disabled="submitting"
              @click="handleSave"
            >
              {{ submitting ? 'جاري الحفظ...' : LABELS.SAVE_BTN }}
            </button>
            <button
              type="button"
              class="alerts-student-dialog__btn alerts-student-dialog__btn--cancel"
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
.alerts-student-dialog {
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

.alerts-student-dialog__content {
  position: relative;
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: $radius-xl;
  box-shadow: $shadow-lg;
  padding: $spacing-6;
}

.alerts-student-dialog__close {
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

.alerts-student-dialog__title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: var(--color-text-primary);
  margin: 0 0 $spacing-2;
  text-align: right;
}

.alerts-student-dialog__subtitle {
  font-size: $font-size-base;
  color: var(--color-text-secondary);
  margin: 0 0 $spacing-5;
  text-align: right;
}

.alerts-student-dialog__field {
  margin-bottom: $spacing-4;
}

.alerts-student-dialog__label {
  display: block;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: var(--color-text-primary);
  margin-bottom: $spacing-3;
  text-align: right;
}

.alerts-student-dialog__stepper {
  display: flex;
  align-items: stretch;
  border: 1px solid var(--color-border);
  border-radius: $radius-xl;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.alerts-student-dialog__stepper-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  flex-shrink: 0;
  border: none;
  background: #f9fafb;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background-color $transition-fast, color $transition-fast;

  &:hover:not(:disabled) {
    background: var(--color-primary-lighter);
    color: var(--color-primary);
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  &--plus {
    background: var(--color-primary-lighter, rgba(16, 185, 129, 0.1));
    color: var(--color-primary);

    &:hover {
      background: var(--color-primary);
      color: #fff;
    }
  }
}

.alerts-student-dialog__stepper-input {
  flex: 1;
  min-width: 0;
  border: none;
  border-right: 1px solid var(--color-border);
  border-left: 1px solid var(--color-border);
  background: #fff;
  text-align: center;
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: var(--color-text-primary);
  font-family: inherit;
  padding: $spacing-3;
  appearance: textfield;
  -moz-appearance: textfield;

  &:focus {
    outline: none;
    background: #fafafa;
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}

.alerts-student-dialog__hint {
  margin: $spacing-2 0 0;
  font-size: $font-size-xs;
  color: var(--color-text-muted);
  text-align: right;
}

.alerts-student-dialog__success {
  padding: $spacing-3 $spacing-4;
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  border-radius: $radius-lg;
  margin: 0 0 $spacing-4;
  text-align: right;
}

.alerts-student-dialog__error {
  color: var(--color-error);
  font-size: $font-size-sm;
  margin: 0 0 $spacing-4;
  text-align: right;
}

.alerts-student-dialog__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: $spacing-3;
  flex-wrap: wrap;
}

.alerts-student-dialog__btn {
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

.dialog-enter-active .alerts-student-dialog__content,
.dialog-leave-active .alerts-student-dialog__content {
  transition: transform 0.2s ease;
}

.dialog-enter-from .alerts-student-dialog__content,
.dialog-leave-to .alerts-student-dialog__content {
  transform: scale(0.96);
}
</style>
