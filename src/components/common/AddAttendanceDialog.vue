<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseDatePicker from '@/components/ui/BaseDatePicker.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import { createAttendance, type CreateAttendanceRequest } from '@/services/teacher.service'
import { getLookup } from '@/services/lookups.service'
import { LOOKUP_GROUPS } from '@/services/lookups.service'
import type { LookupItem } from '@/services/lookups.service'
import { ApiException } from '@/services/api'
import { ADD_ATTENDANCE_LABELS } from '@/config/teacher.constants'
import { AttendanceStatus } from '@/config/teacher.constants'

interface Props {
  modelValue: boolean
  studentId: number | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
}>()

const date = ref('')
const session = ref<string | null>(null)
const statusId = ref<number | null>(null)
const pageNumber = ref<string>('')
const score = ref<string>('')
const loading = ref(false)
const error = ref<string | null>(null)

const sessionOptions = [
  { id: 'weekly', value: ADD_ATTENDANCE_LABELS.SESSION_OPTIONS.WEEKLY, label: ADD_ATTENDANCE_LABELS.SESSION_OPTIONS.WEEKLY },
  { id: 'test', value: ADD_ATTENDANCE_LABELS.SESSION_OPTIONS.PRESENTATION_TEST, label: ADD_ATTENDANCE_LABELS.SESSION_OPTIONS.PRESENTATION_TEST },
]

// Fallback status options when lookup fails (id may need to match API)
const fallbackStatusOptions = [
  { id: 1, value: 1, label: AttendanceStatus.PRESENT },
  { id: 2, value: 2, label: AttendanceStatus.ABSENT },
  { id: 3, value: 3, label: AttendanceStatus.DELAYED },
  { id: 4, value: 4, label: AttendanceStatus.PERMISSION },
  { id: 5, value: 5, label: AttendanceStatus.WAITING },
]

const statusOptions = ref<{ id: number; value: number; label: string }[]>(fallbackStatusOptions)
const statusOptionsLoading = ref(false)

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (!isOpen) {
      resetForm()
    } else {
      statusOptionsLoading.value = true
      try {
        const items = await getLookup(LOOKUP_GROUPS.ATTENDANCE_STATUS as any)
        statusOptions.value = items.map((item: LookupItem) => ({
          id: item.id,
          value: item.id,
          label: item.value_ar || item.value_en || String(item.id),
        }))
      } catch {
        statusOptions.value = fallbackStatusOptions
      } finally {
        statusOptionsLoading.value = false
      }
    }
  }
)

function resetForm() {
  date.value = ''
  session.value = null
  statusId.value = null
  pageNumber.value = ''
  score.value = ''
  error.value = null
}

function closeDialog() {
  emit('update:modelValue', false)
}

function handleOverlayClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    closeDialog()
  }
}

