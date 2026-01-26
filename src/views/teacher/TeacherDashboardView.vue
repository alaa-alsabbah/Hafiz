<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import NotificationBell from '@/components/ui/NotificationBell.vue'
import StatCard from '@/components/ui/StatCard.vue'
import StudentsTable from '@/components/teacher/StudentsTable.vue'
import { 
  getStudents, 
  getStudentsByProgram
} from '@/services/teacher.service'
import { 
  DASHBOARD_LABELS, 
  ProgramId,
  StatCardType 
} from '@/config/teacher.constants'

const route = useRoute()

// Stats data
const stats = ref({
  [StatCardType.TOTAL_STUDENTS]: {
    value: 0,
    loading: true,
  },
  [StatCardType.ACTIVE_STUDENTS]: {
    value: 0,
    loading: false, // Static for now
  },
  [StatCardType.HAFIZA_PROGRAM]: {
    value: 0,
    loading: true,
  },
  [StatCardType.FURSAN_PROGRAM]: {
    value: 0,
    loading: true,
  },
})

const notificationCount = ref(3)
const hasNotification = ref(true)

// Fetch all students (total students)
async function fetchTotalStudents() {
  try {
    const response = await getStudents()
    if (response.success && response.data) {
      stats.value[StatCardType.TOTAL_STUDENTS].value = response.data.length
    }
  } catch (error) {
    console.error('Error fetching total students:', error)
  } finally {
    stats.value[StatCardType.TOTAL_STUDENTS].loading = false
  }
}

// Fetch Hafiza program students
async function fetchHafizaStudents() {
  try {
    const response = await getStudentsByProgram(ProgramId.HAFIZA)
    if (response.success && response.data) {
      stats.value[StatCardType.HAFIZA_PROGRAM].value = response.data.length
    }
  } catch (error) {
    console.error('Error fetching Hafiza students:', error)
  } finally {
    stats.value[StatCardType.HAFIZA_PROGRAM].loading = false
  }
}

// Fetch Fursan program students
async function fetchFursanStudents() {
  try {
    const response = await getStudentsByProgram(ProgramId.FURSAN)
    if (response.success && response.data) {
      stats.value[StatCardType.FURSAN_PROGRAM].value = response.data.length
    }
  } catch (error) {
    console.error('Error fetching Fursan students:', error)
  } finally {
    stats.value[StatCardType.FURSAN_PROGRAM].loading = false
  }
}

// Set active students (static for now)
function setActiveStudents() {
  stats.value[StatCardType.ACTIVE_STUDENTS].value = 7
}

function handleNotificationClick() {
  // Handle notification click
  console.log('Notification clicked')
}

// Fetch all data on mount
onMounted(async () => {
  console.log('📊 TeacherDashboardView mounted', {
    routeName: route.name,
    routePath: route.path
  })
  await Promise.all([
    fetchTotalStudents(),
    fetchHafizaStudents(),
    fetchFursanStudents(),
  ])
  setActiveStudents()
})
</script>

