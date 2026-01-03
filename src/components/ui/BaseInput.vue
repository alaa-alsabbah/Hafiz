<script setup lang="ts">
import { ref, computed, useSlots } from 'vue'

interface Props {
  modelValue?: string
  type?: string
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
  id?: string
  autocomplete?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  label: '',
  placeholder: '',
  error: '',
  disabled: false,
  required: false,
  id: () => `input-${Math.random().toString(36).substr(2, 9)}`,
  autocomplete: 'off'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const slots = useSlots()
const isFocused = ref(false)
const showPassword = ref(false)

const inputType = computed(() => {
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type
})

const hasError = computed(() => !!props.error)
const hasPrefix = computed(() => !!slots.prefix)
const hasSuffix = computed(() => !!slots.suffix || props.type === 'password')

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function handleFocus(event: FocusEvent) {
  isFocused.value = true
  emit('focus', event)
}

function handleBlur(event: FocusEvent) {
  isFocused.value = false
  emit('blur', event)
}

function togglePassword() {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="base-input">
    <label v-if="label" :for="id" class="base-input__label">
      {{ label }}
      <span v-if="required" class="base-input__required">*</span>
    </label>
    
    <div 
      class="base-input__wrapper"
      :class="{ 
        'base-input__wrapper--focused': isFocused,
        'base-input__wrapper--error': hasError,
        'base-input__wrapper--disabled': disabled
      }"
    >
      <div v-if="hasPrefix" class="base-input__prefix">
        <slot name="prefix" />
      </div>
      
      <input
        :id="id"
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :autocomplete="autocomplete"
        class="base-input__field"
        :class="{
          'base-input__field--has-prefix': hasPrefix,
          'base-input__field--has-suffix': hasSuffix
        }"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      
      <button
        v-if="type === 'password'"
        type="button"
        class="base-input__toggle"
        @click="togglePassword"
        tabindex="-1"
      >
        <svg v-if="showPassword" class="base-input__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
        <svg v-else class="base-input__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </button>
      
      <div v-else-if="hasSuffix" class="base-input__suffix">
        <slot name="suffix" />
      </div>
    </div>
    
    <p v-if="error" class="base-input__error">{{ error }}</p>
  </div>
</template>

<style lang="scss" scoped>
.base-input {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
  
  &__label {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: var(--color-text-primary);
  }
  
  &__required {
    color: var(--color-error);
    margin-right: $spacing-1;
  }
  
  &__wrapper {
    position: relative;
    display: flex;
    align-items: center;
    background-color: var(--color-background-input);
    border: 1px solid var(--color-border);
    border-radius: $radius-lg;
    transition: all $transition-fast;
    
    &:hover:not(&--disabled) {
      border-color: var(--color-text-muted);
    }
    
    &--focused {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba($color-primary, 0.1);
    }
    
    &--error {
      border-color: var(--color-error);
      
      &.base-input__wrapper--focused {
        box-shadow: 0 0 0 3px rgba($color-error, 0.1);
      }
    }
    
    &--disabled {
      background-color: var(--color-background);
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
  
  &__field {
    flex: 1;
    width: 100%;
    height: $input-height;
    padding: 0 $spacing-4;
    border: none;
    background: transparent;
    font-family: var(--font-family);
    font-size: $font-size-base;
    color: var(--color-text-primary);
    outline: none;
    
    &::placeholder {
      color: var(--color-text-muted);
    }
    
    &--has-prefix {
      padding-right: $spacing-2;
    }
    
    &--has-suffix {
      padding-left: $spacing-2;
    }
    
    &:disabled {
      cursor: not-allowed;
    }
  }
  
  &__prefix,
  &__suffix {
    display: flex;
    align-items: center;
    padding: 0 $spacing-3;
    color: var(--color-text-muted);
  }
  
  &__toggle {
    display: flex;
    align-items: center;
    padding: 0 $spacing-3;
    background: transparent;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    transition: color $transition-fast;
    
    &:hover {
      color: var(--color-text-secondary);
    }
  }
  
  &__icon {
    width: 20px;
    height: 20px;
  }
  
  &__error {
    font-size: $font-size-sm;
    color: var(--color-error);
    margin: 0;
  }
}
</style>
