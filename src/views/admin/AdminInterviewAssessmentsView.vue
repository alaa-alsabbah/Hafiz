<script setup lang="ts">
import { ADMIN_LABELS } from '@/config/admin.constants'
</script>

<template>
  <div class="admin-evaluations" data-component="AdminInterviewAssessmentsView">
    <div class="admin-evaluations__header">
      <h1 class="admin-evaluations__title">
        {{ ADMIN_LABELS.EVALUATIONS }}
      </h1>
    </div>

    <div class="admin-evaluations__content">
      <p>تقييمات المقابلات - قيد التطوير</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-evaluations {
  width: 100%;
  min-height: 100vh;
  position: relative;

  &__header {
    margin-bottom: $spacing-4;
  }

  &__title {
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
    margin: 0;
    text-align: right;
  }

  &__content {
    background-color: $color-background-card;
    border-radius: $radius-xl;
    padding: $spacing-6;
    box-shadow: $shadow-md;
  }
}
</style>
