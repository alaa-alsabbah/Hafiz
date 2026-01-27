<script setup lang="ts">
import { computed } from 'vue'

interface Column {
  key: string
  label: string
  sortable?: boolean
  width?: string
  align?: 'right' | 'left' | 'center'
}

interface Props {
  columns: Column[]
  data: any[]
  loading?: boolean
  emptyMessage?: string
  loadingMessage?: string
  rowKey?: string | ((row: any, index: number) => string | number)
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  emptyMessage: 'لا توجد بيانات',
  loadingMessage: 'جاري التحميل...',
  rowKey: (row: any, index: number) => row.id || index
})

function formatValue(value: any): string {
  if (value === null || value === undefined || value === '') {
    return '---'
  }
  return String(value)
}

function getRowKey(row: any, index: number): string | number {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row, index)
  }
  return row[props.rowKey] || index
}
</script>

<template>
  <div class="base-table">
    <div v-if="loading" class="base-table__loading">
      {{ loadingMessage }}
    </div>
    <div v-else-if="data.length === 0" class="base-table__empty">
      {{ emptyMessage }}
    </div>
    <table v-else class="base-table__table">
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :style="{ width: column.width, textAlign: column.align || 'right' }"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in data" :key="getRowKey(row, index)">
          <td
            v-for="column in columns"
            :key="column.key"
            :style="{ textAlign: column.align || 'right' }"
          >
            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
              {{ formatValue(row[column.key]) }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.base-table {
  width: 100%;

  &__loading,
  &__empty {
    text-align: center;
    padding: $spacing-8;
    color: var(--color-text-secondary);
    font-size: $font-size-base;
  }

  &__table {
    width: 100%;
    border-collapse: collapse;
    background: var(--color-background-card);

    thead {
      background-color: rgba(236, 244, 233, 1);
      border-top: 1px solid rgba(236, 244, 233, 1);
      border-bottom: 1px solid rgba(236, 244, 233, 1);

      th {
        padding: $spacing-4;
        text-align: right;
        font-weight: $font-weight-bold;
        color: var(--color-text-primary);
        font-size: $font-size-sm;
      }
    }

    tbody {
      tr {
        border-bottom: 1px solid rgba(229, 230, 230, 1);
        transition: background-color $transition-fast;

        &:hover {
          background-color: var(--color-background-hover, rgba(236, 244, 233, 0.3));
        }

        &:last-child {
          border-bottom: none;
        }

        td {
          padding: $spacing-4;
          text-align: right;
          color: var(--color-text-primary);
          font-size: $font-size-sm;
        }
      }
    }
  }
}
</style>
