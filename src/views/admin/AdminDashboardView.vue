<script setup lang="ts">
import { ref } from 'vue'
import NotificationBell from '@/components/ui/NotificationBell.vue'
import { ADMIN_LABELS } from '@/config/admin.constants'

const notificationCount = ref(3)
const hasNotification = ref(true)

function handleNotificationClick() {
  console.log('Notification clicked')
}
</script>

<template>
  <div class="admin-dashboard" data-component="AdminDashboardView">
    <!-- Top Section -->
    <div class="admin-dashboard__top-section">
      <div class="admin-dashboard__top-content">
        <h1 class="admin-dashboard__title">
          {{ ADMIN_LABELS.PAGE_TITLE }}
        </h1>

        <div class="admin-dashboard__notifications">
          <NotificationBell
            :count="notificationCount"
            :has-notification="hasNotification"
            @click="handleNotificationClick"
          />
        </div>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div class="admin-dashboard__content">
      <p>لوحة تحكم المسؤول - قيد التطوير</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-dashboard {
  width: 100%;
  min-height: 100vh;
  position: relative;

  &__top-section {
    margin-bottom: $spacing-4;
  }

  &__top-content {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-4;
  }

  &__notifications {
    display: flex;
    align-items: center;
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
