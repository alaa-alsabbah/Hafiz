<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLogo from '@/components/common/AppLogo.vue'
import { NotificationBell } from '@/components/ui'
import {
  IconGrid,
  IconUser,
  IconCalendar,
  IconGraduationCap,
  IconLogout,
} from '@/components/icons'
import { TEACHER_MENU_ITEMS } from '@/config/teacher.constants'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isSidebarCollapsed = ref(false)

const currentUser = computed(() => authStore.currentUser)

// Map icon strings to icon components
const iconMap: Record<string, any> = {
  grid: IconGrid,
  user: IconUser,
  calendar: IconCalendar,
  'graduation-cap': IconGraduationCap,
}

const menuItems = computed(() =>
  TEACHER_MENU_ITEMS.map((item) => ({
    ...item,
    icon: iconMap[item.icon] || IconGrid,
  }))
)

const isActiveRoute = (routeName: string) => {
  return route.name === routeName
}

function navigateTo(routeName: string) {
  router.push({ name: routeName })
}

function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

function handleLogout() {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="teacher-layout" :class="{ 'teacher-layout--collapsed': isSidebarCollapsed }">
    <!-- Sidebar -->
    <aside class="teacher-layout__sidebar">
      <div class="teacher-layout__sidebar-header">
        <AppLogo size="md" />
      </div>

      <div class="teacher-layout__user">
        <div class="teacher-layout__avatar">
          <span>
            {{ currentUser?.name?.charAt(0) || 'م' }}
          </span>
        </div>
        <div class="teacher-layout__user-info">
          <div class="teacher-layout__user-name">
            {{ currentUser?.name || 'المعلم' }}
          </div>
          <div class="teacher-layout__user-role">
            {{ currentUser?.role === 'teacher' ? 'معلم' : currentUser?.role === 'student' ? 'طالب' : 'مسؤول' }}
          </div>
        </div>
      </div>

      <nav class="teacher-layout__nav">
        <button
          v-for="item in menuItems"
          :key="item.name"
          class="teacher-layout__nav-item"
          :class="{ 'teacher-layout__nav-item--active': isActiveRoute(item.name) }"
          @click="navigateTo(item.name)"
        >
          <component :is="item.icon" class="teacher-layout__nav-icon" />
          <span class="teacher-layout__nav-label">
            {{ item.label }}
          </span>
        </button>
      </nav>

      <button class="teacher-layout__logout" @click="handleLogout">
        <IconLogout class="teacher-layout__nav-icon" />
        <span class="teacher-layout__nav-label">
          تسجيل الخروج
        </span>
      </button>
    </aside>

    <!-- Main area -->
    <div class="teacher-layout__main">
      <header class="teacher-layout__header">
        <button
          class="teacher-layout__toggle"
          type="button"
          aria-label="Toggle sidebar"
          @click="toggleSidebar"
        >
          <span class="teacher-layout__toggle-line" />
          <span class="teacher-layout__toggle-line" />
          <span class="teacher-layout__toggle-line" />
        </button>

        <div class="teacher-layout__header-right">
          <NotificationBell :count="3" :has-notification="true" />
        </div>
      </header>

      <main class="teacher-layout__content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.teacher-layout {
  min-height: 100vh;
  width: 100%;
  max-width: 100vw;
  background-color: var(--color-background);
  display: flex;
  direction: rtl;

  &__sidebar {
    width: var(--sidebar-width);
    min-height: 100vh;
    background-color: var(--color-background-sidebar);
    padding: $spacing-6 $spacing-4;
    display: flex;
    flex-direction: column;
    gap: $spacing-6;
    position: sticky;
    top: 0;
    z-index: var(--sidebar-z-index);

    @include sm-max {
      display: none;
    }
  }

  &__sidebar-header {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__user {
    display: flex;
    align-items: center;
    gap: $spacing-3;
  }

  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: var(--color-avatar-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: $font-weight-bold;
    color: var(--color-primary);
  }

  &__user-info {
    display: flex;
    flex-direction: column;
    gap: $spacing-1;
  }

  &__user-name {
    font-size: $font-size-base;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
  }

  &__user-role {
    font-size: $font-size-sm;
    color: var(--color-text-muted);
  }

  &__nav {
    display: flex;
    flex-direction: column;
    gap: $spacing-1;
    margin-top: $spacing-2;
  }

  &__nav-item {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    padding: $spacing-2 $spacing-3;
    border-radius: $radius-lg;
    border: none;
    background: transparent;
    color: var(--color-text-primary);
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    text-align: right;
    transition: all $transition-fast;

    &:hover {
      background-color: var(--color-hover-overlay);
      color: var(--color-primary);
    }

    &--active {
      background-color: #fff;
      color: var(--color-primary);
      box-shadow: $shadow-sm;
    }
  }

  &__nav-icon {
    width: 20px;
    height: 20px;
  }

  &__nav-label {
    flex: 1;
  }

  &__logout {
    margin-top: auto;
    display: flex;
    align-items: center;
    gap: $spacing-2;
    padding: $spacing-2 $spacing-3;
    border-radius: $radius-lg;
    border: none;
    background: transparent;
    color: var(--color-error);
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    text-align: right;
    transition: all $transition-fast;

    &:hover {
      background-color: rgba(239, 68, 68, 0.08);
    }
  }

  &__main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-4 $spacing-6;
    border-bottom: 1px solid var(--color-border);
    background-color: #fff;
    position: sticky;
    top: 0;
    z-index: var(--sidebar-z-index);
  }

  &__toggle {
    display: none;
    background: none;
    border: none;
    padding: $spacing-2;
    cursor: pointer;

    @include sm-max {
      display: inline-flex;
      flex-direction: column;
      gap: 4px;
    }
  }

  &__toggle-line {
    width: 18px;
    height: 2px;
    background-color: var(--color-text-primary);
    border-radius: $radius-full;
  }

  &__header-right {
    display: flex;
    align-items: center;
    gap: $spacing-3;
  }

  &__content {
    flex: 1;
    padding: $spacing-6;
    background-color: var(--color-background);
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
  }

  &--collapsed {
    @include sm-max {
      .teacher-layout__sidebar {
        display: none;
      }
    }
  }
}
</style>

