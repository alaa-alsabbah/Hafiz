<script setup lang="ts">
import { computed } from 'vue'

interface Option {
  id: number | string
  value: string | number
  label: string
  disabled?: boolean
}

interface Props {
  modelValue: string | number | null
  label?: string
  placeholder?: string
  options: Option[]
  error?: string
  required?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'اختر...',
  required: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
}>()

const selectedOption = computed(() => {
  return props.options.find((opt) => opt.value === props.modelValue)
})

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const value = target.value === '' ? null : target.value
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="base-select">
    <label v-if="label" class="base-select__label">
      {{ label }}
      <span v-if="required" class="base-select__required">*</span>
    </label>

    <div class="base-select__wrapper">
      <select
        :value="modelValue ?? ''"
        :class="[
          'base-select__field',
          { 'base-select__field--error': error },
          { 'base-select__field--disabled': disabled },
        ]"
        :disabled="disabled"
        @change="handleChange"
      >
        <option value="" disabled>{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="option.id"
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </option>
      </select>

      <div class="base-select__icon">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>

    <span v-if="error" class="base-select__error">{{ error }}</span>
  </div>
</template>

<style lang="scss" scoped>
.base-select {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;

  &__label {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: var(--color-text-primary);
    display: flex;
    align-items: center;
    gap: $spacing-1;
  }

  &__required {
    color: var(--color-error);
  }

  &__wrapper {
    position: relative;
  }

  &__field {
    width: 100%;
    height: var(--input-height);
    padding: $spacing-3 $spacing-10 $spacing-3 $spacing-4;
    border: 1px solid var(--color-border);
    border-radius: $radius-md;
    background-color: var(--color-background-input);
    color: var(--color-text-primary);
    font-size: $font-size-base;
    font-family: inherit;
    cursor: pointer;
    appearance: none;
    transition: all $transition-fast;

    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-lighter);
    }

    &:disabled {
      background-color: var(--color-background);
      cursor: not-allowed;
      opacity: 0.6;
    }

    &--error {
      border-color: var(--color-error);
    }
  }

  &__icon {
    position: absolute;
    left: $spacing-3;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: var(--color-text-muted);
  }

  &__error {
    font-size: $font-size-sm;
    color: var(--color-error);
  }
}
</style>
