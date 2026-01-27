<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLogo from '@/components/common/AppLogo.vue'
import { NotificationBell } from '@/components/ui'
import {
  IconLogout,
  IconArrowLeft,
  IconRefresh,
  IconTrophy,
  IconBranch,
  IconPermission,
} from '@/components/icons'
import { STUDENT_MENU_ITEMS, STUDENT_LABELS } from '@/config/student.constants'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isSidebarOpen = ref(false)

const currentUser = computed(() => authStore.currentUser)

// Import SVG icons
import gridIcon from '@/assets/img/icons/SquaresFour.svg'
import tasksIcon from '@/assets/img/icons/dailyTasks.svg'
import starIcon from '@/assets/img/icons/star.svg'
import logIcon from '@/assets/img/icons/logs.svg'

// Map icon strings to SVG file paths
const iconMap: Record<string, string> = {
  grid: gridIcon,
  tasks: tasksIcon,
  star: starIcon,
  log: logIcon,
}

const menuItems = computed(() =>
  STUDENT_MENU_ITEMS.map((item) => ({
    ...item,
    iconPath: iconMap[item.icon] || iconMap.grid,
  }))
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
  <div class="student-layout" :class="{ 'student-layout--sidebar-open': isSidebarOpen }">
    <!-- Overlay -->
    <Transition name="overlay">
      <div
        v-if="isSidebarOpen"
        class="student-layout__overlay"
        @click="closeSidebar"
      />
    </Transition>

    <!-- Sidebar -->
    <aside class="student-layout__sidebar">
      <div class="student-layout__sidebar-header">
        <AppLogo size="md" />
        <button
          class="student-layout__close-btn"
          @click="closeSidebar"
          aria-label="إغلاق القائمة"
        >
          <IconArrowLeft />
        </button>
      </div>

      <nav class="student-layout__nav">
        <button
          v-for="item in menuItems"
          :key="item.name"
          class="student-layout__nav-item"
          :class="{ 'student-layout__nav-item--active': isActiveRoute(item.name) }"
          @click="navigateTo(item.name)"
        >
          <img :src="item.iconPath" :alt="item.label" class="student-layout__nav-icon" />
          <span class="student-layout__nav-label">
            {{ item.label }}
          </span>
        </button>
      </nav>

      <!-- User Profile at Bottom -->
      <div class="student-layout__user-profile">
        <div class="student-layout__user-avatar">
          <span>
            {{ currentUser?.name?.charAt(0) || 'ط' }}
          </span>
        </div>
        <div class="student-layout__user-name">
          {{ currentUser?.name || 'طالب' }}
        </div>
        <button class="student-layout__logout-btn" @click="handleLogout" aria-label="تسجيل الخروج">
          <IconLogout class="student-layout__logout-icon" />
        </button>
      </div>
    </aside>

    <!-- Main area -->
    <div class="student-layout__main">
      <header class="student-layout__header">
        <div class="student-layout__header-content">
          <h1 class="student-layout__header-title">
            {{ STUDENT_LABELS.PAGE_TITLE }}
          </h1>

          <div class="student-layout__header-left">
            <button
              class="student-layout__toggle"
              type="button"
              aria-label="Toggle sidebar"
              @click="toggleSidebar"
            >
              <span class="student-layout__toggle-line" />
              <span class="student-layout__toggle-line" />
              <span class="student-layout__toggle-line" />
            </button>

            <div class="student-layout__header-actions">
              <button class="student-layout__action-btn" aria-label="Branch">
                <IconBranch />
              </button>
              <button class="student-layout__action-btn" aria-label="Refresh">
                <IconRefresh />
              </button>
              <button class="student-layout__action-btn student-layout__action-btn--with-label" aria-label="Leaderboard">
                <IconTrophy />
                <span>{{ STUDENT_LABELS.LEADERBOARD }}</span>
              </button>
              <button class="student-layout__action-btn student-layout__action-btn--with-label" aria-label="Request Permission">
                <IconPermission />
                <span>{{ STUDENT_LABELS.REQUEST_PERMISSION }}</span>
              </button>
              <NotificationBell :count="3" :has-notification="true" />
            </div>
          </div>
        </div>
      </header>

      <main class="student-layout__content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.student-layout {
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
      z-index: 1000;
    }
  }

  &--sidebar-open {
    @include sm-max {
      .student-layout__sidebar {
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
      
      .student-layout__nav-icon {
        filter: brightness(0) invert(1);
      }
    }
  }

  &__nav-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    display: block;
    transition: filter $transition-fast;
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
    padding-top: $spacing-4;

    @include sm-max {
      padding-top: 0;
    }
  }

  &__header {
    background-color: transparent;
    position: sticky;
    top: 0;
    z-index: var(--sidebar-z-index);
    border-bottom: none;
    margin-top: -$spacing-4;

    @include sm-max {
      z-index: 100;
      margin-top: 0;
      padding-top: 0;
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
    gap: $spacing-4;
    flex-wrap: wrap;

    @include sm-max {
      padding: $spacing-3 $spacing-4;
      gap: $spacing-2;
    }
  }

  &__header-left {
    display: flex;
    align-items: center;
    gap: $spacing-3;
    flex-wrap: wrap;

    @include sm-max {
      gap: $spacing-2;
      width: 100%;
      order: 2;
    }
  }

  &__header-actions {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    flex-wrap: wrap;

    @include sm-max {
      gap: $spacing-1;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      -ms-overflow-style: none;

      &::-webkit-scrollbar {
        display: none;
      }
    }
  }

  &__action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: $spacing-2;
    border-radius: $radius-full;
    border: none;
    background-color: rgba(224, 246, 255, 1);
    cursor: pointer;
    transition: all $transition-fast;
    min-width: 40px;
    height: 40px;
    flex-shrink: 0;

    &:hover {
      background-color: rgba(224, 246, 255, 0.8);
    }

    svg,
    img {
      width: 18px;
      height: 18px;
    }

    &--with-label {
      padding: $spacing-2 $spacing-4;
      gap: $spacing-2;
      min-width: auto;
      height: auto;

      @include sm-max {
        padding: $spacing-2;
        
        span {
          display: none;
        }
      }

      span {
        font-size: $font-size-sm;
        font-weight: $font-weight-medium;
        white-space: nowrap;
      }
    }

    @include sm-max {
      min-width: 36px;
      height: 36px;
      padding: $spacing-1;
    }
  }

  &__header-title {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
    margin: 0;
    text-align: right;
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
    background-color: $color-background-card;
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
