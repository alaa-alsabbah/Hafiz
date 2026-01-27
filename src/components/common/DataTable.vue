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
</script>

<template>
  <BaseTable
    :columns="columns"
    :data="data"
    :loading="loading"
    :empty-message="emptyMessage"
    :loading-message="loadingMessage"
    :row-key="rowKey"
  />
</template>
