import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home'
  },
  // Auth routes (no layout, uses AuthLayout)
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { guest: true, layout: 'auth' }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('@/views/auth/ForgotPasswordView.vue'),
    meta: { guest: true, layout: 'auth' }
  },
  // Main routes (uses DefaultLayout)
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { layout: 'default' }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { guest: true, layout: 'default' }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true, layout: 'default' }
  },
  {
    path: '/programs',
    name: 'programs',
    component: () => import('@/views/HomeView.vue'), // placeholder
    meta: { requiresAuth: true, layout: 'default' }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/HomeView.vue'), // placeholder
    meta: { requiresAuth: true, layout: 'default' }
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('@/views/HomeView.vue'), // placeholder
    meta: { requiresAuth: true, layout: 'default' }
  },
  {
    path: '/terms',
    name: 'terms',
    component: () => import('@/views/HomeView.vue'), // placeholder
    meta: { layout: 'default' }
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: () => import('@/views/HomeView.vue'), // placeholder
    meta: { layout: 'default' }
  },
  {
    path: '/students',
    name: 'students',
    component: () => import('@/views/DashboardView.vue'), // placeholder
    meta: { requiresAuth: true, layout: 'default' }
  },
  {
    path: '/evaluations',
    name: 'evaluations',
    component: () => import('@/views/DashboardView.vue'), // placeholder
    meta: { requiresAuth: true, layout: 'default' }
  },
  {
    path: '/teachers',
    name: 'teachers',
    component: () => import('@/views/DashboardView.vue'), // placeholder
    meta: { requiresAuth: true, layout: 'default' }
  },
  // Student routes (uses StudentLayout)
  {
    path: '/student',
    redirect: '/student/dashboard'
  },
  {
    path: '/student/dashboard',
    name: 'student-dashboard',
    component: () => import('@/views/student/StudentDashboardView.vue'),
    meta: { requiresAuth: true, requiresRole: 'student', layout: 'student' }
  },
  {
    path: '/student/daily-tasks',
    name: 'student-daily-tasks',
    component: () => import('@/views/student/StudentDailyTasksView.vue'),
    meta: { requiresAuth: true, requiresRole: 'student', layout: 'student' }
  },
  {
    path: '/student/level-details',
    name: 'student-level-details',
    component: () => import('@/views/student/StudentLevelDetailsView.vue'),
    meta: { requiresAuth: true, requiresRole: 'student', layout: 'student' }
  },
  {
    path: '/student/activity-log',
    name: 'student-activity-log',
    component: () => import('@/views/student/StudentActivityLogView.vue'),
    meta: { requiresAuth: true, requiresRole: 'student', layout: 'student' }
  },
  // Teacher routes (uses TeacherLayout)
  {
    path: '/teacher',
    redirect: '/teacher/dashboard'
  },
  {
    path: '/teacher/dashboard',
    name: 'teacher-dashboard',
    component: () => import('@/views/teacher/TeacherDashboardView.vue'),
    meta: { requiresAuth: true, requiresRole: 'teacher', layout: 'teacher' }
  },
  {
    path: '/teacher/students',
    redirect: '/teacher/dashboard'
  },
  {
    path: '/teacher/weekly-report',
    name: 'teacher-weekly-report',
    component: () => {
      console.log('🔄 Router: Loading TeacherWeeklyReportView component')
      const component = import('@/views/teacher/TeacherWeeklyReportView.vue')
      component.then(() => console.log('✅ TeacherWeeklyReportView loaded successfully'))
      component.catch(err => {
        console.error('❌ Failed to load TeacherWeeklyReportView:', err)
        throw err
      })
      return component
    },
    meta: { requiresAuth: true, requiresRole: 'teacher', layout: 'teacher' }
  },
  {
    path: '/teacher/presentation-test',
    name: 'teacher-presentation-test',
    component: () => import('@/views/teacher/TeacherDashboardView.vue'), // placeholder
    meta: { requiresAuth: true, requiresRole: 'teacher', layout: 'teacher' }
  },
  {
    path: '/teacher/permission',
    name: 'teacher-permission',
    component: () => import('@/views/teacher/TeacherDashboardView.vue'), // placeholder
    meta: { requiresAuth: true, requiresRole: 'teacher', layout: 'teacher' }
  },
  {
    path: '/teacher/evaluations',
    name: 'teacher-evaluations',
    component: () => import('@/views/teacher/TeacherDashboardView.vue'), // placeholder
    meta: { requiresAuth: true, requiresRole: 'teacher', layout: 'teacher' }
  },
  {
    path: '/teacher/teachers',
    name: 'teacher-teachers',
    component: () => import('@/views/teacher/TeacherDashboardView.vue'), // placeholder
    meta: { requiresAuth: true, requiresRole: 'teacher', layout: 'teacher' }
  },
  // Admin routes (uses AdminLayout)
  {
    path: '/admin',
    redirect: '/admin/dashboard'
  },
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: () => import('@/views/admin/AdminDashboardView.vue'),
    meta: { requiresAuth: true, requiresRole: 'admin', layout: 'admin' }
  },
  {
    path: '/admin/students',
    name: 'admin-students',
    component: () => import('@/views/admin/AdminStudentsView.vue'),
    meta: { requiresAuth: true, requiresRole: 'admin', layout: 'admin' }
  },
  {
    path: '/admin/evaluations',
    name: 'admin-evaluations',
    component: () => import('@/views/admin/AdminInterviewAssessmentsView.vue'),
    meta: { requiresAuth: true, requiresRole: 'admin', layout: 'admin' }
  },
  {
    path: '/admin/teachers',
    name: 'admin-teachers',
    component: () => import('@/views/admin/AdminTeachersView.vue'),
    meta: { requiresAuth: true, requiresRole: 'admin', layout: 'admin' }
  },
  {
    path: '/admin/weekly-report',
    name: 'admin-weekly-report',
    component: () => import('@/views/admin/AdminWeeklyReportView.vue'),
    meta: { requiresAuth: true, requiresRole: 'admin', layout: 'admin' }
  },
  {
    path: '/admin/presentation-test',
    name: 'admin-presentation-test',
    component: () => import('@/views/admin/AdminPresentationTestView.vue'),
    meta: { requiresAuth: true, requiresRole: 'admin', layout: 'admin' }
  },
  {
    path: '/admin/permission',
    name: 'admin-permission',
    component: () => import('@/views/admin/AdminPermissionView.vue'),
    meta: { requiresAuth: true, requiresRole: 'admin', layout: 'admin' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
 // console.log('Router navigation:', { from: from.path, to: to.path, toName: to.name })
  const token = localStorage.getItem('access_token')
  const authStore = useAuthStore()
  
  // Ensure user is loaded from storage if token exists but user is not loaded
  authStore.initializeUser()
  
  const user = authStore.currentUser
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !token) {
    next({ name: 'login' })
    return
  }

  // Check if route requires specific role
  if (to.meta.requiresRole && user) {
    const requiredRole = to.meta.requiresRole as string
    if (user.role !== requiredRole) {
      // Redirect based on user role
      if (user.role === 'student') {
        next({ name: 'student-dashboard' })
      } else if (user.role === 'teacher') {
        next({ name: 'teacher-dashboard' })
      } else if (user.role === 'admin') {
        next({ name: 'admin-dashboard' })
      } else {
        next({ name: 'home' })
      }
      return
    }
  }

  // Redirect authenticated users away from guest pages
  if (to.meta.guest && token && to.name !== 'register') {
    // Redirect based on role
    if (user?.role === 'student') {
      next({ name: 'student-dashboard' })
    } else if (user?.role === 'teacher') {
      next({ name: 'teacher-dashboard' })
    } else if (user?.role === 'admin') {
      next({ name: 'admin-dashboard' })
    } else {
      next({ name: 'home' })
    }
    return
  }

  next()
})

export default router
