<script setup lang="ts">
import { useRouter } from 'vue-router'
import { BaseButton } from '@/components/ui'
import { IconUser, IconGraduationCap } from '@/components/icons'
import AppLogo from '@/components/common/AppLogo.vue'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const router = useRouter()

function closeDialog() {
  emit('update:modelValue', false)
}

function selectType(type: 'student' | 'teacher') {
  router.push({ name: 'register', query: { type } })
  closeDialog()
}

function handleOverlayClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    closeDialog()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="modelValue"
        class="registration-dialog"
        @click="handleOverlayClick"
      >
        <div class="registration-dialog__content">
          <div class="registration-dialog__header">
            <AppLogo size="md" />
            <h2 class="registration-dialog__title">اختر نوع التسجيل</h2>
            <p class="registration-dialog__subtitle">
              اختر نوع الحساب الذي تريد إنشاءه
            </p>
          </div>

          <div class="registration-dialog__options">
            <button
              class="registration-dialog__option"
              @click="selectType('student')"
            >
              <div class="registration-dialog__option-icon">
                <IconGraduationCap />
              </div>
              <h3 class="registration-dialog__option-title">طالب</h3>
              <p class="registration-dialog__option-description">
                سجل كطالب للانضمام إلى برامج حفظ وتلاوة القرآن الكريم
              </p>
            </button>

            <button
              class="registration-dialog__option"
              @click="selectType('teacher')"
            >
              <div class="registration-dialog__option-icon">
                <IconUser />
              </div>
              <h3 class="registration-dialog__option-title">معلم</h3>
              <p class="registration-dialog__option-description">
                سجل كمعلم لتقديم الإرشاد والدعم للطلاب
              </p>
            </button>
          </div>

          <BaseButton
            variant="outline"
            size="lg"
            block
            @click="closeDialog"
          >
            إلغاء
          </BaseButton>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.registration-dialog {
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

  &__content {
    background: #fff;
    border-radius: $radius-2xl;
    padding: $spacing-8;
    max-width: 600px;
    width: 100%;
    box-shadow: $shadow-lg;
    animation: slideUp 0.3s ease-out;
  }

  &__header {
    text-align: center;
    margin-bottom: $spacing-8;
  }

  &__title {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
    margin: $spacing-4 0 $spacing-2;
  }

  &__subtitle {
    font-size: $font-size-base;
    color: var(--color-text-secondary);
  }

  &__options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-4;
    margin-bottom: $spacing-6;

    @include sm-max {
      grid-template-columns: 1fr;
    }
  }

  &__option {
    border: 2px solid var(--color-border);
    border-radius: $radius-xl;
    padding: $spacing-6;
    background: transparent;
    cursor: pointer;
    transition: all $transition-fast;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-3;

    &:hover {
      border-color: var(--color-primary);
      background-color: var(--color-primary-lighter);
      transform: translateY(-2px);
      box-shadow: $shadow-md;
    }
  }

  &__option-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: var(--color-primary-lighter);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-primary);

    :deep(svg) {
      width: 32px;
      height: 32px;
    }
  }

  &__option-title {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
    margin: 0;
  }

  &__option-description {
    font-size: $font-size-sm;
    color: var(--color-text-secondary);
    line-height: 1.6;
    margin: 0;
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

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
