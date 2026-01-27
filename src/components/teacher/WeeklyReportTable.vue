<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Student, AttendanceRecord } from '@/services/teacher.service'
import { WEEKLY_REPORT_LABELS } from '@/config/teacher.constants'

interface Props {
  students: Student[]
  attendanceRecords: Map<number, AttendanceRecord[]>
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// Flatten attendance records for table display
const tableData = computed(() => {
  const data: Array<{
    student: Student
    record: AttendanceRecord
  }> = []

  props.students.forEach(student => {
    const records = props.attendanceRecords.get(student.id) || []
    records.forEach(record => {
      data.push({ student, record })
    })
  })

  return data
})

function formatValue(value: any): string {
  if (value === null || value === undefined || value === '') {
    return '---'
  }
  return String(value)
}
</script>

<template>
  <div class="weekly-report-table">
    <div v-if="loading" class="weekly-report-table__loading">جاري التحميل...</div>
    <div v-else-if="tableData.length === 0" class="weekly-report-table__empty">لا توجد بيانات</div>
    <table v-else class="weekly-report-table__table">
      <thead>
        <tr>
          <th>{{ WEEKLY_REPORT_LABELS.TABLE.STUDENT }}</th>
          <th>{{ WEEKLY_REPORT_LABELS.TABLE.PROGRAM }}</th>
          <th>{{ WEEKLY_REPORT_LABELS.TABLE.SESSION }}</th>
          <th>{{ WEEKLY_REPORT_LABELS.TABLE.STATUS }}</th>
          <th>{{ WEEKLY_REPORT_LABELS.TABLE.LAST_PAGE }}</th>
          <th>{{ WEEKLY_REPORT_LABELS.TABLE.EVALUATION }}</th>
          <th>{{ WEEKLY_REPORT_LABELS.TABLE.DATE }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in tableData" :key="`${item.student.id}-${item.record.id}-${index}`">
          <td>{{ formatValue(item.student.full_name) }}</td>
          <td>{{ formatValue(item.student.program) }}</td>
          <td>{{ formatValue(item.record.session) }}</td>
          <td>{{ formatValue(item.record.status) }}</td>
          <td>{{ formatValue(item.record.page_number) }}</td>
          <td>{{ formatValue(item.record.score) }}</td>
          <td>{{ formatValue(item.record.date) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.weekly-report-table {
  width: 100%;

  &__loading,
  &__empty {
    text-align: center;
    padding: var(--spacing-8);
    color: var(--color-text-secondary);
  }

  &__table {
    width: 100%;
    border-collapse: collapse;

    thead {
      background-color: rgba(236, 244, 233, 1);
      border-top: 1px solid rgba(236, 244, 233, 1);
      border-bottom: 1px solid rgba(236, 244, 233, 1);

      th {
        padding: var(--spacing-4);
        text-align: right;
        font-weight: var(--font-weight-bold);
        color: var(--color-text-primary);
      }
    }

    tbody {
      tr {
        border-bottom: 1px solid rgba(229, 230, 230, 1);

        &:last-child {
          border-bottom: none;
        }

        td {
          padding: var(--spacing-4);
          text-align: right;
          color: var(--color-text-primary);
        }
      }
    }
  }
}
</style>
