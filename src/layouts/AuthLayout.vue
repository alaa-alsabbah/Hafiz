<script setup lang="ts">
import loginImage from '@/assets/img/loginImage.png'
</script>

<template>
  <div class="auth-layout">
    <!-- Hero Section (Left side for RTL) -->
    <div class="auth-layout__hero">
      <div class="auth-layout__hero-content">
        <!-- Decorative circles behind image -->
        <div class="auth-layout__hero-decor">
          <div class="auth-layout__circle auth-layout__circle--1"></div>
          <div class="auth-layout__circle auth-layout__circle--2"></div>
          <div class="auth-layout__circle auth-layout__circle--3"></div>
        </div>
           
        <!-- Image -->
        <div class="auth-layout__illustration">
          <img :src="loginImage" alt="طفل يقرأ القرآن" class="auth-layout__image" />
        </div>  
      </div>
    </div>
    
    <!-- Form Section (Right side for RTL) -->
    <div class="auth-layout__form-section">
      <div class="auth-layout__form-container">
        <slot />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.auth-layout {
  display: flex;
  flex-direction: row-reverse; // RTL: Form on right, Image on left
  min-height: 100vh;
  background-color: var(--color-background);
  
  // Hero Section - LEFT side
  &__hero {
    display: none;
    width: 50%;
    position: relative;
    overflow: hidden;
    
    @include lg {
      display: block;
    }
  }
  
  &__hero-content {
    width: 100%;
    height: 100%;
    position: relative;
  }
  
  // Image - FULL background, BEHIND the circles
  &__illustration {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
  }
  
  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center bottom;
  }
  
  // Decorative circles - ABOVE the image
  &__hero-decor {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 2;
  }
  
  &__circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(2px);
    
    &--1 {
      width: 350px;
      height: 350px;
      top: -80px;
      left: -80px;
      animation: float 8s ease-in-out infinite;
    }
    
    &--2 {
      width: 250px;
      height: 250px;
      bottom: 15%;
      right: -60px;
      animation: float 6s ease-in-out infinite reverse;
    }
    
    &--3 {
      width: 180px;
      height: 180px;
      top: 35%;
      left: 5%;
      animation: float 7s ease-in-out infinite 1s;
    }
  }
  
  // Form Section - RIGHT side
  &__form-section {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: $spacing-6;
    background: linear-gradient(180deg, #F0F7F2 0%, #FFFFFF 50%);
    
    @include lg {
      padding: $spacing-12;
    }
  }
  
  &__form-container {
    width: 100%;
    max-width: 440px;
    animation: fadeIn 0.6s ease-out;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
