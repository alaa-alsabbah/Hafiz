<script setup lang="ts">
const currentYear = new Date().getFullYear()
const siteName = 'حافظ فرسان'
</script>

<template>
  <footer class="app-footer">
    <div class="app-footer__container">
      <p class="app-footer__copyright">
        © {{ currentYear }} {{ siteName }}. جميع الحقوق محفوظة
      </p>
      <div class="app-footer__links">
        <router-link to="/terms" class="app-footer__link">شروط الخدمة</router-link>
        <router-link to="/privacy" class="app-footer__link">الخصوصية</router-link>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.app-footer {
  background-color: #fff;
  padding: $spacing-6 $spacing-6;
  margin-top: auto;
  direction: rtl;

  &__container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: $spacing-4;

    @include md-max {
      flex-direction: column;
      text-align: center;
      gap: $spacing-3;
    }
  }

  &__links {
    display: flex;
    align-items: center;
    gap: $spacing-6;
  }

  &__link {
    font-size: $font-size-sm;
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color $transition-fast;

    &:hover {
      color: var(--color-primary);
    }
  }

  &__copyright {
    font-size: $font-size-sm;
    color: var(--color-text-muted);
    margin: 0;
  }
}
</style>
