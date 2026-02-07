<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import {
  createPresentationTest,
  type CreatePresentationTestRequest,
} from '@/services/teacher.service'
import { ApiException } from '@/services/api'
import { ADD_PRESENTATION_TEST_LABELS } from '@/config/teacher.constants'

interface Props {
  modelValue: boolean
  studentId: number | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
}>()

const scorePresentation = ref('')
const scoreTests = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) {
      resetForm()
    }
  }
)

function resetForm() {
  scorePresentation.value = ''
  scoreTests.value = ''
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

function validateScore(value: string, _fieldName: string): number | null {
  if (value === '' || value === null || value === undefined) {
    return null
  }
  const num = parseFloat(value)
  if (Number.isNaN(num) || num < 0 || num > 50) {
    return NaN
  }
  return num
}

async function handleSubmit() {
  error.value = null

  const presentationNum = validateScore(scorePresentation.value, 'presentation')
  const testsNum = validateScore(scoreTests.value, 'tests')

  if (scorePresentation.value === '') {
    error.value = ADD_PRESENTATION_TEST_LABELS.ERRORS.SCORE_PRESENTATION_REQUIRED
    return
  }
  if (scoreTests.value === '') {
    error.value = ADD_PRESENTATION_TEST_LABELS.ERRORS.SCORE_TEST_REQUIRED
    return
  }
  if (presentationNum === null || Number.isNaN(presentationNum!) || presentationNum! < 0 || presentationNum! > 50) {
    error.value = ADD_PRESENTATION_TEST_LABELS.ERRORS.SCORE_RANGE
    return
  }
  if (testsNum === null || Number.isNaN(testsNum!) || testsNum! < 0 || testsNum! > 50) {
    error.value = ADD_PRESENTATION_TEST_LABELS.ERRORS.SCORE_RANGE
    return
  }

  if (!props.studentId) return

  const payload: CreatePresentationTestRequest = {
    score_presentation: presentationNum!,
    score_tests: testsNum!,
  }

  loading.value = true
  try {
    await createPresentationTest(props.studentId, payload)
    closeDialog()
    emit('success')
  } catch (e: unknown) {
    error.value =
      e instanceof ApiException
        ? e.message
        : e instanceof Error
          ? e.message
          : 'حدث خطأ أثناء الحفظ'
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
        class="add-presentation-test-dialog"
        @click="handleOverlayClick"
      >
        <div class="add-presentation-test-dialog__content">
          <button
            type="button"
            class="add-presentation-test-dialog__close"
            aria-label="إغلاق"
            @click="closeDialog"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <h2 class="add-presentation-test-dialog__title">
            {{ ADD_PRESENTATION_TEST_LABELS.TITLE }}
          </h2>

          <form
            class="add-presentation-test-dialog__form"
            @submit.prevent="handleSubmit"
          >
            <div class="add-presentation-test-dialog__field">
              <label class="add-presentation-test-dialog__label">
                {{ ADD_PRESENTATION_TEST_LABELS.SCORE_PRESENTATION }}
              </label>
              <BaseInput
                v-model="scorePresentation"
                type="number"
                min="0"
                max="50"
                step="0.01"
                :placeholder="ADD_PRESENTATION_TEST_LABELS.PLACEHOLDERS.SCORE_PRESENTATION"
              />
            </div>

            <div class="add-presentation-test-dialog__field">
              <label class="add-presentation-test-dialog__label">
                {{ ADD_PRESENTATION_TEST_LABELS.SCORE_TEST }}
              </label>
              <BaseInput
                v-model="scoreTests"
                type="number"
                min="0"
                max="50"
                step="0.01"
                :placeholder="ADD_PRESENTATION_TEST_LABELS.PLACEHOLDERS.SCORE_TEST"
              />
            </div>

            <p v-if="error" class="add-presentation-test-dialog__error">
              {{ error }}
            </p>

            <div class="add-presentation-test-dialog__actions">
              <button
                type="submit"
                class="add-presentation-test-dialog__btn add-presentation-test-dialog__btn--submit"
                :disabled="loading"
              >
                <span v-if="loading">{{
                  ADD_PRESENTATION_TEST_LABELS.SUBMITTING
                }}</span>
                <span v-else>{{ ADD_PRESENTATION_TEST_LABELS.SUBMIT }}</span>
              </button>
              <button
                type="button"
                class="add-presentation-test-dialog__btn add-presentation-test-dialog__btn--cancel"
                @click="closeDialog"
              >
                {{ ADD_PRESENTATION_TEST_LABELS.CANCEL }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.add-presentation-test-dialog {
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

.dialog-enter-active .add-presentation-test-dialog__content,
.dialog-leave-active .add-presentation-test-dialog__content {
  transition: transform $transition-normal;
}

.dialog-enter-from .add-presentation-test-dialog__content,
.dialog-leave-to .add-presentation-test-dialog__content {
  transform: scale(0.95);
}
</style>
