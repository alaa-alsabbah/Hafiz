<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLogo from '@/components/common/AppLogo.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import { BaseButton } from '@/components/ui'
import RegistrationTypeDialog from '@/components/common/RegistrationTypeDialog.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isMobileMenuOpen = ref(false)
const showRegistrationDialog = ref(false)

const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentUser = computed(() => authStore.currentUser)

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

function openRegistrationDialog() {
  showRegistrationDialog.value = true
  closeMobileMenu()
}

function navigateTo(path: string) {
  if (path === '/register') {
    openRegistrationDialog()
  } else {
    router.push(path)
    closeMobileMenu()
  }
}

function handleLogout() {
  authStore.logout()
  router.push({ name: 'home' })
}

const navItems = [
  { name: 'الرئيسية', path: '/home', routeName: 'home' },
  { name: 'البرامج', path: '/programs', routeName: 'programs' },
  { name: 'من نحن', path: '/about', routeName: 'about' },
  { name: 'اتصل بنا', path: '/contact', routeName: 'contact' }
]

const isActiveRoute = (routeName: string) => {
  return route.name === routeName
}
</script>

<template>
  <div class="default-layout">
    <!-- Header -->
    <header class="default-layout__header">
      <div class="header__container">
        <div class="header__logo">
          <router-link to="/home" @click="closeMobileMenu">
            <AppLogo size="md" />
          </router-link>
        </div>

        <!-- Desktop Navigation -->
        <nav class="header__nav header__nav--desktop">
          <router-link
            v-for="item in navItems"
            :key="item.routeName"
            :to="item.path"
            class="header__nav-link"
            :class="{ 'header__nav-link--active': isActiveRoute(item.routeName) }"
          >
            {{ item.name }}
          </router-link>
        </nav>

        <!-- Desktop Actions -->
        <div class="header__actions header__actions--desktop">
          <template v-if="!isAuthenticated">
            <BaseButton
              variant="outline"
              size="sm"
              @click="navigateTo('/login')"
            >
              تسجيل الدخول
            </BaseButton>
            <BaseButton
              variant="primary"
              size="sm"
              @click="navigateTo('/register')"
            >
              سجل الآن
            </BaseButton>
          </template>
          <template v-else>
            <div class="header__user-info">
              <span class="header__user-name">{{ currentUser?.name || 'المستخدم' }}</span>
              <BaseButton
                variant="outline"
                size="sm"
                @click="handleLogout"
              >
                تسجيل الخروج
              </BaseButton>
            </div>
          </template>
        </div>

        <!-- Mobile Menu Button -->
        <button
          class="header__menu-toggle"
          @click="toggleMobileMenu"
          aria-label="Toggle menu"
        >
          <svg
            v-if="!isMobileMenuOpen"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <svg
            v-else
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <!-- Mobile Navigation -->
      <Transition name="mobile-menu">
        <nav
          v-if="isMobileMenuOpen"
          class="header__nav header__nav--mobile"
        >
          <router-link
            v-for="item in navItems"
            :key="item.routeName"
            :to="item.path"
            class="header__nav-link"
            :class="{ 'header__nav-link--active': isActiveRoute(item.routeName) }"
            @click="closeMobileMenu"
          >
            {{ item.name }}
          </router-link>
          <div class="header__actions header__actions--mobile">
            <template v-if="!isAuthenticated">
              <BaseButton
                variant="outline"
                size="sm"
                @click="navigateTo('/login')"
              >
                تسجيل الدخول
              </BaseButton>
              <BaseButton
                variant="primary"
                size="sm"
                @click="navigateTo('/register')"
              >
                سجل الآن
              </BaseButton>
            </template>
            <template v-else>
              <div class="header__user-info">
                <span class="header__user-name">{{ currentUser?.name || 'المستخدم' }}</span>
                <BaseButton
                  variant="outline"
                  size="sm"
                  @click="handleLogout"
                >
                  تسجيل الخروج
                </BaseButton>
              </div>
            </template>
          </div>
        </nav>
      </Transition>
    </header>

    <!-- Main Content -->
    <main class="default-layout__content">
      <slot />
    </main>

    <!-- Footer: Simple footer when authenticated, full footer when guest -->
    <AppFooter v-if="isAuthenticated" />
    <footer v-else class="default-layout__footer">
      <div class="footer__container">
        <div class="footer__content">
          <div class="footer__section">
            <AppLogo size="md" />
            <p class="footer__description">
              نظام متكامل لإدارة حلقات تحفيظ القرآن الكريم
            </p>
          </div>
          <div class="footer__section">
            <h3 class="footer__title">روابط سريعة</h3>
            <ul class="footer__links">
              <li>
                <router-link to="/home" class="footer__link">الرئيسية</router-link>
              </li>
              <li>
                <router-link to="/programs" class="footer__link">البرامج</router-link>
              </li>
              <li>
                <router-link to="/about" class="footer__link">من نحن</router-link>
              </li>
              <li>
                <router-link to="/contact" class="footer__link">اتصل بنا</router-link>
              </li>
            </ul>
          </div>
          <div class="footer__section">
            <h3 class="footer__title">تواصل معنا</h3>
            <ul class="footer__links">
              <li>
                <a href="mailto:info@hafizfursan.com" class="footer__link">البريد الإلكتروني</a>
              </li>
              <li>
                <a href="tel:+966123456789" class="footer__link">الهاتف</a>
              </li>
            </ul>
          </div>
        </div>
        <div class="footer__bottom">
          <p class="footer__copyright">
            © {{ new Date().getFullYear() }} حافظ فرسان. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>

    <!-- Registration Type Dialog -->
    <RegistrationTypeDialog v-model="showRegistrationDialog" />
  </div>
