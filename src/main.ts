import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { setRefreshFailureCallback } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

import './assets/styles/main.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// Register refresh failure callback - when refresh token fails, logout and redirect to login
const authStore = useAuthStore()
setRefreshFailureCallback(() => {
  authStore.logout()
  router.push({ name: 'login' })
})
