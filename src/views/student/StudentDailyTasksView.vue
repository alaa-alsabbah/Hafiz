<script setup lang="ts">
import { STUDENT_LABELS } from '@/config/student.constants'

</script>

<template>
  <div class="student-daily-tasks">
    <h1>{{ STUDENT_LABELS.DAILY_TASKS }}</h1>
    <p>صفحة الواجبات اليومية - قيد التطوير</p>
  </div>
</template>

<style lang="scss" scoped>
.student-daily-tasks {
  padding: $spacing-6;
  background-color: var(--color-background-card);
  border-radius: $radius-xl;
}
</style>
