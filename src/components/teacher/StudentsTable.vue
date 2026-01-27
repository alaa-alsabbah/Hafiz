<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getStudents, type Student } from '@/services/teacher.service'

const students = ref<Student[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await getStudents()
    if (response.success && response.data) {
      students.value = response.data
    }
  } catch (error) {
    console.error('Error fetching students:', error)
  } finally {
    loading.value = false
  }
})

function formatValue(value: any): string {
  if (value === null || value === undefined || value === '') {
    return '---'
  }
  return String(value)
}
</script>

<template>
  <div class="students-table">
    <div v-if="loading" class="students-table__loading">جاري التحميل...</div>
    <div v-else-if="students.length === 0" class="students-table__empty">لا توجد بيانات</div>
    <table v-else class="students-table__table">
      <thead>
        <tr>
          <th>الاسم</th>
          <th>البريد الإلكتروني</th>
          <th>البرنامج</th>
          <th>المستوى</th>
          <th>التقييم</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="student in students" :key="student.id">
          <td>{{ formatValue(student.full_name) }}</td>
          <td>{{ formatValue(student.email) }}</td>
          <td>{{ formatValue(student.program) }}</td>
          <td>{{ formatValue(student.level) }}</td>
          <td>{{ formatValue(student.score) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.students-table {
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
