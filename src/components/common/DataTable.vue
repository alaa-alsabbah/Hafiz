<script setup lang="ts">
import { computed } from 'vue'
import BaseTable from './BaseTable.vue'

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

const emit = defineEmits<{
  'row-click': [row: any, index: number]
}>()
</script>

<template>
  <div class="data-table">
    <div class="data-table__card">
      <BaseTable
        :columns="columns"
        :data="data"
        :loading="loading"
        :empty-message="emptyMessage"
        :loading-message="loadingMessage"
        :row-key="rowKey"
        @row-click="(row, index) => emit('row-click', row, index)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.data-table {
  width: 100%;

  &__card {
    background-color: var(--color-background-card);
    border-radius: $radius-xl;
    padding: $spacing-4;
    box-shadow: $shadow-md;

    @include sm-max {
      padding: $spacing-3;
    }
  }
}
</style>
