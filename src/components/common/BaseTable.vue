<script setup lang="ts">
import { computed, ref } from 'vue'

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
  pageSizeOptions?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  emptyMessage: 'لا توجد بيانات',
  loadingMessage: 'جاري التحميل...',
  rowKey: (row: any, index: number) => row.id || index,
  pageSizeOptions: () => [10, 25, 50]
})

const pageSize = ref(props.pageSizeOptions[0] || 10)
const currentPage = ref(1)

const totalItems = computed(() => props.data.length)
const totalPages = computed(() =>
  totalItems.value === 0 ? 1 : Math.ceil(totalItems.value / pageSize.value)
)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return props.data.slice(start, end)
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

function changePage(newPage: number) {
  if (newPage < 1 || newPage > totalPages.value) return
  currentPage.value = newPage
}

function changePageSize(newSize: number) {
  pageSize.value = newSize
  currentPage.value = 1
}

function handlePageSizeChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const value = Number(target.value)
  if (!Number.isNaN(value)) {
    changePageSize(value)
  }
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
    <template v-else>
      <table class="base-table__table">
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
          <tr v-for="(row, index) in paginatedData" :key="getRowKey(row, index)">
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

      <div class="base-table__pagination">
        <div class="base-table__pagination-left">
          <span class="base-table__pagination-label">عرض</span>
          <select
            class="base-table__page-size-select"
            :value="pageSize"
            @change="handlePageSizeChange"
          >
            <option
              v-for="size in pageSizeOptions"
              :key="size"
              :value="size"
            >
              {{ size }}
            </option>
          </select>
          <span class="base-table__pagination-info">
            من {{ totalItems }}
          </span>
        </div>

        <div class="base-table__pagination-right">
          <button
            type="button"
            class="base-table__page-btn"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            ‹
          </button>

          <button
            v-for="page in totalPages"
            :key="page"
            type="button"
            class="base-table__page-btn"
            :class="{ 'base-table__page-btn--active': currentPage === page }"
            @click="changePage(page)"
          >
            {{ page }}
          </button>

          <button
            type="button"
            class="base-table__page-btn"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            ›
          </button>
        </div>
      </div>
    </template>
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

  &__pagination {
    margin-top: $spacing-4;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-4;
    font-size: $font-size-sm;
    color: var(--color-text-secondary);

    @include sm-max {
      flex-direction: column;
      align-items: stretch;
    }
  }

  &__pagination-left {
    display: flex;
    align-items: center;
    gap: $spacing-2;
  }

  &__pagination-label {
    font-weight: $font-weight-medium;
  }

  &__page-size-select {
    min-width: 64px;
    padding: $spacing-1 $spacing-3;
    border-radius: 10px;
    border: none;
    background: rgba(244, 244, 244, 1);
    font-size: $font-size-xs;
    color: var(--color-text-secondary);
    cursor: pointer;
    line-height: 1.4;
  }

  &__pagination-info {
    color: var(--color-text-muted);
  }

  &__pagination-right {
    display: flex;
    align-items: center;
    gap: $spacing-1;
  }

  &__page-btn {
    min-width: 32px;
    height: 32px;
    border-radius: 10px;
    border: none;
    background: rgba(244, 244, 244, 1);
    font-size: $font-size-xs;
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all $transition-fast;

    &:hover:not(:disabled) {
      background: rgba(0, 141, 153, 0.12);
      color: rgba(0, 141, 153, 1);
    }

    &--active {
      background: rgba(0, 141, 153, 1);
      color: #fff;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}
</style>
