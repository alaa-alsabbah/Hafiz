<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLogo from '@/components/common/AppLogo.vue'
import { IconGrid, IconGraduationCap, IconCalendar, IconUser, IconChevronUp, IconLogout } from '@/components/icons'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isSidebarOpen = ref(true)
const isMobileMenuOpen = ref(false)
const isStudentsDropdownOpen = ref(false)

const user = computed(() => authStore.currentUser)

// Get user initials for avatar
const userInitials = computed(() => {
  if (!user.value?.full_name) return 'AA'
  const names = user.value.full_name.split(' ')
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase()
  }
  return user.value.full_name.substring(0, 2).toUpperCase()
})

// Menu items based on the design
const menuItems = [
  {
    label: 'لوحة التحكم',
    path: '/teacher/dashboard',
    icon: 'grid',
    name: 'teacher-dashboard'
  },
  {
    label: 'الطلاب',
    path: '/teacher/students',
    icon: 'graduation',
    name: 'teacher-students',
    hasSubmenu: true,
    subItems: [
      {
        label: 'التقرير الأسبوعي',
        path: '/teacher/weekly-report',
        name: 'teacher-weekly-report'
      },
      {
        label: 'العرض والاختبار',
        path: '/teacher/presentation-test',
        name: 'teacher-presentation-test'
      },
      {
        label: 'الاستئذان',
        path: '/teacher/permission',
        name: 'teacher-permission'
      }
    ]
  },
  {
    label: 'تقييمات المقابلات',
    path: '/teacher/evaluations',
    icon: 'calendar',
    name: 'teacher-evaluations'
  },
  {
    label: 'المعلمين',
    path: '/teacher/teachers',
    icon: 'user',
    name: 'teacher-teachers'
  }
]

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

function navigateTo(path: string) {
  router.push(path)
  closeMobileMenu()
}

const isActiveRoute = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}

function toggleStudentsDropdown() {
  isStudentsDropdownOpen.value = !isStudentsDropdownOpen.value
}

const isStudentsActive = computed(() => {
  return isActiveRoute('/teacher/students') || 
         isActiveRoute('/teacher/weekly-report') ||
         isActiveRoute('/teacher/presentation-test') ||
         isActiveRoute('/teacher/permission')
})

// Auto-open dropdown if a sub-item route is active
watch(() => route.path, (newPath) => {
  if (newPath.startsWith('/teacher/students') || 
      newPath.startsWith('/teacher/weekly-report') || 
      newPath.startsWith('/teacher/presentation-test') || 
      newPath.startsWith('/teacher/permission')) {
    isStudentsDropdownOpen.value = true
  }
}, { immediate: true })
</script>

