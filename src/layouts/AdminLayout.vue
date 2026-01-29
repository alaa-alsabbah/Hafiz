<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLogo from '@/components/common/AppLogo.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import { NotificationBell } from '@/components/ui'
import {
  IconUser,
  IconCalendar,
  IconGraduationCap,
  IconLogout,
  IconArrowLeft,
} from '@/components/icons'
import { ADMIN_MENU_ITEMS, ADMIN_LABELS } from '@/config/admin.constants'

// Import SVG icons
import gridIcon from '@/assets/img/icons/SquaresFour.svg'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isSidebarOpen = ref(false)

const currentUser = computed(() => authStore.currentUser)

// Map icon strings to icon components or SVG paths
const iconMap: Record<string, any> = {
  grid: gridIcon,
  user: IconUser,
  calendar: IconCalendar,
  'graduation-cap': IconGraduationCap,
}

const menuItems = computed(() =>
  ADMIN_MENU_ITEMS.map((item) => {
    const icon = iconMap[item.icon] || gridIcon
    return {
      ...item,
      icon,
      isSvg: typeof icon === 'string',
    }
  })
)

const isActiveRoute = (routeName: string) => {
  return route.name === routeName
}

function navigateTo(routeName: string) {
  router.push({ name: routeName })
  // Close sidebar on mobile after navigation
  if (window.innerWidth < 768) {
    isSidebarOpen.value = false
  }
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
  isSidebarOpen.value = false
}

function handleLogout() {
  authStore.logout()
  router.push({ name: 'login' })
}


