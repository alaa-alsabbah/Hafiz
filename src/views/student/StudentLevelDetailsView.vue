<script setup lang="ts">
import { STUDENT_LABELS } from '@/config/student.constants'
</script>

<template>
  <div class="student-level-details">
    <h1>{{ STUDENT_LABELS.LEVEL_DETAILS }}</h1>
    <p>صفحة تفاصيل المستوى - قيد التطوير</p>
  </div>
</template>

<style lang="scss" scoped>
.student-level-details {
  padding: $spacing-6;
  background-color: var(--color-background-card);
  border-radius: $radius-xl;
}
</style>
