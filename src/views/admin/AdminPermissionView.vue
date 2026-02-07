<script setup lang="ts">
import { ADMIN_LABELS } from '@/config/admin.constants'
</script>

<template>
  <div class="admin-permission" data-component="AdminPermissionView">
    <div class="admin-permission__header">
      <h1 class="admin-permission__title">
        {{ ADMIN_LABELS.PERMISSION }}
      </h1>
    </div>

    <div class="admin-permission__content">
      <p>الاستئذان - قيد التطوير</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-permission {
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
