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
  IconChevronUp,
  IconChevronDown,
} from '@/components/icons'
import {
  ADMIN_MENU_ITEMS,
  ADMIN_LABELS,
  isParent,
  type AdminMenuEntry,
} from '@/config/admin.constants'

// Import SVG icons
import gridIcon from '@/assets/img/icons/SquaresFour.svg'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isSidebarOpen = ref(false)
const expandedParents = ref<Set<string>>(new Set())

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

// Expand parent when a child route is active
watch(
  () => route.name,
  (name) => {
    if (!name) return
    const nameStr = String(name)
    for (const item of ADMIN_MENU_ITEMS) {
      if (isParent(item) && item.children.some((c) => c.name === nameStr)) {
        expandedParents.value = new Set([...expandedParents.value, item.name])
        break
      }
    }
  },
  { immediate: true }
)

const pageTitle = computed(() => {
  const name = route.name ? String(route.name) : ''
  const findInItems = (items: AdminMenuEntry[]): string | null => {
    for (const item of items) {
      if (item.name === name) return item.label
      if (isParent(item) && item.children) {
        for (const child of item.children) {
          if (child.name === name) return child.label
        }
      }
    }
    return null
  }
  return findInItems(ADMIN_MENU_ITEMS) || ADMIN_LABELS.PAGE_TITLE
})

const isActiveRoute = (routeName: string) => {
  return route.name === routeName
}

const isParentActive = (item: AdminMenuEntry) => {
  if (!isParent(item)) return false
  return item.children.some((c) => c.name === route.name)
}

const isParentExpanded = (parentName: string) => expandedParents.value.has(parentName)

function toggleParent(parentName: string) {
  const next = new Set(expandedParents.value)
  if (next.has(parentName)) {
    next.delete(parentName)
  } else {
    next.add(parentName)
  }
  expandedParents.value = next
}

function navigateTo(routeName: string) {
  router.push({ name: routeName })
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

watch(isSidebarOpen, (isOpen) => {
  if (window.innerWidth < 768) {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="admin-layout" :class="{ 'admin-layout--sidebar-open': isSidebarOpen }">
    <Transition name="overlay">
      <div
        v-if="isSidebarOpen"
        class="admin-layout__overlay"
        @click="closeSidebar"
      />
    </Transition>

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
        <template v-for="item in menuItems" :key="item.name">
          <!-- Standalone item: لوحة التحكم, تقييمات المقابلات, المعلمين -->
          <button
            v-if="!isParent(item)"
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

          <!-- Parent الطلاب with children directly below (التقرير الأسبوعي, العرض والاختبار, الاستئذان) -->
          <div v-else class="admin-layout__nav-parent">
            <button
              class="admin-layout__nav-item admin-layout__nav-item--parent"
              :class="{ 'admin-layout__nav-item--active': isParentActive(item) }"
              @click="toggleParent(item.name)"
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
              <span class="admin-layout__nav-chevron">
                <IconChevronDown
                  v-if="!isParentExpanded(item.name)"
                  class="admin-layout__chevron-icon"
                />
                <IconChevronUp
                  v-else
                  class="admin-layout__chevron-icon"
                />
              </span>
            </button>
            <Transition name="expand">
              <div
                v-if="isParentExpanded(item.name)"
                class="admin-layout__nav-children"
              >
                <button
                  v-for="child in item.children"
                  :key="child.name"
                  class="admin-layout__nav-item admin-layout__nav-item--child"
                  :class="{ 'admin-layout__nav-item--active': isActiveRoute(child.name) }"
                  @click="navigateTo(child.name)"
                >
                  <component
                    :is="iconMap[child.icon]"
                    class="admin-layout__nav-icon"
                  />
                  <span class="admin-layout__nav-label">
                    {{ child.label }}
                  </span>
                </button>
              </div>
            </Transition>
          </div>
        </template>
      </nav>

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

    <div class="admin-layout__main">
      <header class="admin-layout__header">
        <div class="admin-layout__header-content">
          <h1 class="admin-layout__header-title">
            {{ pageTitle }}
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

  &__nav-parent {
    display: flex;
    flex-direction: column;
    gap: $spacing-1;
  }

  &__nav-children {
    display: flex;
    flex-direction: column;
    gap: $spacing-1;
    padding-right: $spacing-8;
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

    &--parent {
      justify-content: flex-start;
      cursor: pointer;
    }

    &--child {
      padding-right: $spacing-8;
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

  &__nav-chevron {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__chevron-icon {
    width: 16px;
    height: 16px;
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
    direction: ltr;
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
    }
  }

  &__header-title {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
    margin: 0;
    text-align: right;
    flex: 1;
    min-width: 0;

    @include sm-max {
      font-size: $font-size-xl;
      order: 1;
      width: 100%;
      margin-bottom: $spacing-2;
    }
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

    @include sm-max {
      padding: $spacing-4 $spacing-3;
      background-color: #F8FFFB;
    }
  }
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity $transition-normal;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.expand-enter-active,
.expand-leave-active {
  transition: all $transition-fast ease-out;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 200px;
}
</style>
