<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useValidation, rules } from '@/composables/useValidation'
import { BaseInput, BaseButton, BaseCheckbox } from '@/components/ui'
import { IconMail, IconLock, IconArrowLeft } from '@/components/icons'
import AppLogo from '@/components/common/AppLogo.vue'

const router = useRouter()
const authStore = useAuthStore()

const { form, errors, validate } = useValidation(
  { email: '', password: '' },
  {
    email: [rules.required('يرجى إدخال البريد الإلكتروني'), rules.email()],
    password: [rules.required('يرجى إدخال كلمة المرور'), rules.minLength(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل')]
  }
)

const rememberMe = ref(false)
const isSubmitting = ref(false)

onMounted(() => {
  const rememberedEmail = localStorage.getItem('rememberedEmail')
  if (rememberedEmail) {
    form.email = rememberedEmail
    rememberMe.value = true
  }
})

async function handleSubmit(): Promise<void> {
  if (!validate()) return
  
  isSubmitting.value = true
  
  try {
    const result = await authStore.login({
      email: form.email,
      password: form.password,
      rememberMe: rememberMe.value
    })
    
    if (result.success) {
      // Get user from result or store (result.user is more reliable)
      const user = result.user || authStore.currentUser
      
      // Redirect based on user role
      if (user?.role === 'teacher') {
        router.push({ name: 'teacher-dashboard' })
      } else if (user?.role === 'student') {
        // If student role exists, redirect to student dashboard
        router.push({ name: 'dashboard' })
      } else {
        // Default to home for other roles or no role
        router.push({ name: 'home' })
      }
    }
  } finally {
    isSubmitting.value = false
  }
}

function goToForgotPassword(): void {
  router.push({ name: 'forgot-password' })
}
</script>

<template>
  <div class="login-view">
      <div class="login-view__logo">
        <AppLogo size="lg" />
      </div>
      
      <div class="login-view__header">
        <h1 class="login-view__title">مرحبًا بعودتك</h1>
        <p class="login-view__subtitle">قم بتسجيل الدخول للوصول إلى لوحة التحكم الإدارية</p>
      </div>
      
      <form class="login-view__form" @submit.prevent="handleSubmit">
        <BaseInput
          v-model="form.email"
          type="email"
          label="عنوان البريد الإلكتروني"
          placeholder="admin@hafizfursan.org"
          :error="errors.email"
          autocomplete="email"
        >
          <template #suffix>
            <IconMail />
          </template>
        </BaseInput>
        
        <BaseInput
          v-model="form.password"
          type="password"
          label="كلمة المرور"
          placeholder="أدخل كلمة المرور الخاصة بك"
          :error="errors.password"
          autocomplete="current-password"
        >
          <template #prefix>
            <IconLock />
          </template>
        </BaseInput>
        
        <div class="login-view__remember">
          <BaseCheckbox v-model="rememberMe" label="تذكرني" />
        </div>
        
        <div v-if="authStore.error" class="login-view__error">
          {{ authStore.error }}
        </div>
        
        <BaseButton
          type="submit"
          variant="primary"
          size="lg"
          block
          :loading="isSubmitting"
        >
          <span>تسجيل الدخول</span>
          <template #trailing>
            <IconArrowLeft />
          </template>
        </BaseButton>
        
        <button type="button" class="login-view__forgot-link" @click="goToForgotPassword">
          نسيت كلمة المرور؟
        </button>
      </form>
      
    <button type="button" class="login-view__back-link" @click="router.push('/')">
      <IconArrowLeft class="login-view__back-icon" />
      <span>العودة إلى الصفحة الرئيسية</span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.login-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  &__logo {
    margin-bottom: $spacing-6;
    animation: fadeInDown 0.5s ease-out;
  }
  
  &__header {
    text-align: center;
    margin-bottom: $spacing-8;
    animation: fadeInDown 0.5s ease-out 0.1s both;
  }
  
  &__title {
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
    margin-bottom: $spacing-2;
    
    @include md {
      font-size: $font-size-4xl;
    }
  }
  
  &__subtitle {
    font-size: $font-size-base;
    color: var(--color-text-secondary);
    margin: 0;
  }
  
  &__form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: $spacing-5;
    animation: fadeInUp 0.5s ease-out 0.2s both;
  }
  
  &__remember {
    display: flex;
    justify-content: flex-end;
    margin-top: -$spacing-2;
  }
  
  &__error {
    padding: $spacing-3 $spacing-4;
    background-color: rgba(220, 53, 69, 0.1);
    border: 1px solid rgba(220, 53, 69, 0.2);
    border-radius: $radius-md;
    color: var(--color-error);
    font-size: $font-size-sm;
    text-align: center;
  }
  
  &__forgot-link {
    background: none;
    border: none;
    color: var(--color-primary);
    font-family: var(--font-family);
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    padding: $spacing-2;
    margin: 0 auto;
    transition: color $transition-fast;
    
    &:hover {
      color: var(--color-primary-dark);
      text-decoration: underline;
    }
  }
  
  &__back-link {
    display: inline-flex;
    align-items: center;
    gap: $spacing-2;
    background: none;
    border: none;
    color: var(--color-text-secondary);
    font-family: var(--font-family);
    font-size: $font-size-sm;
    cursor: pointer;
    padding: $spacing-3;
    margin-top: $spacing-6;
    transition: color $transition-fast;
    animation: fadeIn 0.5s ease-out 0.3s both;
    
    &:hover {
      color: var(--color-text-primary);
    }
  }
  
  &__back-icon {
    width: 16px;
    height: 16px;
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
