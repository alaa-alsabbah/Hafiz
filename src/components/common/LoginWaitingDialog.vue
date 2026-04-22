<script setup lang="ts">
interface Props {
  modelValue: boolean
  message: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function close() {
  emit('update:modelValue', false)
}

function handleOverlayClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    close()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="login-waiting-dialog">
      <div
        v-if="modelValue"
        class="login-waiting-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-waiting-dialog-message"
        @click="handleOverlayClick"
      >
        <div class="login-waiting-dialog__panel">
          <div class="login-waiting-dialog__icon-wrap" aria-hidden="true">
            <div class="login-waiting-dialog__ring" />
            <div class="login-waiting-dialog__icon">
              <svg
                class="login-waiting-dialog__svg"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 8v4l2.5 2.5M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>

          <p id="login-waiting-dialog-message" class="login-waiting-dialog__message">
            {{ props.message }}
          </p>

          <button type="button" class="login-waiting-dialog__btn" @click="close">
            حسناً
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.login-waiting-dialog {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-4;
  direction: rtl;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(6px);

  &__panel {
    position: relative;
    width: 100%;
    max-width: 420px;
    padding: $spacing-8 $spacing-6 $spacing-6;
    border-radius: $radius-xl;
    background: linear-gradient(
      145deg,
      var(--color-background, #fff) 0%,
      rgba(255, 255, 255, 0.96) 100%
    );
    box-shadow:
      0 25px 50px -12px rgba(0, 0, 0, 0.22),
      0 0 0 1px rgba(255, 255, 255, 0.08) inset;
    text-align: center;
  }

  &__icon-wrap {
    position: relative;
    width: 88px;
    height: 88px;
    margin: 0 auto $spacing-6;
  }

  &__ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: conic-gradient(
      from 0deg,
      var(--color-primary),
      rgba($color-primary, 0.25),
      var(--color-primary)
    );
    animation: login-waiting-spin 2.8s linear infinite;
    mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px));
    -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px));
  }

  &__icon {
    position: absolute;
    inset: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: linear-gradient(
      160deg,
      rgba($color-primary, 0.14) 0%,
      rgba($color-primary, 0.06) 100%
    );
    color: var(--color-primary);
    animation: login-waiting-icon-float 2.2s ease-in-out infinite;
  }

  &__svg {
    width: 40px;
    height: 40px;
  }

  &__message {
    margin: 0 0 $spacing-7;
    font-size: $font-size-lg;
    font-weight: $font-weight-medium;
    line-height: 1.7;
    color: var(--color-text-primary);
  }

  &__btn {
    width: 100%;
    padding: $spacing-3 $spacing-6;
    border: none;
    border-radius: $radius-lg;
    font-family: var(--font-family);
    font-size: $font-size-base;
    font-weight: $font-weight-bold;
    cursor: pointer;
    color: #fff;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
    box-shadow: 0 10px 24px -8px rgba($color-primary, 0.55);
    transition:
      transform $transition-fast,
      box-shadow $transition-fast;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 14px 28px -8px rgba($color-primary, 0.5);
    }

    &:active {
      transform: translateY(0);
    }
  }
}

.login-waiting-dialog-enter-active,
.login-waiting-dialog-leave-active {
  transition: opacity 0.28s ease;
}

.login-waiting-dialog-enter-active .login-waiting-dialog__panel,
.login-waiting-dialog-leave-active .login-waiting-dialog__panel {
  transition:
    transform 0.32s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.28s ease;
}

.login-waiting-dialog-enter-from,
.login-waiting-dialog-leave-to {
  opacity: 0;
}

.login-waiting-dialog-enter-from .login-waiting-dialog__panel,
.login-waiting-dialog-leave-to .login-waiting-dialog__panel {
  opacity: 0;
  transform: scale(0.92) translateY(12px);
}

@keyframes login-waiting-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes login-waiting-icon-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
</style>
