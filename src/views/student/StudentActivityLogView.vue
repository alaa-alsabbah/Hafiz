<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { STUDENT_LABELS, ACTIVITY_LOG_LABELS } from '@/config/student.constants'
import { getStudentCalendar, type CalendarEntry } from '@/services/student.service'
import IconArrowLeft from '@/components/icons/IconArrowLeft.vue'
import IconArrowRight from '@/components/icons/IconArrowRight.vue'
import AppLoading from '@/components/common/AppLoading.vue'

// Status priority: اترك (worst) > متأخر > تم الإرسال (best)
const STATUS_PRIORITY: Record<string, number> = {
  'اترك': 3,
  'متأخر': 2,
  'تم الإرسال': 1,
}

const STATUS_COLORS: Record<string, string> = {
  'تم الإرسال': 'submitted',
  'متأخر': 'late',
  'اترك': 'leave',
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const currentDate = ref(new Date())
const calendarData = ref<CalendarEntry[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Build date map: for each date, keep the "worst" status when multiple entries exist
const dateStatusMap = computed(() => {
  const map = new Map<string, string>()
  for (const entry of calendarData.value) {
    const existing = map.get(entry.due_date)
    const existingPriority = existing ? STATUS_PRIORITY[existing] ?? 0 : 0
    const newPriority = STATUS_PRIORITY[entry.status] ?? 0
    if (newPriority >= existingPriority) {
      map.set(entry.due_date, entry.status)
    }
  }
  return map
})

// Get start and end dates for API based on displayed month
function getDateRangeForMonth(year: number, month: number): { start_date: string; end_date: string } {
  const today = new Date()
  const startDate = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const endDate =
    year === today.getFullYear() && month === today.getMonth()
      ? today
      : lastDay

  const format = (d: Date) => d.toISOString().slice(0, 10)
  return {
    start_date: format(startDate),
    end_date: format(endDate),
  }
}

async function fetchCalendarData() {
  loading.value = true
  error.value = null
  try {
    const { start_date, end_date } = getDateRangeForMonth(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth()
    )
    const response = await getStudentCalendar(start_date, end_date)
    if (response.success && response.data) {
      calendarData.value = response.data
    } else {
      calendarData.value = []
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'حدث خطأ في تحميل البيانات'
    calendarData.value = []
  } finally {
    loading.value = false
  }
}

// Calendar grid: array of weeks, each week is array of { date, day, isCurrentMonth, status }
const calendarGrid = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDayOfWeek = firstDay.getDay() // 0 = Sunday
  const daysInMonth = lastDay.getDate()

  const grid: Array<Array<{ date: Date; day: number; isCurrentMonth: boolean; status: string | null }>> = []
  let currentWeek: Array<{ date: Date; day: number; isCurrentMonth: boolean; status: string | null }> = []

  // Fill leading empty cells from previous month
  for (let i = 0; i < startDayOfWeek; i++) {
    const prevMonth = new Date(year, month, -startDayOfWeek + i + 1)
    const dateStr = prevMonth.toISOString().slice(0, 10)
    currentWeek.push({
      date: prevMonth,
      day: prevMonth.getDate(),
      isCurrentMonth: false,
      status: dateStatusMap.value.get(dateStr) ?? null,
    })
  }

  // Fill current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dateStr = date.toISOString().slice(0, 10)
    currentWeek.push({
      date,
      day,
      isCurrentMonth: true,
      status: dateStatusMap.value.get(dateStr) ?? null,
    })
    if (currentWeek.length === 7) {
      grid.push(currentWeek)
      currentWeek = []
    }
  }

  // Fill remaining cells with next month
  if (currentWeek.length > 0) {
    let nextDay = 1
    while (currentWeek.length < 7) {
      const nextMonth = new Date(year, month + 1, nextDay)
      const dateStr = nextMonth.toISOString().slice(0, 10)
      currentWeek.push({
        date: nextMonth,
        day: nextMonth.getDate(),
        isCurrentMonth: false,
        status: dateStatusMap.value.get(dateStr) ?? null,
      })
      nextDay++
    }
    grid.push(currentWeek)
  }

  return grid
})

const monthYearLabel = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
})

function goToPrevMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1
  )
}

function goToNextMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1
  )
}

function getStatusClass(status: string | null): string {
  if (!status) return ''
  return STATUS_COLORS[status] ?? ''
}

watch(
  () => [currentDate.value.getFullYear(), currentDate.value.getMonth()],
  () => fetchCalendarData(),
  { immediate: true }
)
</script>

