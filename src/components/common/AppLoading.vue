<script setup lang="ts">
import logoImage from '@/assets/img/logo.png'

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  fullScreen?: boolean
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  text: 'جاري التحميل...',
  fullScreen: false
})

const sizes = {
  sm: '40px',
  md: '70px',
  lg: '90px',
  xl: '120px'
}
</script>

<template>
  <div 
    class="app-loading" 
    :class="{ 'app-loading--fullscreen': fullScreen }"
  >
    <div class="app-loading__container">
      <div class="app-loading__logo-wrapper">
        <div class="app-loading__logo-circle">
          <img 
            :src="logoImage" 
            alt="حافظ فرسان" 
            class="app-loading__logo"
            :style="{ width: sizes[size] }"
          />
        </div>
        <div class="app-loading__spinner">
          <div class="app-loading__spinner-ring"></div>
          <div class="app-loading__spinner-ring"></div>
          <div class="app-loading__spinner-ring"></div>
        </div>
      </div>
      <p v-if="text" class="app-loading__text">{{ text }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-8;
  min-height: 200px;
  background: transparent;

  &--fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100vh;
    background:
      radial-gradient(circle at top left, rgba(0, 153, 104, 0.12), transparent 55%),
      radial-gradient(circle at bottom right, rgba(19, 96, 71, 0.12), transparent 55%);
    backdrop-filter: blur(10px);
    z-index: 9999;
    min-height: 100vh;
    padding: 0;
  }
}

.app-loading__container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-6;
  animation: fadeInUp 0.6s ease-out 0.15s both;
}

.app-loading__logo-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-2;
}

.app-loading__logo-circle {
  position: relative;
  z-index: 2;
  animation: logoPulse 2s ease-in-out 0.25s infinite;
}

.app-loading__logo {
  width: 100%;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 8px 24px rgba(0, 153, 104, 0.35));
  animation: logoFloat 3s ease-in-out 0.25s infinite;
}

.app-loading__spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 140px;
  height: 140px;
  z-index: 1;
  pointer-events: none;
}

.app-loading__spinner-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top-color: rgba(255, 255, 255, 0.6);
  border-right-color: rgba(0, 153, 104, 0.25);
  border-radius: $radius-full;
  animation: spinnerRotate 1.5s linear infinite;

  &:nth-child(1) {
    animation-delay: 0s;
    border-top-color: rgba(0, 153, 104, 0.85);
    border-right-color: rgba(0, 153, 104, 0.4);
    opacity: 1;
  }

  &:nth-child(2) {
    animation-delay: 0.35s;
    border-top-color: rgba(0, 153, 104, 0.55);
    border-right-color: rgba(0, 153, 104, 0.25);
    opacity: 0.7;
    transform: scale(0.85);
  }

  &:nth-child(3) {
    animation-delay: 0.7s;
    border-top-color: rgba(0, 153, 104, 0.35);
    border-right-color: rgba(0, 153, 104, 0.15);
    opacity: 0.4;
    transform: scale(0.7);
  }
}

.app-loading__text {
  font-size: $font-size-lg;
  font-weight: $font-weight-medium;
  color: var(--color-text-primary);
  margin: 0;
  animation: textFade 1.6s ease-in-out infinite;
  text-align: center;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes logoFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes logoPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes spinnerRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes textFade {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}
</style>
