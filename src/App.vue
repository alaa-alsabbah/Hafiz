<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import TeacherLayout from '@/layouts/TeacherLayout.vue'

const route = useRoute()

const layout = computed(() => {
  const layoutType = route.meta.layout || 'default'
  
  if (layoutType === 'auth') {
    return AuthLayout
  } else if (layoutType === 'teacher') {
    return TeacherLayout
  } else {
    return DefaultLayout
  }
})

const routerViewKey = computed(() => {
  const routeName = route.name ? String(route.name) : ''
  return `view-${routeName}-${route.path}`
})
</script>

<template>
  <component :is="layout">
    <RouterView :key="routerViewKey" />
  </component>
</template>
