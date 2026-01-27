<script setup lang="ts">
import { STUDENT_LABELS } from '@/config/student.constants'

</script>

<template>
  <div class="student-activity-log">
    <h1>{{ STUDENT_LABELS.ACTIVITY_LOG }}</h1>
    <p>صفحة سجل الحركات - قيد التطوير</p>
  </div>
</template>

<style lang="scss" scoped>
.student-activity-log {
  padding: $spacing-6;
  background-color: var(--color-background-card);
  border-radius: $radius-xl;
}
</style>