async function handleSubmit() {
  error.value = null

  if (!date.value) {
    error.value = ADD_ATTENDANCE_LABELS.ERRORS.DATE_REQUIRED
    return
  }
  if (!session.value) {
    error.value = ADD_ATTENDANCE_LABELS.ERRORS.SESSION_REQUIRED
    return
  }
  if (statusId.value === null || statusId.value === undefined) {
    error.value = ADD_ATTENDANCE_LABELS.ERRORS.STATUS_REQUIRED
    return
  }

  const scoreNum = score.value === '' ? 0 : parseFloat(score.value)
  if (Number.isNaN(scoreNum) || scoreNum < 0 || scoreNum > 5) {
    error.value = ADD_ATTENDANCE_LABELS.ERRORS.SCORE_RANGE
    return
  }

  const pageNum = pageNumber.value === '' ? null : parseInt(pageNumber.value, 10)
  const pageNumValue = (pageNumber.value === '' || Number.isNaN(pageNum)) ? null : pageNum

  if (!props.studentId) return

  const payload: CreateAttendanceRequest = {
    date: date.value,
    session: session.value,
    status_id: statusId.value,
    page_number: pageNumValue,
    score: scoreNum,
  }

  loading.value = true
  try {
    await createAttendance(props.studentId, payload)
    closeDialog()
    emit('success')
  } catch (e: unknown) {
    error.value = e instanceof ApiException ? e.message : (e instanceof Error ? e.message : 'حدث خطأ أثناء الحفظ')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="modelValue"
        class="add-attendance-dialog"
        @click="handleOverlayClick"
      >
        <div class="add-attendance-dialog__content">
          <button
            type="button"
            class="add-attendance-dialog__close"
            aria-label="إغلاق"
            @click="closeDialog"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <h2 class="add-attendance-dialog__title">
            {{ ADD_ATTENDANCE_LABELS.TITLE }}
          </h2>

          <form class="add-attendance-dialog__form" @submit.prevent="handleSubmit">
            <div class="add-attendance-dialog__field">
              <label class="add-attendance-dialog__label">{{ ADD_ATTENDANCE_LABELS.DATE }}</label>
              <BaseDatePicker
                v-model="date"
                :placeholder="ADD_ATTENDANCE_LABELS.PLACEHOLDERS.DATE"
              />
            </div>

            <div class="add-attendance-dialog__field">
              <label class="add-attendance-dialog__label">{{ ADD_ATTENDANCE_LABELS.SESSION }}</label>
              <BaseSelect
                v-model="session"
                :options="sessionOptions"
                :placeholder="ADD_ATTENDANCE_LABELS.PLACEHOLDERS.SESSION"
              />
            </div>

            <div class="add-attendance-dialog__field">
              <label class="add-attendance-dialog__label">{{ ADD_ATTENDANCE_LABELS.STATUS }}</label>
              <BaseSelect
                :model-value="statusId"
                :options="statusOptions"
                :placeholder="ADD_ATTENDANCE_LABELS.PLACEHOLDERS.STATUS"
                :disabled="statusOptionsLoading"
                @update:model-value="(v) => statusId = v === null || v === '' ? null : Number(v)"
              />
            </div>

            <div class="add-attendance-dialog__field">
              <label class="add-attendance-dialog__label">{{ ADD_ATTENDANCE_LABELS.PAGE_NUMBER }}</label>
              <BaseInput
                v-model="pageNumber"
                type="number"
                min="0"
                :placeholder="ADD_ATTENDANCE_LABELS.PLACEHOLDERS.PAGE_NUMBER"
              />
            </div>

            <div class="add-attendance-dialog__field">
              <label class="add-attendance-dialog__label">{{ ADD_ATTENDANCE_LABELS.SCORE }}</label>
              <BaseInput
                v-model="score"
                type="number"
                min="0"
                max="5"
                step="0.1"
                :placeholder="ADD_ATTENDANCE_LABELS.PLACEHOLDERS.SCORE"
              />
            </div>

            <p v-if="error" class="add-attendance-dialog__error">{{ error }}</p>

            <div class="add-attendance-dialog__actions">
              <button
                type="submit"
                class="add-attendance-dialog__btn add-attendance-dialog__btn--submit"
                :disabled="loading"
              >
                <span v-if="loading">{{ ADD_ATTENDANCE_LABELS.SUBMITTING }}</span>
                <span v-else>{{ ADD_ATTENDANCE_LABELS.SUBMIT }}</span>
              </button>
              <button
                type="button"
                class="add-attendance-dialog__btn add-attendance-dialog__btn--cancel"
                @click="closeDialog"
              >
                {{ ADD_ATTENDANCE_LABELS.CANCEL }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.add-attendance-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: $spacing-4;
  direction: rtl;
  overflow-y: auto;

  @include sm-max {
    padding: $spacing-3;
    align-items: flex-start;
    padding-top: $spacing-6;
    padding-bottom: $spacing-6;
  }

  &__content {
    position: relative;
    background: #fff;
    border-radius: $radius-xl;
    padding: $spacing-6;
    max-width: 480px;
    width: 100%;
    box-shadow: $shadow-lg;

    @include sm-max {
      padding: $spacing-4 $spacing-3;
      border-radius: $radius-lg;
      margin: auto $spacing-2;
    }
  }

  &__close {
    position: absolute;
    top: $spacing-4;
    left: $spacing-4;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    background-color: var(--color-primary);
    color: #fff;
    cursor: pointer;
    transition: all $transition-fast;

    &:hover {
      background-color: var(--color-primary-dark);
    }

    svg {
      width: 16px;
      height: 16px;
    }
  }

  &__title {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
    margin: 0 0 $spacing-5 0;

    @include sm-max {
      font-size: $font-size-lg;
      margin-bottom: $spacing-4;
      padding-left: $spacing-10;
    }
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: $spacing-4;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: $spacing-2;
  }

  &__label {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: var(--color-text-primary);
  }

  &__error {
    font-size: $font-size-sm;
    color: var(--color-error);
    margin: 0;
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: $spacing-3;
    margin-top: $spacing-2;

    @include sm-max {
      flex-direction: column;
      width: 100%;
    }
  }

  &__btn {
    padding: $spacing-3 $spacing-6;
    border-radius: $radius-lg;

    @include sm-max {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    font-size: $font-size-base;
    font-weight: $font-weight-bold;
    cursor: pointer;
    transition: all $transition-fast;
    border: none;

    &--cancel {
      background: #fff;
      border: 1px solid var(--color-primary);
      color: var(--color-primary);

      &:hover {
        background-color: var(--color-primary-lighter);
      }
    }

    &--submit {
      background-color: var(--color-primary);
      color: #fff;

      &:hover:not(:disabled) {
        background-color: var(--color-primary-dark);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }
}

.dialog-enter-active,
.dialog-leave-active {
  transition: opacity $transition-normal;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-active .add-attendance-dialog__content,
.dialog-leave-active .add-attendance-dialog__content {
  transition: transform $transition-normal;
}

.dialog-enter-from .add-attendance-dialog__content,
.dialog-leave-to .add-attendance-dialog__content {
  transform: scale(0.95);
}
</style>
