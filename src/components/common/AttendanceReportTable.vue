<script setup lang="ts">
import { computed } from 'vue'
import BaseTable from './BaseTable.vue'

interface Person {
  id: number | string
  full_name?: string
  name?: string
  program?: string
  [key: string]: any
}

interface Props {
  people: Person[]
  attendanceRecords: Map<number | string, any[]>
  columns: Array<{
    key: string
    label: string
    getValue?: (person: Person, record: any) => any
  }>
  loading?: boolean
  emptyMessage?: string
  loadingMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  emptyMessage: 'لا توجد بيانات',
  loadingMessage: 'جاري التحميل...'
})

// Flatten attendance records for table display
const tableData = computed(() => {
  const data: Array<{
    person: Person
    record: any
    [key: string]: any
  }> = []

  props.people.forEach(person => {
    const records = props.attendanceRecords.get(person.id) || []
    records.forEach(record => {
      const row: any = {
        person,
        record
      }
      
      // Map column keys to values
      props.columns.forEach(column => {
        if (column.getValue) {
          row[column.key] = column.getValue(person, record)
        } else {
          // Default mapping
          if (column.key === 'name' || column.key === 'student_name' || column.key === 'person_name') {
            row[column.key] = person.full_name || person.name || ''
          } else if (column.key === 'program') {
            row[column.key] = person.program || ''
          } else {
            row[column.key] = record[column.key] ?? ''
          }
        }
      })
      
      data.push(row)
    })
  })

  return data
})

const tableColumns = computed(() => {
  return props.columns.map(col => ({
    key: col.key,
    label: col.label
  }))
})

function getRowKey(row: any, index: number): string | number {
  return `${row.person.id}-${row.record.id}-${index}`
}
</script>

<template>
  <BaseTable
    :columns="tableColumns"
    :data="tableData"
    :loading="loading"
    :empty-message="emptyMessage"
    :loading-message="loadingMessage"
    :row-key="getRowKey"
  />
</template>
