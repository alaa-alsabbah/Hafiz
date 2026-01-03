<script setup lang="ts">
import { computed } from 'vue'
import type { ButtonVariant, ButtonSize } from '@/types'

interface Props {
  type?: 'button' | 'submit' | 'reset'
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  disabled?: boolean
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  block: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const isDisabled = computed(() => props.disabled || props.loading)

const buttonClasses = computed(() => ({
  'base-button': true,
  [`base-button--${props.variant}`]: true,
  [`base-button--${props.size}`]: true,
  'base-button--block': props.block,
  'base-button--loading': props.loading
}))

function handleClick(event: MouseEvent) {
  if (!isDisabled.value) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="isDisabled"
    @click="handleClick"
  >
    <span v-if="loading" class="base-button__spinner">
      <svg class="base-button__spinner-icon" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="31.4 31.4" />
      </svg>
    </span>
    
    <span v-if="$slots.icon && !loading" class="base-button__icon">
      <slot name="icon" />
    </span>
    
    <span v-if="$slots.default" class="base-button__text">
      <slot />
    </span>
    
    <span v-if="$slots.trailing && !loading" class="base-button__trailing">
      <slot name="trailing" />
    </span>
  </button>
</template>

<style lang="scss" scoped>
.base-button {
  @include button-base;
  
  &--sm {
    height: $button-height-sm;
    padding: 0 $spacing-4;
    font-size: $font-size-sm;
    border-radius: $radius-md;
  }
  
  &--md {
    height: $button-height;
    padding: 0 $spacing-6;
    font-size: $font-size-base;
  }
  
  &--lg {
    height: $button-height-lg;
    padding: 0 $spacing-8;
    font-size: $font-size-lg;
  }
  
  &--primary {
    background-color: var(--color-primary);
    color: var(--color-text-inverse);
    
    &:hover:not(:disabled) {
      background-color: var(--color-primary-dark);
    }
    
    &:active:not(:disabled) {
      transform: translateY(1px);
    }
  }
  
  &--secondary {
    background-color: var(--color-secondary);
    color: var(--color-text-inverse);
  }
  
  &--outline {
    background-color: transparent;
    color: var(--color-primary);
    border: 2px solid var(--color-primary);
    
    &:hover:not(:disabled) {
      background-color: var(--color-primary-lighter);
    }
  }
  
  &--ghost {
    background-color: transparent;
    color: var(--color-text-secondary);
    
    &:hover:not(:disabled) {
      background-color: var(--color-background);
      color: var(--color-text-primary);
    }
  }
  
  &--danger {
    background-color: var(--color-error);
    color: var(--color-text-inverse);
    
    &:hover:not(:disabled) {
      background-color: #b91c1c;
    }
  }
  
  &--link {
    background-color: transparent;
    color: var(--color-primary);
    padding: 0;
    height: auto;
    
    &:hover:not(:disabled) {
      text-decoration: underline;
    }
  }
  
  &--block {
    width: 100%;
  }
  
  &--loading {
    position: relative;
    color: transparent !important;
    
    .base-button__spinner {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .base-button__spinner-icon {
      width: 20px;
      height: 20px;
      animation: spin 1s linear infinite;
      color: var(--color-text-inverse);
    }
  }
  
  &--outline.base-button--loading .base-button__spinner-icon,
  &--ghost.base-button--loading .base-button__spinner-icon,
  &--link.base-button--loading .base-button__spinner-icon {
    color: var(--color-primary);
  }
  
  &__icon,
  &__trailing {
    display: flex;
    align-items: center;
    
    svg {
      width: 20px;
      height: 20px;
    }
  }
  
  &__text {
    display: flex;
    align-items: center;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