<template>
  <div class="teacher-layout">
    <!-- Desktop Sidebar -->
    <aside 
      class="teacher-layout__sidebar" 
      :class="{ 'teacher-layout__sidebar--collapsed': !isSidebarOpen }"
    >
      <div class="sidebar__header">
        <AppLogo size="md" />
      </div>

      <nav class="sidebar__nav">
        <template v-for="item in menuItems" :key="item.path">
          <!-- Menu item with dropdown -->
          <div v-if="item.hasSubmenu" class="sidebar__nav-dropdown">
            <button
              class="sidebar__nav-item"
              :class="{
                'sidebar__nav-item--active': isStudentsActive
              }"
              @click="toggleStudentsDropdown"
            >
              <span class="sidebar__nav-icon">
                <IconGraduationCap v-if="item.icon === 'graduation'" />
              </span>
              <span class="sidebar__nav-label">{{ item.label }}</span>
              <IconChevronUp 
                class="sidebar__nav-chevron"
                :class="{ 'sidebar__nav-chevron--rotated': !isStudentsDropdownOpen }"
              />
            </button>
            <!-- Submenu items -->
            <Transition name="dropdown">
              <div v-if="isStudentsDropdownOpen" class="sidebar__nav-submenu">
                <router-link
                  v-for="subItem in item.subItems"
                  :key="subItem.path"
                  :to="subItem.path"
                  class="sidebar__nav-subitem"
                  :class="{
                    'sidebar__nav-subitem--active': isActiveRoute(subItem.path)
                  }"
                >
                  <span class="sidebar__nav-label">{{ subItem.label }}</span>
                </router-link>
              </div>
            </Transition>
          </div>
          <!-- Regular menu item -->
          <router-link
            v-else
            :to="item.path"
            class="sidebar__nav-item"
            :class="{
              'sidebar__nav-item--active': isActiveRoute(item.path)
            }"
          >
            <span class="sidebar__nav-icon">
              <IconGrid v-if="item.icon === 'grid'" />
              <IconCalendar v-else-if="item.icon === 'calendar'" />
              <IconUser v-else-if="item.icon === 'user'" />
            </span>
            <span class="sidebar__nav-label">{{ item.label }}</span>
          </router-link>
        </template>
      </nav>

      <!-- User Profile Section -->
      <div class="sidebar__footer">
        <div class="sidebar__user">
          <div class="sidebar__user-avatar">{{ userInitials }}</div>
          <div class="sidebar__user-info">
            <span class="sidebar__user-name">{{ user?.full_name || 'أنس عبد الله' }}</span>
          </div>
          <button 
            class="sidebar__logout-btn"
            @click="handleLogout"
            aria-label="تسجيل الخروج"
          >
            <IconLogout />
          </button>
        </div>
      </div>
    </aside>

    <!-- Mobile Sidebar Overlay -->
    <Teleport to="body">
      <Transition name="sidebar">
        <div 
          v-if="isMobileMenuOpen" 
          class="sidebar-overlay" 
          @click="closeMobileMenu"
        >
          <aside 
            class="teacher-layout__sidebar teacher-layout__sidebar--mobile"
            @click.stop
          >
            <div class="sidebar__header">
              <AppLogo size="md" />
              <button 
                class="sidebar__close-btn"
                @click="closeMobileMenu"
                aria-label="إغلاق القائمة"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <nav class="sidebar__nav">
              <template v-for="item in menuItems" :key="item.path">
                <!-- Menu item with dropdown -->
                <div v-if="item.hasSubmenu" class="sidebar__nav-dropdown">
                  <button
                    class="sidebar__nav-item"
                    :class="{
                      'sidebar__nav-item--active': isStudentsActive
                    }"
                    @click="toggleStudentsDropdown"
                  >
                    <span class="sidebar__nav-icon">
                      <IconGraduationCap v-if="item.icon === 'graduation'" />
                    </span>
                    <span class="sidebar__nav-label">{{ item.label }}</span>
                    <IconChevronUp 
                      class="sidebar__nav-chevron"
                      :class="{ 'sidebar__nav-chevron--rotated': !isStudentsDropdownOpen }"
                    />
                  </button>
                  <!-- Submenu items -->
                  <Transition name="dropdown">
                    <div v-if="isStudentsDropdownOpen" class="sidebar__nav-submenu">
                      <button
                        v-for="subItem in item.subItems"
                        :key="subItem.path"
                        class="sidebar__nav-subitem"
                        :class="{
                          'sidebar__nav-subitem--active': isActiveRoute(subItem.path)
                        }"
                        @click="navigateTo(subItem.path)"
                      >
                        <span class="sidebar__nav-label">{{ subItem.label }}</span>
                      </button>
                    </div>
                  </Transition>
                </div>
                <!-- Regular menu item -->
                <button
                  v-else
                  class="sidebar__nav-item"
                  :class="{
                    'sidebar__nav-item--active': isActiveRoute(item.path)
                  }"
                  @click="navigateTo(item.path)"
                >
                  <span class="sidebar__nav-icon">
                    <IconGrid v-if="item.icon === 'grid'" />
                    <IconCalendar v-else-if="item.icon === 'calendar'" />
                    <IconUser v-else-if="item.icon === 'user'" />
                  </span>
                  <span class="sidebar__nav-label">{{ item.label }}</span>
                </button>
              </template>
            </nav>

            <div class="sidebar__footer">
              <div class="sidebar__user">
                <div class="sidebar__user-avatar">{{ userInitials }}</div>
                <div class="sidebar__user-info">
                  <span class="sidebar__user-name">{{ user?.full_name || 'أنس عبد الله' }}</span>
                </div>
                <button 
                  class="sidebar__logout-btn"
                  @click="handleLogout"
                  aria-label="تسجيل الخروج"
                >
                  <IconLogout />
                </button>
              </div>
            </div>
          </aside>
        </div>
      </Transition>
    </Teleport>

    <!-- Main Content Area -->
    <div class="teacher-layout__main">
      <!-- Mobile Header -->
      <header class="teacher-layout__header">
        <button 
          class="teacher-layout__menu-toggle"
          @click="toggleMobileMenu"
          aria-label="فتح القائمة"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </header>

      <!-- Content -->
      <main class="teacher-layout__content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.teacher-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--color-background-card);
  overflow-x: hidden;
  width: 100%;
  max-width: 100vw;
  position: relative;
  box-sizing: border-box;

  &__sidebar {
    width: var(--sidebar-width);
    min-width: var(--sidebar-width);
    max-width: var(--sidebar-width);
    background-color: var(--color-background-sidebar);
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow-md);
    transition: transform var(--transition-normal);
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    z-index: var(--sidebar-z-index);
    overflow-y: auto;
    overflow-x: hidden;

    @include lg-max {
      transform: translateX(100%);
      width: var(--sidebar-width);
    }

    &--mobile {
      position: fixed;
      transform: translateX(0);
    }

    &--collapsed {
      width: var(--sidebar-width-collapsed);
      min-width: var(--sidebar-width-collapsed);
      max-width: var(--sidebar-width-collapsed);

      .sidebar__nav-label {
        opacity: 0;
        width: 0;
        overflow: hidden;
      }

      .sidebar__user-name {
        opacity: 0;
        width: 0;
        overflow: hidden;
      }
    }
  }

  &__main {
    flex: 1;
    width: 100%;
    margin-right: var(--sidebar-width);
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    overflow-x: hidden;

    @include lg-max {
      margin-right: 0;
      width: 100%;
    }
  }

  &__header {
    display: flex;
    align-items: center;
    padding: var(--spacing-4) var(--spacing-6);
    background-color: var(--color-background-card);
    box-shadow: var(--shadow-sm);

    @include lg {
      display: none;
    }
  }

  &__menu-toggle {
    background: none;
    border: none;
    padding: var(--spacing-2);
    cursor: pointer;
    color: var(--color-text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__content {
    flex: 1;
    padding: var(--spacing-4);
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;

    @include md {
      padding: var(--spacing-4);
    }

    // @include lg {
    //   padding: var(--spacing-8);
    // }
  }
}

.sidebar__header {
  padding: var(--spacing-3);
  display: flex;
  align-items: center;
  justify-content: center !important;
  @include lg {
    justify-content: flex-start;
  }
}

.sidebar__close-btn {
  background: none;
  border: none;
  padding: var(--spacing-2);
  cursor: pointer;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: auto;

  @include lg {
    display: none;
  }
}

.sidebar__nav {
  flex: 1;
  padding: var(--spacing-3);
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
}

.sidebar__nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-4) var(--spacing-6);
  color: var(--color-text-primary);
  text-decoration: none;
  border: none;
  background: none;
  width: 100%;
  max-width: 100%;
  text-align: right;
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  margin: var(--spacing-1) 0;
  border-radius: var(--radius-lg);
  box-sizing: border-box;

  &:hover {
    background-color: var(--color-hover-primary);
    color: var(--color-primary);
    .sidebar__nav-icon{
      color: var(--color-primary);
    }
  }

  &--active {
    background-color: var(--color-primary);
    color: var(--color-text-inverse);
    font-weight: var(--font-weight-bold);
    margin: var(--spacing-1) var(--spacing-2);

    .sidebar__nav-icon {
      color: var(--color-text-inverse);
    }

    .sidebar__nav-chevron {
      color: var(--color-text-inverse);
      margin-left: 0;
      margin-right: auto;
    }
  }
}

