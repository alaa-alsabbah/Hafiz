<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import NotificationBell from '@/components/ui/NotificationBell.vue'
import StatCard from '@/components/ui/StatCard.vue'
import WeeklyReportTable from '@/components/teacher/WeeklyReportTable.vue'
import { 
  getStudents,
  getStudentAttendance,
  type Student,
  type AttendanceRecord
} from '@/services/teacher.service'
import { 
  WEEKLY_REPORT_LABELS
} from '@/config/teacher.constants'

const route = useRoute()

// Stats data
const stats = ref({
  totalAttendance: {
    value: 0,
    loading: true,
  },
  totalAbsence: {
    value: 0,
    loading: true,
  },
  totalDelay: {
    value: 0,
    loading: true,
  },
  totalPermission: {
    value: 0,
    loading: true,
  },
})

const notificationCount = ref(3)
const hasNotification = ref(true)

// Students and attendance data
const students = ref<Student[]>([])
const allAttendanceRecords = ref<Map<number, AttendanceRecord[]>>(new Map())
const loading = ref(false)

// Calculate stats from attendance records
function calculateStats() {
  let present = 0
  let absent = 0
  let delayed = 0
  let permission = 0

  allAttendanceRecords.value.forEach((records) => {
    records.forEach((record) => {
      switch (record.status) {
        case 'حاضر':
          present++
          break
        case 'غائب':
          absent++
          break
        case 'مؤجل':
          delayed++
          break
        case 'مستأذن':
          permission++
          break
      }
    })
  })

  stats.value.totalAttendance.value = present
  stats.value.totalAbsence.value = absent
  stats.value.totalDelay.value = delayed
  stats.value.totalPermission.value = permission

  // Mark loading as false
  stats.value.totalAttendance.loading = false
  stats.value.totalAbsence.loading = false
  stats.value.totalDelay.loading = false
  stats.value.totalPermission.loading = false
}

// Fetch all students
async function fetchStudents() {
  loading.value = true
  try {
    const response = await getStudents()
    if (response.success && response.data) {
      students.value = response.data
      // Fetch attendance for all students
      await fetchAllAttendance()
    }
  } catch (error) {
    console.error('Error fetching students:', error)
    // Mark loading as false even on error
    stats.value.totalAttendance.loading = false
    stats.value.totalAbsence.loading = false
    stats.value.totalDelay.loading = false
    stats.value.totalPermission.loading = false
  } finally {
    loading.value = false
  }
}

// Fetch attendance for all students
async function fetchAllAttendance() {
  const attendancePromises = students.value.map(async (student) => {
    try {
      const response = await getStudentAttendance(student.id)
      if (response.success && response.data) {
        allAttendanceRecords.value.set(student.id, response.data)
      }
    } catch (error) {
      console.error(`Error fetching attendance for student ${student.id}:`, error)
      allAttendanceRecords.value.set(student.id, [])
    }
  })

  await Promise.all(attendancePromises)
  calculateStats()
}

function handleNotificationClick() {
  // Handle notification click
  console.log('Notification clicked')
}

// Fetch all data on mount
onMounted(async () => {
  console.log('✅✅✅ TeacherWeeklyReportView MOUNTED!', {
    routeName: route.name,
    routePath: route.path,
    routeFullPath: route.fullPath
  })
  await fetchStudents()
})
</script>

<template>
  <div class="teacher-weekly-report" data-component="TeacherWeeklyReportView">
    <!-- Top Section with Curved Corner -->
    <div class="teacher-weekly-report__top-section">
      <div class="teacher-weekly-report__top-content">

         <!-- Page Title (Right) -->
         <h1 class="teacher-weekly-report__title" data-view="weekly-report">
          {{ WEEKLY_REPORT_LABELS.PAGE_TITLE }}
        </h1>

        <!-- Notification Bell (Left) -->
        <div class="teacher-weekly-report__notifications">
          <NotificationBell
            :count="notificationCount"
            :has-notification="hasNotification"
            @click="handleNotificationClick"
          />
        </div>

       
      </div>
    </div>

    <!-- Stats Cards Section -->
    <div class="teacher-weekly-report__stats">
      <!-- Total Attendance Card -->
      <StatCard
        :value="stats.totalAttendance.value"
        :label="WEEKLY_REPORT_LABELS.STATS.TOTAL_ATTENDANCE.LABEL"
        :tag="WEEKLY_REPORT_LABELS.STATS.TOTAL_ATTENDANCE.TAG"
        :tag-color="WEEKLY_REPORT_LABELS.STATS.TOTAL_ATTENDANCE.TAG_COLOR"
        :loading="stats.totalAttendance.loading"
        :index="0"
      />

      <!-- Total Absence Card -->
      <StatCard
        :value="stats.totalAbsence.value"
        :label="WEEKLY_REPORT_LABELS.STATS.TOTAL_ABSENCE.LABEL"
        :tag="WEEKLY_REPORT_LABELS.STATS.TOTAL_ABSENCE.TAG"
        :tag-color="WEEKLY_REPORT_LABELS.STATS.TOTAL_ABSENCE.TAG_COLOR"
        :loading="stats.totalAbsence.loading"
        :index="1"
      />

      <!-- Total Delay Card -->
      <StatCard
        :value="stats.totalDelay.value"
        :label="WEEKLY_REPORT_LABELS.STATS.TOTAL_DELAY.LABEL"
        :tag="WEEKLY_REPORT_LABELS.STATS.TOTAL_DELAY.TAG"
        :tag-color="WEEKLY_REPORT_LABELS.STATS.TOTAL_DELAY.TAG_COLOR"
        :loading="stats.totalDelay.loading"
        :index="2"
      />

      <!-- Total Permission Card -->
      <StatCard
        :value="stats.totalPermission.value"
        :label="WEEKLY_REPORT_LABELS.STATS.TOTAL_PERMISSION.LABEL"
        :tag="WEEKLY_REPORT_LABELS.STATS.TOTAL_PERMISSION.TAG"
        :tag-color="WEEKLY_REPORT_LABELS.STATS.TOTAL_PERMISSION.TAG_COLOR"
        :loading="stats.totalPermission.loading"
        :index="3"
      />
    </div>

    <!-- Weekly Report Table Section -->
    <div class="teacher-weekly-report__content">
      <WeeklyReportTable 
        :students="students"
        :attendance-records="allAttendanceRecords"
        :loading="loading"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.teacher-weekly-report {
  width: 100%;
  min-height: 100vh;
  position: relative;

  &__top-section {
    margin-bottom: var(--spacing-4);
  }

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
