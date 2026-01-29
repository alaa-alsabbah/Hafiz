<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface DropdownOption {
  id: string | number
  value: string | number | null
  label: string
  disabled?: boolean
}

interface Props {
  modelValue: string | number | null
  options: DropdownOption[]
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'اختر...',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const selectedLabel = computed(() => {
  if (props.modelValue == null || props.modelValue === '') {
    return props.placeholder
  }
  const option = props.options.find(
    (o) => o.value === props.modelValue || String(o.value) === String(props.modelValue)
  )
  return option?.label ?? props.placeholder
})

function toggle() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

function select(option: DropdownOption) {
  if (option.disabled) return
  emit('update:modelValue', option.value)
  isOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="dropdownRef" class="base-dropdown">
    <button
      type="button"
      class="base-dropdown__trigger"
      :class="{
        'base-dropdown__trigger--open': isOpen,
        'base-dropdown__trigger--disabled': disabled,
      }"
      :disabled="disabled"
      @click="toggle"
    >
      <span class="base-dropdown__label">{{ selectedLabel }}</span>
      <svg
        class="base-dropdown__icon"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>

    <Transition name="dropdown">
      <div v-if="isOpen" class="base-dropdown__menu">
        <button
          v-for="option in options"
          :key="String(option.id)"
          type="button"
          class="base-dropdown__item"
          :class="{
            'base-dropdown__item--selected': option.value === modelValue,
            'base-dropdown__item--disabled': option.disabled,
          }"
          :disabled="option.disabled"
          @click="select(option)"
        >
          {{ option.label }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.base-dropdown {
  position: relative;
  min-width: 140px;

  @include sm-max {
    min-width: 120px;
  }

  &__trigger {
    width: 100%;
    height: 40px;
    padding: 0 $spacing-4;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-2;
    border: 1px solid var(--color-border);
    border-radius: $radius-lg;
    background-color: var(--color-background-input);
    color: var(--color-text-primary);
    font-size: $font-size-sm;
    font-family: inherit;
    cursor: pointer;
    transition: all $transition-fast;
    text-align: right;

    &:hover:not(:disabled) {
      border-color: var(--color-text-muted);
    }

    &--open {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba($color-primary, 0.1);
    }

    &--disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__icon {
    flex-shrink: 0;
    color: var(--color-text-muted);
    transition: transform $transition-fast;
  }

  &__trigger--open &__icon {
    transform: rotate(180deg);
  }

  &__menu {
    position: absolute;
    top: calc(100% + $spacing-1);
    right: 0;
    left: 0;
    max-height: 240px;
    overflow-y: auto;
    background: #fff;
    border: 1px solid var(--color-border);
    border-radius: $radius-lg;
    box-shadow: $shadow-lg;
    padding: $spacing-2;
    z-index: 100;
  }

  &__item {
    width: 100%;
    padding: $spacing-2 $spacing-3;
    border: none;
    background: transparent;
    color: var(--color-text-primary);
    font-size: $font-size-sm;
    font-family: inherit;
    text-align: right;
    cursor: pointer;
    border-radius: $radius-md;
    transition: all $transition-fast;

    &:hover:not(:disabled) {
      background-color: var(--color-primary-lighter);
      color: var(--color-primary);
    }

    &--selected {
      background-color: rgba($color-primary, 0.1);
      color: var(--color-primary);
      font-weight: $font-weight-medium;
    }

    &--disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity $transition-fast, transform $transition-fast;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
