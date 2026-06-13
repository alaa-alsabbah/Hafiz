<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

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

const isOpen = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)

const selectedLabel = computed(() => {
  if (props.modelValue == null || props.modelValue === '') return ''
  const opt = props.options.find(
    (o) => o.value === props.modelValue || String(o.value) === String(props.modelValue)
  )
  return opt?.label ?? ''
})

const hasValue = computed(() => props.modelValue != null && props.modelValue !== '')

function isSelected(option: Option): boolean {
  return (
    option.value === props.modelValue ||
    String(option.value) === String(props.modelValue)
  )
}

function toggle() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

function selectOption(option: Option) {
  if (option.disabled) return
  emit('update:modelValue', option.value)
  close()
}

function handleClickOutside(event: MouseEvent) {
  if (!wrapperRef.value?.contains(event.target as Node)) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true)
})
</script>

<template>
  <div ref="wrapperRef" class="base-select">
    <label v-if="label" class="base-select__label">
      {{ label }}
      <span v-if="required" class="base-select__required">*</span>
    </label>

    <div class="base-select__wrapper">
      <button
        type="button"
        class="base-select__trigger"
        :class="{
          'base-select__trigger--open': isOpen,
          'base-select__trigger--error': error,
          'base-select__trigger--disabled': disabled,
          'base-select__trigger--placeholder': !hasValue,
        }"
        :disabled="disabled"
        @click.stop="toggle"
      >
        <span class="base-select__value">
          {{ hasValue ? selectedLabel : placeholder }}
        </span>
        <span class="base-select__chevron" :class="{ 'base-select__chevron--open': isOpen }">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      <Transition name="base-select-dropdown">
        <div v-if="isOpen" class="base-select__dropdown" @click.stop>
          <button
            v-for="option in options"
            :key="option.id"
            type="button"
            class="base-select__option"
            :class="{
              'base-select__option--selected': isSelected(option),
              'base-select__option--disabled': option.disabled,
            }"
            :disabled="option.disabled"
            @click="selectOption(option)"
          >
            <span class="base-select__option-label">{{ option.label }}</span>
            <span v-if="isSelected(option)" class="base-select__option-check">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          </button>
          <p v-if="options.length === 0" class="base-select__empty">لا توجد خيارات</p>
        </div>
      </Transition>
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

  &__trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-3;
    width: 100%;
    min-height: var(--input-height);
    padding: $spacing-3 $spacing-4;
    border: 1px solid var(--color-border);
    border-radius: $radius-lg;
    background-color: var(--color-background-input, #fff);
    color: var(--color-text-primary);
    font-size: $font-size-base;
    font-family: inherit;
    cursor: pointer;
    transition: border-color $transition-fast, box-shadow $transition-fast, background-color $transition-fast;
    text-align: right;

    &:hover:not(:disabled) {
      border-color: rgba(0, 0, 0, 0.18);
      background-color: #fafafa;
    }

    &:focus-visible {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-lighter);
    }

    &--open {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-lighter);
    }

    &--placeholder .base-select__value {
      color: var(--color-text-muted);
    }

    &--error {
      border-color: var(--color-error);
    }

    &--disabled {
      background-color: var(--color-background);
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  &__value {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__chevron {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--color-text-muted);
    transition: transform $transition-fast;

    &--open {
      transform: rotate(180deg);
      color: var(--color-primary);
    }
  }

  &__dropdown {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    left: 0;
    z-index: 50;
    max-height: 240px;
    overflow-y: auto;
    padding: $spacing-2;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: $radius-lg;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.08),
      0 10px 24px -4px rgba(0, 0, 0, 0.12);
    scrollbar-width: thin;
    display: flex;
    flex-direction: column;
    gap: $spacing-2;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--color-border);
      border-radius: $radius-full;
    }
  }

  &__option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-2;
    width: 100%;
    padding: $spacing-2 $spacing-3;
    border: none;
    border-radius: $radius-md;
    background: transparent;
    color: var(--color-text-primary);
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    font-family: inherit;
    cursor: pointer;
    text-align: right;
    transition: background-color $transition-fast, color $transition-fast;

    &:hover:not(:disabled) {
      background-color: var(--color-primary-lighter, rgba(16, 185, 129, 0.08));
      color: var(--color-primary);
    }

    &--selected {
      background-color: var(--color-primary-lighter, rgba(16, 185, 129, 0.12));
      color: var(--color-primary);
      font-weight: $font-weight-bold;
    }

    &--disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
  }

  &__option-label {
    flex: 1;
  }

  &__option-check {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    color: var(--color-primary);
  }

  &__empty {
    margin: 0;
    padding: $spacing-3;
    text-align: center;
    font-size: $font-size-sm;
    color: var(--color-text-muted);
  }

  &__error {
    font-size: $font-size-sm;
    color: var(--color-error);
  }
}

.base-select-dropdown-enter-active,
.base-select-dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.base-select-dropdown-enter-from,
.base-select-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
