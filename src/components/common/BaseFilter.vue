<script setup lang="ts">
import { BaseInput, BaseSelect, BaseDatePicker, BaseButton } from '@/components/ui'

export interface FilterOption {
  id: string | number
  value: string | number
  label: string
  disabled?: boolean
}

export interface FilterField {
  key: string
  label: string
  type: 'text' | 'select' | 'date' | 'number'
  placeholder?: string
  options?: FilterOption[]
}

interface Props {
  fields: FilterField[]
  modelValue: Record<string, any>
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  'apply': [filters: Record<string, any>]
  'reset': []
}>()

function updateField(key: string, value: any) {
  const newValue = { ...props.modelValue, [key]: value }
  emit('update:modelValue', newValue)
}

function applyFilters() {
  emit('apply', props.modelValue)
}

function resetFilters() {
  const resetValue: Record<string, any> = {}
  props.fields.forEach(field => {
    resetValue[field.key] = field.type === 'select' ? null : ''
  })
  emit('update:modelValue', resetValue)
  emit('reset')
}
</script>

<template>
  <div class="base-filter">
    <div class="base-filter__fields">
      <template v-for="field in fields" :key="field.key">
        <BaseInput
          v-if="field.type === 'text' || field.type === 'number'"
          :model-value="modelValue[field.key] || ''"
          :label="field.label"
          :placeholder="field.placeholder"
          :type="field.type"
          @update:model-value="(val) => updateField(field.key, val)"
        />
        
        <BaseSelect
          v-else-if="field.type === 'select'"
          :model-value="modelValue[field.key]"
          :label="field.label"
          :placeholder="field.placeholder || 'اختر...'"
          :options="field.options || []"
          @update:model-value="(val) => updateField(field.key, val)"
        />
        
        <BaseDatePicker
          v-else-if="field.type === 'date'"
          :model-value="modelValue[field.key]"
          :label="field.label"
          :placeholder="field.placeholder"
          @update:model-value="(val) => updateField(field.key, val)"
        />
      </template>
    </div>
    
    <div class="base-filter__actions">
      <BaseButton variant="primary" size="md" @click="applyFilters" :disabled="loading">
        تطبيق الفلتر
      </BaseButton>
      <BaseButton variant="outline" size="md" @click="resetFilters">
        إعادة تعيين
      </BaseButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.base-filter {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
  padding: $spacing-4;
  background: var(--color-background-card);
  border-radius: $radius-lg;
  border: 1px solid rgba(229, 230, 230, 1);

  &__fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: $spacing-4;
  }

  &__actions {
    display: flex;
    gap: $spacing-3;
    justify-content: flex-end;
  }
}
</style>
