<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseDatePicker from '@/components/ui/BaseDatePicker.vue'
import { submitLeave } from '@/services/student.service'
import { ApiException } from '@/services/api'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
}>()

const fromDate = ref('')
const toDate = ref('')
const reason = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) {
      fromDate.value = ''
      toDate.value = ''
      reason.value = ''
      error.value = null
    }
  }
)

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

  if (!fromDate.value) {
    error.value = 'يرجى تحديد تاريخ البداية'
    return
  }
  if (!toDate.value) {
    error.value = 'يرجى تحديد تاريخ النهاية'
    return
  }
  if (!reason.value?.trim()) {
    error.value = 'يرجى إدخال سبب الاستئذان'
    return
  }

  const from = new Date(fromDate.value)
  const to = new Date(toDate.value)
  if (to < from) {
    error.value = 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية'
    return
  }

  loading.value = true
  try {
    await submitLeave(fromDate.value, toDate.value, reason.value.trim())
    closeDialog()
    emit('success')
  } catch (e: unknown) {
    error.value = e instanceof ApiException ? e.message : (e instanceof Error ? e.message : 'حدث خطأ أثناء إرسال الطلب')
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
        class="request-permission-dialog"
        @click="handleOverlayClick"
      >
        <div class="request-permission-dialog__content">
          <button
            type="button"
            class="request-permission-dialog__close"
            aria-label="إغلاق"
            @click="closeDialog"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <h2 class="request-permission-dialog__title">
            استئذان عن الحفظ والإرسال
          </h2>

          <form class="request-permission-dialog__form" @submit.prevent="handleSubmit">
            <div class="request-permission-dialog__field">
              <label class="request-permission-dialog__label">تاريخ البداية</label>
              <BaseDatePicker
                v-model="fromDate"
                placeholder="حدد التاريخ"
              />
            </div>

            <div class="request-permission-dialog__field">
              <label class="request-permission-dialog__label">تاريخ النهاية</label>
              <BaseDatePicker
                v-model="toDate"
                placeholder="حدد التاريخ"
              />
            </div>

            <div class="request-permission-dialog__field">
              <label class="request-permission-dialog__label">
                سبب الاستئذان (مرض امتحانات نهائية، سفر، ظرف خاص)
              </label>
              <textarea
                v-model="reason"
                class="request-permission-dialog__textarea"
                placeholder="أدخل السبب"
                rows="4"
              />
            </div>

            <p v-if="error" class="request-permission-dialog__error">{{ error }}</p>

            <div class="request-permission-dialog__actions">
         
              <button
                type="submit"
                class="request-permission-dialog__btn request-permission-dialog__btn--submit"
                :disabled="loading"
              >
                <span v-if="loading">جاري الإرسال...</span>
                <span v-else>ارسال</span>
              </button>

                   <button
                type="button"
                class="request-permission-dialog__btn request-permission-dialog__btn--cancel"
                @click="closeDialog"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.request-permission-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
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
    padding: $spacing-4;
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
    margin: 0 0 $spacing-6 0;

    @include sm-max {
      font-size: $font-size-lg;
      margin-bottom: $spacing-4;
      padding-left: $spacing-10;
    }
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: $spacing-5;
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

  &__textarea {
    width: 100%;
    min-height: 100px;
    padding: $spacing-3 $spacing-4;
    border: 1px solid var(--color-border);
    border-radius: $radius-lg;
    font-family: var(--font-family);
    font-size: $font-size-base;
    color: var(--color-text-primary);
    background-color: var(--color-background-input);
    resize: vertical;
    transition: all $transition-fast;

    &::placeholder {
      color: var(--color-text-muted);
    }

    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba($color-primary, 0.1);
    }
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

.dialog-enter-active .request-permission-dialog__content,
.dialog-leave-active .request-permission-dialog__content {
  transition: transform $transition-normal;
}

.dialog-enter-from .request-permission-dialog__content,
.dialog-leave-to .request-permission-dialog__content {
  transform: scale(0.95);
}
</style>