<template>
  <div class="student-activity-log" data-component="StudentActivityLogView">
    <div class="student-activity-log__header">
      <!-- Row 1: Title on right -->
      <h1 class="student-activity-log__title">{{ ACTIVITY_LOG_LABELS.SUBTITLE }}</h1>
      <!-- Row 2: Arrows (right) | Badges (center) | Month/Year (left) -->
      <div class="student-activity-log__row">
        <div class="student-activity-log__nav">
          <button
            type="button"
            class="student-activity-log__nav-btn"
            aria-label="الشهر السابق"
            @click="goToNextMonth"
          >
            <IconArrowRight  />
          </button>
          <button
            type="button"
            class="student-activity-log__nav-btn"
            aria-label="الشهر التالي"
             @click="goToPrevMonth"
           
          >
            <IconArrowLeft />
          </button>
        </div>
        <div class="student-activity-log__legend">
          <span
            class="student-activity-log__legend-item student-activity-log__legend-item--submitted"
          >
            {{ ACTIVITY_LOG_LABELS.STATUS_SUBMITTED }}
          </span>
          <span
            class="student-activity-log__legend-item student-activity-log__legend-item--late"
          >
            {{ ACTIVITY_LOG_LABELS.STATUS_LATE }}
          </span>
          <span
            class="student-activity-log__legend-item student-activity-log__legend-item--leave"
          >
            {{ ACTIVITY_LOG_LABELS.STATUS_LEAVE }}
          </span>
        </div>
        <span class="student-activity-log__month-year">{{ monthYearLabel }}</span>
      </div>
    </div>

    <div v-if="loading" class="student-activity-log__loading">
      <AppLoading />
    </div>

    <div v-else-if="error" class="student-activity-log__error">
      {{ error }}
    </div>

    <div v-else class="student-activity-log__content">
      <div class="student-activity-log__calendar-section">
        <div class="student-activity-log__calendar">
          <div class="student-activity-log__weekdays">
            <span
              v-for="day in WEEKDAYS"
              :key="day"
              class="student-activity-log__weekday"
            >
              {{ day }}
            </span>
          </div>
          <div class="student-activity-log__grid">
            <div
              v-for="(week, weekIndex) in calendarGrid"
              :key="weekIndex"
              class="student-activity-log__week"
            >
              <div
                v-for="(cell, cellIndex) in week"
                :key="cellIndex"
                class="student-activity-log__day"
                :class="[
                  !cell.isCurrentMonth && 'student-activity-log__day--other-month',
                  getStatusClass(cell.status) &&
                    `student-activity-log__day--${getStatusClass(cell.status)}`,
                ]"
              >
                {{ cell.day }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.student-activity-log {
  padding: 0;
  background-color: var(--color-background-card);
  border-radius: $radius-xl;
  direction: rtl;

  &__header {
    margin-bottom: $spacing-6;
  }

  &__title {
    font-size: $font-size-2xl;
    font-weight: $font-weight-medium;
    color: var(--color-text-primary);
    margin: 0 0 $spacing-10 0;
    text-align: right;
  }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: $spacing-4;
  }

  &__nav {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    order: 1;
  }

  &__nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: $radius-md;
    background-color: #ECFDF5;
    cursor: pointer;
    transition: all $transition-fast;
    color: var(--color-text-primary);

    &:hover {
      background-color: darken(#ECFDF5, 5%);
      color: var(--color-primary);
    }

    svg {
      width: 20px;
      height: 20px;
    }
  }

  &__legend {
    display: flex;
    align-items: center;
    gap: $spacing-3;
    flex-wrap: wrap;
    order: 2;
    flex: 1;
    justify-content: center;
  }

  &__month-year {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
    order: 3;
  }

  &__loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
  }

  &__error {
    padding: $spacing-6;
    color: var(--color-error);
    text-align: center;
  }

  &__content {
    width: 100%;
  }

  &__calendar-section {
    width: 100%;
    max-width: 100%;
    margin-top: $spacing-6;
  }

  &__legend-item {
    padding: $spacing-1 $spacing-3;
    border-radius: $radius-full;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;

    &--submitted {
      background-color: #C3FBE1;
      color: #1b5e20;
    }

    &--late {
      background-color: #FFF4D4;
      color: #e65100;
    }

    &--leave {
      background-color: #FFCCCC;
      color: #c62828;
    }
  }

  &__calendar {
    width: 100%;
    border: 1px solid var(--color-border);
    border-radius: $radius-lg;
    overflow: hidden;
    direction: ltr;
  }

  &__weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    background-color: #f9fafb;
    border-bottom: 1px solid var(--color-border);
  }

  &__weekday {
    padding: $spacing-2 $spacing-3;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    color: var(--color-text-secondary);
    text-align: center;
  }

  &__grid {
    display: flex;
    flex-direction: column;
  }

  &__week {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    border-bottom: 1px solid var(--color-border);

    &:last-child {
      border-bottom: none;
    }
  }

  &__day {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: var(--color-text-primary);
    min-height: 44px;
    border-left: 1px solid var(--color-border);
    background-color: #fff;

    &:last-child {
      border-left: none;
    }

    &--other-month {
      color: var(--color-text-muted);
      background-color: #fafafa;
    }

    &--submitted {
      background-color: #C3FBE1;
      color: #1b5e20;
    }

    &--late {
      background-color: #FFF4D4;
      color: #e65100;
    }

    &--leave {
      background-color: #FFCCCC;
      color: #c62828;
    }
  }
}
</style>