// Prevent body scroll when sidebar is open on mobile
watch(isSidebarOpen, (isOpen) => {
  if (window.innerWidth < 768) {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
})

// Cleanup on unmount
onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="admin-layout" :class="{ 'admin-layout--sidebar-open': isSidebarOpen }">
    <!-- Overlay -->
    <Transition name="overlay">
      <div
        v-if="isSidebarOpen"
        class="admin-layout__overlay"
        @click="closeSidebar"
      />
    </Transition>

    <!-- Sidebar -->
    <aside class="admin-layout__sidebar">
      <div class="admin-layout__sidebar-header">
        <AppLogo size="md" />
        <button
          class="admin-layout__close-btn"
          @click="closeSidebar"
          aria-label="إغلاق القائمة"
        >
          <IconArrowLeft />
        </button>
      </div>

      <nav class="admin-layout__nav">
        <button
          v-for="item in menuItems"
          :key="item.name"
          class="admin-layout__nav-item"
          :class="{ 'admin-layout__nav-item--active': isActiveRoute(item.name) }"
          @click="navigateTo(item.name)"
        >
          <img
            v-if="item.isSvg"
            :src="item.icon"
            :alt="item.label"
            class="admin-layout__nav-icon"
          />
          <component
            v-else
            :is="item.icon"
            class="admin-layout__nav-icon"
          />
          <span class="admin-layout__nav-label">
            {{ item.label }}
          </span>
        </button>
      </nav>

      <!-- User Profile at Bottom -->
      <div class="admin-layout__user-profile">
        <div class="admin-layout__user-avatar">
          <span>
            {{ currentUser?.name?.charAt(0) || 'م' }}
          </span>
        </div>
        <div class="admin-layout__user-name">
          {{ currentUser?.name || 'مسؤول' }}
        </div>
        <button class="admin-layout__logout-btn" @click="handleLogout" aria-label="تسجيل الخروج">
          <IconLogout class="admin-layout__logout-icon" />
        </button>
      </div>
    </aside>

    <!-- Main area -->
    <div class="admin-layout__main">
      <header class="admin-layout__header">
        <div class="admin-layout__header-content">
          <h1 class="admin-layout__header-title">
            {{ ADMIN_LABELS.PAGE_TITLE }}
          </h1>

          <div class="admin-layout__header-left">
            <button
              class="admin-layout__toggle"
              type="button"
              aria-label="Toggle sidebar"
              @click="toggleSidebar"
            >
              <span class="admin-layout__toggle-line" />
              <span class="admin-layout__toggle-line" />
              <span class="admin-layout__toggle-line" />
            </button>

            <div class="admin-layout__header-actions">
              <NotificationBell :count="3" :has-notification="true" />
            </div>
          </div>
        </div>
        <div class="admin-layout__header-line"></div>
      </header>

      <main class="admin-layout__content">
        <slot />
      </main>

      <AppFooter />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.admin-layout {
  min-height: 100vh;
  width: 100%;
  max-width: 100vw;
  background-color: var(--color-background);
  display: flex;
  direction: rtl;

  &__overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: calc(var(--sidebar-z-index) - 1);
    backdrop-filter: blur(2px);

    @include sm-max {
      display: block;
      z-index: 999;
    }
  }

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
    transition: transform $transition-normal ease-in-out;

    @include sm-max {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      transform: translateX(100%);
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
      will-change: transform;
    }
  }

  &--sidebar-open {
    @include sm-max {
      .admin-layout__sidebar {
        transform: translateX(0) !important;
      }
    }
  }

  &__sidebar-header {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  &__close-btn {
    display: none;
    position: absolute;
    left: $spacing-4;
    background: none;
    border: none;
    padding: $spacing-2;
    cursor: pointer;
    color: var(--color-text-primary);
    transition: color $transition-fast;

    &:hover {
      color: var(--color-primary);
    }

    @include sm-max {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    svg {
      width: 20px;
      height: 20px;
    }
  }

  &__nav {
    display: flex;
    flex-direction: column;
    gap: $spacing-2;
    flex: 1;
  }

  &__nav-item {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    padding: $spacing-3 $spacing-4;
    border-radius: $radius-full;
    border: none;
    background: transparent;
    color: var(--color-text-primary);
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    text-align: right;
    transition: all $transition-fast;
    width: 100%;

    &:hover {
      background-color: rgba(27, 122, 78, 0.1);
      color: var(--color-primary);
    }

    &--active {
      background-color: var(--color-primary);
      color: #fff;
      box-shadow: $shadow-sm;
      
      .admin-layout__nav-icon {
        filter: brightness(0) invert(1);
      }
    }
  }

  &__nav-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    display: block;
    transition: filter $transition-fast, color $transition-fast;
  }

  &__nav-label {
    flex: 1;
  }

  &__user-profile {
    display: flex;
    align-items: center;
    gap: $spacing-3;
    padding: $spacing-3;
    background-color: #fff;
    border-radius: $radius-lg;
    margin-top: auto;
  }

  &__user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: $font-weight-bold;
    color: #fff;
    flex-shrink: 0;
  }

  &__user-name {
    flex: 1;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: var(--color-text-primary);
    text-align: right;
  }

  &__logout-btn {
    background: none;
    border: none;
    padding: $spacing-2;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-secondary);
    transition: color $transition-fast;
    flex-shrink: 0;

    &:hover {
      color: var(--color-error);
    }
  }

  &__logout-icon {
    width: 18px;
    height: 18px;
  }

  &__main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__header {
    background-color: #fff;
    position: sticky;
    top: 0;
    z-index: var(--sidebar-z-index);
    border-bottom: none;

    @include sm-max {
      z-index: 100;
    }
  }

  &__header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-4 $spacing-6;
    position: relative;
    background-color: #fff;
    border-top-right-radius: $radius-2xl;
    direction: rtl;
  }

  &__header-left {
    display: flex;
    align-items: center;
    gap: $spacing-3;
    direction: ltr;
  }

  &__header-actions {
    display: flex;
    align-items: center;
    gap: $spacing-2;
  }

  &__header-title {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
    margin: 0;
    text-align: right;
  }

  &__header-line {
    height: 3px;
    background-color: var(--color-primary);
    width: 100%;
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


  &__content {
    flex: 1;
    padding: $spacing-6;
    background-color: var(--color-background);
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
  }

}

// Overlay transitions
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity $transition-normal;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}
</style>
