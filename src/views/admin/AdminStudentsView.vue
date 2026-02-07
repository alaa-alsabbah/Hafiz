<script setup lang="ts">
import { ADMIN_LABELS } from '@/config/admin.constants'
</script>

<template>
  <div class="admin-students" data-component="AdminStudentsView">
    <div class="admin-students__header">
      <h1 class="admin-students__title">
        {{ ADMIN_LABELS.STUDENTS_LIST }}
      </h1>
    </div>

    <div class="admin-students__content">
      <p>قائمة الطلاب - قيد التطوير</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-students {
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