<template>
  <div class="teacher-dashboard" data-component="TeacherDashboardView">
    <!-- Top Section with Curved Corner -->
    <div class="teacher-dashboard__top-section">
      <div class="teacher-dashboard__top-content">

         <!-- Page Title (Right) -->
         <h1 class="teacher-dashboard__title" data-view="dashboard">
          {{ DASHBOARD_LABELS.PAGE_TITLE }}
        </h1>

        <!-- Notification Bell (Left) -->
        <div class="teacher-dashboard__notifications">
          <NotificationBell
            :count="notificationCount"
            :has-notification="hasNotification"
            @click="handleNotificationClick"
          />
        </div>

       
      </div>
    </div>

    <!-- Stats Cards Section -->
    <div class="teacher-dashboard__stats">
      <!-- Total Students Card -->
      <StatCard
        :value="stats[StatCardType.TOTAL_STUDENTS].value"
        :label="DASHBOARD_LABELS.STATS.TOTAL_STUDENTS.LABEL"
        :tag="DASHBOARD_LABELS.STATS.TOTAL_STUDENTS.TAG"
        :tag-color="DASHBOARD_LABELS.STATS.TOTAL_STUDENTS.TAG_COLOR"
        :loading="stats[StatCardType.TOTAL_STUDENTS].loading"
        :index="0"
      />

      <!-- Active Students Card -->
      <StatCard
        :value="stats[StatCardType.ACTIVE_STUDENTS].value"
        :label="DASHBOARD_LABELS.STATS.ACTIVE_STUDENTS.LABEL"
        :tag="DASHBOARD_LABELS.STATS.ACTIVE_STUDENTS.TAG"
        :tag-color="DASHBOARD_LABELS.STATS.ACTIVE_STUDENTS.TAG_COLOR"
        :loading="stats[StatCardType.ACTIVE_STUDENTS].loading"
        :index="1"
      />

      <!-- Hafiza Program Card -->
      <StatCard
        :value="stats[StatCardType.HAFIZA_PROGRAM].value"
        :label="DASHBOARD_LABELS.STATS.HAFIZA_PROGRAM.LABEL"
        :tag="DASHBOARD_LABELS.STATS.HAFIZA_PROGRAM.TAG"
        :tag-color="DASHBOARD_LABELS.STATS.HAFIZA_PROGRAM.TAG_COLOR"
        :loading="stats[StatCardType.HAFIZA_PROGRAM].loading"
        :index="2"
      />

      <!-- Fursan Program Card -->
      <StatCard
        :value="stats[StatCardType.FURSAN_PROGRAM].value"
        :label="DASHBOARD_LABELS.STATS.FURSAN_PROGRAM.LABEL"
        :tag="DASHBOARD_LABELS.STATS.FURSAN_PROGRAM.TAG"
        :tag-color="DASHBOARD_LABELS.STATS.FURSAN_PROGRAM.TAG_COLOR"
        :loading="stats[StatCardType.FURSAN_PROGRAM].loading"
        :index="3"
      />
    </div>

    <!-- Students Table Section -->
    <div class="teacher-dashboard__content">
      <StudentsTable />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.teacher-dashboard {
  width: 100%;
  min-height: 100vh;
  position: relative;

  &__top-section {
    margin-bottom: var(--spacing-4);
  }

  // &__top-section {
  //   position: relative;
  //   background-color: var(--color-background-sidebar);
  //   padding: var(--spacing-6) var(--spacing-8) var(--spacing-8);
  //   margin: calc(-1 * var(--spacing-6)) calc(-1 * var(--spacing-8)) var(--spacing-6);
  //   border-radius: 0 0 0 var(--radius-3xl);
  //   overflow: hidden;

  //   &::before {
  //     content: '';
  //     position: absolute;
  //     top: 0;
  //     right: 0;
  //     width: var(--spacing-16);
  //     height: var(--spacing-16);
  //     background: radial-gradient(
  //       circle at top right,
  //       var(--color-background-sidebar) 0%,
  //       var(--color-background-sidebar) 60%,
  //       transparent 100%
  //     );
  //     border-radius: 0 0 0 100%;
  //     z-index: 1;
  //   }

  //   &::after {
  //     content: '';
  //     position: absolute;
  //     top: 0;
  //     right: 0;
  //     width: var(--spacing-12);
  //     height: var(--spacing-12);
  //     background: linear-gradient(
  //       135deg,
  //       var(--color-primary-lighter) 0%,
  //       transparent 100%
  //     );
  //     border-radius: 0 0 0 100%;
  //     z-index: 0;
  //   }
  // }

  &__top-content {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-4);
  }

  &__notifications {
    display: flex;
    align-items: center;
  }

  &__title {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin: 0;
    text-align: right;
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-6);
    margin-bottom: var(--spacing-4);

    @include md {
      grid-template-columns: repeat(2, 1fr);
    }

    @include lg {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  &__content {
    background-color: var(--color-background-card);
    border-radius: var(--radius-xl);
    padding: var(--spacing-2);
    box-shadow: var(--shadow-md);
  }
}
</style>