</template>

<style lang="scss" scoped>
.default-layout {
  min-height: 100vh;
  background-color: var(--color-background);
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.default-layout__header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
}

.header__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: $spacing-4 $spacing-6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-6;

  @include md-max {
    padding: $spacing-3 $spacing-4;
  }
}

.header__logo {
  flex-shrink: 0;

  a {
    display: flex;
    align-items: center;
    text-decoration: none;
  }
}

.header__nav {
  display: flex;
  align-items: center;
  gap: $spacing-6;

  &--desktop {
    @include md-max {
      display: none;
    }
  }

  &--mobile {
    display: none;
    flex-direction: column;
    padding: $spacing-4;
    background: #fff;
    border-top: 1px solid var(--color-border);
    gap: $spacing-2;

    @include md-max {
      display: flex;
    }
  }
}

.header__nav-link {
  color: var(--color-text-primary);
  text-decoration: none;
  font-weight: $font-weight-medium;
  font-size: $font-size-base;
  padding: $spacing-2 $spacing-3;
  border-radius: $radius-md;
  transition: all $transition-fast;
  position: relative;

  &:hover {
    color: var(--color-primary);
    background: var(--color-primary-lighter);
  }

  &--active {
    color: var(--color-primary);
    font-weight: $font-weight-bold;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      right: $spacing-3;
      left: $spacing-3;
      height: 2px;
      background: var(--color-primary);
      border-radius: 2px;
    }
  }
}

.header__actions {
  display: flex;
  align-items: center;
  gap: $spacing-3;

  &--desktop {
    @include md-max {
      display: none;
    }
  }

  &--mobile {
    display: none;
    flex-direction: column;
    width: 100%;
    margin-top: $spacing-4;
    padding-top: $spacing-4;
    border-top: 1px solid var(--color-border);
    gap: $spacing-3;

    @include md-max {
      display: flex;
    }
  }
}

.header__user-info {
  display: flex;
  align-items: center;
  gap: $spacing-3;
}

.header__user-name {
  font-size: $font-size-sm;
  color: var(--color-text-primary);
  font-weight: $font-weight-medium;
}

.header__menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: $spacing-2;
  color: var(--color-text-primary);
  transition: color $transition-fast;

  &:hover {
    color: var(--color-primary);
  }

  @include md-max {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all $transition-normal;
  max-height: 500px;
  overflow: hidden;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  max-height: 0;
  opacity: 0;
}

.default-layout__content {
  flex: 1;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

.default-layout__footer {
  background: var(--color-background-card);
  border-top: 1px solid var(--color-border);
  margin-top: auto;
  padding: $spacing-12 0 $spacing-6;
}

.footer__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $spacing-6;
}

.footer__content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-8;
  margin-bottom: $spacing-8;

  @include md-max {
    grid-template-columns: 1fr;
    gap: $spacing-6;
  }
}

.footer__section {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
}

.footer__description {
  font-size: $font-size-sm;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0;
}

.footer__title {
  font-size: $font-size-base;
  font-weight: $font-weight-bold;
  color: var(--color-text-primary);
  margin: 0 0 $spacing-2;
}

.footer__links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}

.footer__link {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: $font-size-sm;
  transition: color $transition-fast;

  &:hover {
    color: var(--color-primary);
  }
}

.footer__bottom {
  padding-top: $spacing-6;
  border-top: 1px solid var(--color-border);
  text-align: center;
}

.footer__copyright {
  font-size: $font-size-sm;
  color: var(--color-text-muted);
  margin: 0;
}
</style>
