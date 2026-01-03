<script setup lang="ts">
import logoImage from '@/assets/img/logo.png'

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

withDefaults(defineProps<Props>(), {
  size: 'md'
})

const sizes = {
  sm: '60px',
  md: '100px',
  lg: '120px',
  xl: '160px'
}
</script>

<template>
  <div class="app-logo" :style="{ width: sizes[size] }">
    <img :src="logoImage" alt="حافظ فرسان" class="app-logo__img" />
  </div>
</template>

<style scoped>
.app-logo {
  display: inline-block;
}

.app-logo__img {
  width: 100%;
  height: auto;
  object-fit: contain;
}
</style>