.sidebar__nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--spacing-6);
  height: var(--spacing-6);
  flex-shrink: 0;
  color: var(--color-text-secondary);
}

.sidebar__nav-label {
  flex: 1;
  text-align: right;
  transition: opacity var(--transition-normal), width var(--transition-normal);
}

.sidebar__nav-chevron {
  width: var(--spacing-4);
  height: var(--spacing-4);
  flex-shrink: 0;
  margin-left: 0;
  margin-right: auto;
  color: var(--color-text-secondary);
  transition: transform var(--transition-fast);

  &--rotated {
    transform: rotate(180deg);
  }
}

.sidebar__nav-dropdown {
  margin: $spacing-1 0;

  .sidebar__nav-item {
    &--active {
      .sidebar__nav-chevron {
        color: #FFFFFF;
      }
    }
  }
}

.sidebar__nav-submenu {
  padding-right: var(--spacing-8);
  padding-top: var(--spacing-2);
  padding-bottom: var(--spacing-2);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.sidebar__nav-subitem {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  color: var(--color-text-primary);
  text-decoration: none;
  border: none;
  background: none;
  width: 100%;
  max-width: 100%;
  text-align: right;
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  border-radius: var(--radius-md);
  box-sizing: border-box;

  &:hover {
    background-color: var(--color-hover-primary);
  }

  &--active {
    background-color: var(--color-active-submenu);
    color: var(--color-primary);
    font-weight: var(--font-weight-medium);
  }

  .sidebar__nav-label {
    flex: 1;
    text-align: right;
  }
}

// Dropdown transition
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all var(--transition-normal);
  overflow: hidden;
}

