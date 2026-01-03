<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: boolean
  label?: string
  disabled?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  label: '',
  disabled: false,
  id: () => `checkbox-${Math.random().toString(36).substr(2, 9)}`
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  change: [value: boolean]
}>()

const isChecked = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit('update:modelValue', value)
    emit('change', value)
  }
})

const checkboxClasses = computed(() => ({
  'base-checkbox': true,
  'base-checkbox--disabled': props.disabled,
  'base-checkbox--checked': isChecked.value
}))
</script>

<template>
  <label :class="checkboxClasses" :for="id">
    <input
      :id="id"
      v-model="isChecked"
      type="checkbox"
      class="base-checkbox__input"
      :disabled="disabled"
    />
    
    <span class="base-checkbox__box">
      <svg class="base-checkbox__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
    
    <span v-if="label || $slots.default" class="base-checkbox__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<style lang="scss" scoped>
.base-checkbox {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  cursor: pointer;
  user-select: none;
  
  &__input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  &__box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border: 2px solid var(--color-border);
    border-radius: $radius-sm;
    background-color: var(--color-background-input);
    transition: all $transition-fast;
    flex-shrink: 0;
  }
  
  &__check {
    width: 14px;
    height: 14px;
    opacity: 0;
    transform: scale(0.5);
    transition: all $transition-fast;
    color: var(--color-text-inverse);
  }
  
  &__label {
    font-size: $font-size-sm;
    color: var(--color-text-secondary);
    transition: color $transition-fast;
  }
  
  &:hover:not(&--disabled) {
    .base-checkbox__box {
      border-color: var(--color-primary);
    }
    
    .base-checkbox__label {
      color: var(--color-text-primary);
    }
  }
  
  &--checked {
    .base-checkbox__box {
      background-color: var(--color-primary);
      border-color: var(--color-primary);
    }
    
    .base-checkbox__check {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  &__input:focus-visible + .base-checkbox__box {
    box-shadow: 0 0 0 3px rgba($color-primary, 0.2);
  }
  
  &--disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
}
</style>
