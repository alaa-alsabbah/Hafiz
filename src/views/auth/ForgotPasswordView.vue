<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { BaseInput, BaseButton } from '@/components/ui'
import { IconMail, IconArrowLeft } from '@/components/icons'
import AppLogo from '@/components/common/AppLogo.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

const router = useRouter()

const form = reactive({ email: '' })
const emailError = ref('')
const isSubmitting = ref(false)
const isSuccess = ref(false)

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateForm(): boolean {
  emailError.value = ''
  
  if (!form.email) {
    emailError.value = 'يرجى إدخال البريد الإلكتروني'
    return false
  }
  
  if (!isValidEmail(form.email)) {
    emailError.value = 'يرجى إدخال بريد إلكتروني صحيح'
    return false
  }
  
  return true
}

async function handleSubmit(): Promise<void> {
  if (!validateForm()) return
  
  isSubmitting.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    isSuccess.value = true
  } finally {
    isSubmitting.value = false
  }
}

function goToLogin(): void {
  router.push({ name: 'login' })
}
</script>

<template>
  <AuthLayout>
    <div class="forgot-password-view">
      <div class="forgot-password-view__logo">
        <AppLogo size="lg" />
      </div>
      
      <template v-if="isSuccess">
        <div class="forgot-password-view__success">
          <div class="forgot-password-view__success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
          </div>
          <h2 class="forgot-password-view__success-title">تم إرسال الرابط</h2>
          <p class="forgot-password-view__success-text">
            تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني
            <strong>{{ form.email }}</strong>
          </p>
          <BaseButton variant="primary" size="lg" block @click="goToLogin">
            العودة لتسجيل الدخول
          </BaseButton>
        </div>
      </template>
      
      <template v-else>
        <div class="forgot-password-view__header">
          <h1 class="forgot-password-view__title">نسيت كلمة المرور؟</h1>
          <p class="forgot-password-view__subtitle">
            أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور
          </p>
        </div>
        
        <form class="forgot-password-view__form" @submit.prevent="handleSubmit">
          <BaseInput
            v-model="form.email"
            type="email"
            label="عنوان البريد الإلكتروني"
            placeholder="admin@hafizfursan.org"
            :error="emailError"
            autocomplete="email"
          >
            <template #suffix>
              <IconMail />
            </template>
          </BaseInput>
          
          <BaseButton type="submit" variant="primary" size="lg" block :loading="isSubmitting">
            إرسال رابط الاستعادة
          </BaseButton>
        </form>
      </template>
      
      <button type="button" class="forgot-password-view__back-link" @click="goToLogin">
        <IconArrowLeft class="forgot-password-view__back-icon" />
        <span>العودة لتسجيل الدخول</span>
      </button>
    </div>
  </AuthLayout>
</template>

<style lang="scss" scoped>
.forgot-password-view {
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
    max-width: 320px;
  }
  
  &__form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: $spacing-5;
    animation: fadeInUp 0.5s ease-out 0.2s both;
  }
  
  &__success {
    text-align: center;
    animation: fadeIn 0.5s ease-out;
    width: 100%;
  }
  
  &__success-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: var(--color-primary-lighter);
    color: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto $spacing-6;
    
    svg {
      width: 40px;
      height: 40px;
    }
  }
  
  &__success-title {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
    margin-bottom: $spacing-3;
  }
  
  &__success-text {
    font-size: $font-size-base;
    color: var(--color-text-secondary);
    margin-bottom: $spacing-6;
    
    strong {
      color: var(--color-text-primary);
      display: block;
      margin-top: $spacing-1;
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
