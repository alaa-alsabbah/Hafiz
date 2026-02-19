<script setup lang="ts">
import { BaseTabs } from '@/components/ui'

export interface SelectOption {
  value: string
  label: string
}

interface Props {
  programTabs?: Array<{ id: string; label: string; value?: string | number | null }>
  programModelValue?: string | number | null
  searchPlaceholder?: string
  searchModelValue?: string
  statusOptions?: SelectOption[]
  statusAllLabel?: string
  statusModelValue?: string
  studentOptions?: SelectOption[]
  studentPlaceholder?: string
  studentModelValue?: string
  showDate?: boolean
  dateModelValue?: string
  showExport?: boolean
  exportLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  programTabs: () => [],
  programModelValue: 'all',
  searchPlaceholder: 'ابحث...',
  searchModelValue: '',
  statusOptions: () => [],
  statusAllLabel: 'جميع الحالات',
  statusModelValue: '',
  studentOptions: () => [],
  studentPlaceholder: 'اختر طالبًا',
  studentModelValue: '',
  showDate: false,
  dateModelValue: '',
  showExport: true,
  exportLabel: 'تصدير',
})

const emit = defineEmits<{
  'update:programModelValue': [v: string | number | null]
  'update:searchModelValue': [v: string]
  'update:statusModelValue': [v: string]
  'update:studentModelValue': [v: string]
  'update:dateModelValue': [v: string]
  'export': []
}>()
</script>

<template>
  <div class="data-table-filter-bar" data-component="DataTableFilterBar">
    <div class="data-table-filter-bar__tabs" v-if="programTabs.length > 0">
      <BaseTabs :model-value="programModelValue" :tabs="programTabs" @update:model-value="emit('update:programModelValue', $event)" />
    </div>

    <div class="data-table-filter-bar__filters">
      <input
        v-if="showDate"
        type="date"
        :value="dateModelValue"
        class="data-table-filter-bar__input data-table-filter-bar__date"
        @input="emit('update:dateModelValue', ($event.target as HTMLInputElement).value)"
      />

      <div class="data-table-filter-bar__search-wrap">
        <span class="data-table-filter-bar__search-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </span>
        <input
          type="search"
          :value="searchModelValue"
          class="data-table-filter-bar__input data-table-filter-bar__search"
          :placeholder="searchPlaceholder"
          autocomplete="off"
          @input="emit('update:searchModelValue', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <div class="data-table-filter-bar__select-wrap">
        <select
          :value="statusModelValue"
          class="data-table-filter-bar__select"
          @change="emit('update:statusModelValue', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">{{ statusAllLabel }}</option>
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div v-if="studentOptions.length > 0" class="data-table-filter-bar__select-wrap">
        <select
          :value="studentModelValue"
          class="data-table-filter-bar__select"
          @change="emit('update:studentModelValue', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">{{ studentPlaceholder }}</option>
          <option v-for="opt in studentOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <button
        v-if="showExport"
        type="button"
        class="data-table-filter-bar__export-btn"
        @click="emit('export')"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        {{ exportLabel }}
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.data-table-filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: $spacing-4;
  padding: $spacing-3 $spacing-4;
  background: var(--color-background-card);
  border-radius: $radius-xl;
  border: 1px solid var(--color-border);
  box-shadow: $shadow-sm;

  @include sm-max {
    flex-direction: column;
    align-items: stretch;
  }

  &__tabs {
    flex-shrink: 0;

    .base-tabs {
      min-width: 280px;

      @include sm-max {
        min-width: 0;
        width: 100%;
      }
    }
  }

  &__filters {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: $spacing-3;
    margin-right: auto;
    flex: 1;
    min-width: 0;

    @include sm-max {
      margin-right: 0;
    }
  }

  &__input {
    padding: $spacing-2 $spacing-4;
    border-radius: $radius-lg;
    border: 1px solid var(--color-border);
    background: var(--color-background);
    font-size: $font-size-sm;
    color: var(--color-text-primary);
    transition: border-color $transition-fast, box-shadow $transition-fast;

    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(0, 153, 104, 0.15);
    }

    &::placeholder {
      color: var(--color-text-muted);
    }
  }

  &__date {
    min-width: 150px;
  }

  &__search-wrap {
    position: relative;
    flex: 1;
    min-width: 200px;
    max-width: 320px;
  }

  &__search-icon {
    position: absolute;
    right: $spacing-3;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-muted);
    pointer-events: none;
  }

  &__search {
    width: 100%;
    padding-right: 2.5rem;
  }

  &__select-wrap {
    min-width: 150px;
  }

  &__select {
    width: 100%;
    padding: $spacing-2 $spacing-4;
    padding-left: 2.25rem;
    border-radius: $radius-lg;
    border: 1px solid var(--color-border);
    background: var(--color-background);
    font-size: $font-size-sm;
    color: var(--color-text-primary);
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: left 0.5rem center;
    background-size: 1.25rem;
    transition: border-color $transition-fast;

    &:focus {
      outline: none;
      border-color: var(--color-primary);
    }
  }

  &__export-btn {
    display: inline-flex;
    align-items: center;
    gap: $spacing-2;
    padding: $spacing-2 $spacing-4;
    border-radius: $radius-lg;
    border: none;
    background: var(--color-primary);
    color: #fff;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: background-color $transition-fast, transform $transition-fast;

    &:hover {
      background: #008a5c;
    }

    &:active {
      transform: scale(0.98);
    }
  }
}
</style>