.dropdown-enter-from {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.dropdown-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  max-height: 500px;
  transform: translateY(0);
}

.sidebar__footer {
  padding: var(--spacing-4);
  border-top: 1px solid var(--color-border);
}

.sidebar__user {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background-color: var(--color-background-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.sidebar__user-avatar {
  width: var(--spacing-10);
  height: var(--spacing-10);
  border-radius: var(--radius-full);
  background-color: var(--color-avatar-bg);
  color: var(--color-text-inverse);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  flex-shrink: 0;
}

.sidebar__user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.sidebar__user-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  transition: opacity var(--transition-normal), width var(--transition-normal);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar__logout-btn {
  background: none;
  border: none;
  padding: var(--spacing-2);
  cursor: pointer;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-fast);
  flex-shrink: 0;

  &:hover {
    color: var(--color-error);
  }

  svg {
    width: var(--spacing-5);
    height: var(--spacing-5);
  }
}

// Sidebar Overlay (Mobile)
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-hover-overlay);
  z-index: var(--sidebar-overlay-z-index);
  display: flex;
  overflow: hidden;

  @include lg {
    display: none;
  }
}

// Sidebar Transition
.sidebar-enter-active,
.sidebar-leave-active {
  transition: opacity var(--transition-normal);
}

.sidebar-enter-active .teacher-layout__sidebar,
.sidebar-leave-active .teacher-layout__sidebar {
  transition: transform var(--transition-normal);
}

.sidebar-enter-from,
.sidebar-leave-to {
  opacity: 0;
}

.sidebar-enter-from .teacher-layout__sidebar,
.sidebar-leave-to .teacher-layout__sidebar {
  transform: translateX(100%);
}
</style>
