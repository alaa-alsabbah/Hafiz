<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { BaseButton } from '@/components/ui'
import AppLogo from '@/components/common/AppLogo.vue'

const router = useRouter()
const authStore = useAuthStore()

function handleLogout(): void {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="dashboard-view">
    <div class="dashboard-view__container">
      <AppLogo size="lg" />
      <h1 class="dashboard-view__title">مرحبًا بك في لوحة التحكم</h1>
      <p class="dashboard-view__subtitle">هذه صفحة البداية - سيتم إضافة المزيد من المحتوى قريبًا</p>
      
      <BaseButton variant="outline" @click="handleLogout">
        تسجيل الخروج
      </BaseButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-6;
  
  &__container {
    text-align: center;
    padding: $spacing-8;
    background-color: var(--color-background-card);
    border-radius: $radius-xl;
    box-shadow: $shadow-lg;
    max-width: 500px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-4;
  }
  
  &__title {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
  }
  
  &__subtitle {
    font-size: $font-size-base;
    color: var(--color-text-secondary);
    margin: 0 0 $spacing-4;
  }
}
</style>

