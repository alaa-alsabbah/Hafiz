<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getDailyTasks, completeTask, type DailyTask } from '@/services/student.service'
import { ApiException } from '@/services/api'
import { BaseButton, BaseCheckbox } from '@/components/ui'
import { AppLoading, DataTable } from '@/components/common'
import { STUDENT_LABELS } from '@/config/student.constants'

const loading = ref(true)
const activeTab = ref<'daily' | 'completed'>('daily')
const viewMode = ref<'cards' | 'grid'>('cards')
const tasks = ref<DailyTask[]>([])
const error = ref<string | null>(null)

// Track checked state for each task's requirements
const taskChecks = ref<Record<number, {
  listening: boolean
  repetition: boolean
  link: boolean
  review: boolean
}>>({})

// Initialize check states for a task
function initializeTaskChecks(task: DailyTask) {
  if (!taskChecks.value[task.id]) {
    taskChecks.value[task.id] = {
      listening: task.completed,
      repetition: task.completed,
      link: task.completed,
      review: task.completed,
    }
  }
}

// Check if all requirements are completed for a task
const isTaskComplete = (taskId: number): boolean => {
  const checks = taskChecks.value[taskId]
  if (!checks) return false
  return checks.listening && checks.repetition && checks.link && checks.review
}

// Update checkbox state
function updateCheck(taskId: number, field: 'listening' | 'repetition' | 'link' | 'review', value: boolean) {
  if (!taskChecks.value[taskId]) {
    taskChecks.value[taskId] = {
      listening: false,
      repetition: false,
      link: false,
      review: false,
    }
  }
  taskChecks.value[taskId][field] = value
}

async function fetchTasks() {
  try {
    loading.value = true
    error.value = null
    const isCompleted = activeTab.value === 'completed'
    const response = await getDailyTasks(isCompleted)
    
    if (response.success && response.data) {
      tasks.value = response.data
      // Initialize check states for all tasks
      tasks.value.forEach(task => {
        initializeTaskChecks(task)
      })
    } else {
      error.value = response.message || 'فشل تحميل الواجبات'
    }
  } catch (err) {
    if (err instanceof ApiException) {
      error.value = err.message || 'حدث خطأ أثناء تحميل الواجبات'
    } else {
      error.value = 'حدث خطأ غير متوقع'
    }
    console.error('Tasks fetch error:', err)
  } finally {
    loading.value = false
  }
}

async function handleCompleteTask(taskId: number) {
  try {
    const response = await completeTask(taskId)
    
    if (response.success) {
      // Refresh tasks after completion
      await fetchTasks()
    } else {
      error.value = response.message || 'فشل إرسال الواجب'
    }
  } catch (err) {
    if (err instanceof ApiException) {
      error.value = err.message || 'حدث خطأ أثناء إرسال الواجب'
    } else {
      error.value = 'حدث خطأ غير متوقع'
    }
    console.error('Complete task error:', err)
  }
}

// Watch tab changes and refetch
const currentTasks = computed(() => {
  return tasks.value.filter(task => {
    if (activeTab.value === 'completed') {
      return task.completed === true
    }
    return task.completed === false
  })
})

// Table view data (grid option)
const tableColumns = [
  { key: 'index', label: '#', align: 'center' as const, width: '80px' },
  { key: 'from_to', label: 'الواجب', align: 'right' as const },
  { key: 'due_date', label: 'تاريخ', align: 'right' as const },
]

const tableData = computed(() =>
  currentTasks.value.map((task, index) => ({
    ...task,
    index: index + 1,
  }))
)

onMounted(() => {
  fetchTasks()
})

// Refetch when tab changes
const switchTab = (tab: 'daily' | 'completed') => {
  activeTab.value = tab
  fetchTasks()
}

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'cards' ? 'grid' : 'cards'
}
</script>

<template>
  <div class="student-daily-tasks" data-component="StudentDailyTasksView">
    <!-- Tabs + View Toggle -->
    <div class="student-daily-tasks__top-row">
      <div class="student-daily-tasks__tabs">
        <button
          class="student-daily-tasks__tab"
          :class="{ 'student-daily-tasks__tab--active': activeTab === 'daily' }"
          @click="switchTab('daily')"
        >
          {{ STUDENT_LABELS.DAILY_TASKS }}
        </button>
        <button
          class="student-daily-tasks__tab"
          :class="{ 'student-daily-tasks__tab--active': activeTab === 'completed' }"
          @click="switchTab('completed')"
        >
          الواجبات المنجزة
        </button>
      </div>

      <button
        type="button"
        class="student-daily-tasks__view-toggle"
        @click="toggleViewMode"
      >
        {{ viewMode === 'cards' ? 'عرض كجدول' : 'عرض كبطاقات' }}
      </button>
    </div>

    <!-- Tasks Cards -->
    <div class="student-daily-tasks__content">
      <AppLoading v-if="loading" :full-screen="false" size="lg" />

      <div v-else-if="error" class="student-daily-tasks__error">
        <p>{{ error }}</p>
      </div>

      <div v-else-if="currentTasks.length === 0" class="student-daily-tasks__empty">
        <div class="student-daily-tasks__empty-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3 class="student-daily-tasks__empty-title">لا توجد واجبات</h3>
        <p class="student-daily-tasks__empty-description">
          {{ activeTab === 'daily' ? 'لا توجد واجبات يومية متاحة حالياً' : 'لا توجد واجبات منجزة' }}
        </p>
      </div>

      <div v-else>
        <!-- Cards view -->
        <div v-if="viewMode === 'cards'" class="student-daily-tasks__cards">
          <div
            v-for="task in currentTasks"
            :key="task.id"
            class="student-daily-tasks__card"
            :class="{ 'student-daily-tasks__card--completed': task.completed }"
          >
            <!-- Task Header: Tag and Title -->
            <div class="student-daily-tasks__card-header">
              <h3 class="student-daily-tasks__card-title">الواجب</h3>

              <div
                class="student-daily-tasks__card-tag"
                :class="{ 'student-daily-tasks__card-tag--active': !task.completed }"
              >
                {{ task.from_to }}
              </div>
            </div>

            <!-- Task Requirements -->
            <div class="student-daily-tasks__card-requirements">
              <!-- Listening -->
              <label class="student-daily-tasks__requirement">
                <BaseCheckbox
                  :model-value="taskChecks[task.id]?.listening || false"
                  :disabled="task.completed"
                  @update:model-value="(val) => updateCheck(task.id, 'listening', val)"
                />
                <span
                  class="student-daily-tasks__requirement-text"
                  :class="{ 'student-daily-tasks__requirement-text--checked': taskChecks[task.id]?.listening }"
                >
                  الاستماع ({{ task.listening }})
                </span>
              </label>

              <!-- Repetition -->
              <label class="student-daily-tasks__requirement">
                <BaseCheckbox
                  :model-value="taskChecks[task.id]?.repetition || false"
                  :disabled="task.completed"
                  @update:model-value="(val) => updateCheck(task.id, 'repetition', val)"
                />
                <span
                  class="student-daily-tasks__requirement-text"
                  :class="{ 'student-daily-tasks__requirement-text--checked': taskChecks[task.id]?.repetition }"
                >
                  التكرار ({{ task.repetition }})
                </span>
              </label>

              <!-- Link -->
              <label class="student-daily-tasks__requirement">
                <BaseCheckbox
                  :model-value="taskChecks[task.id]?.link || false"
                  :disabled="task.completed"
                  @update:model-value="(val) => updateCheck(task.id, 'link', val)"
                />
                <span
                  class="student-daily-tasks__requirement-text"
                  :class="{ 'student-daily-tasks__requirement-text--checked': taskChecks[task.id]?.link }"
                >
                  الربط ({{ task.link }})
                </span>
              </label>

              <!-- Review -->
              <label class="student-daily-tasks__requirement">
                <BaseCheckbox
                  :model-value="taskChecks[task.id]?.review || false"
                  :disabled="task.completed"
                  @update:model-value="(val) => updateCheck(task.id, 'review', val)"
                />
                <span
                  class="student-daily-tasks__requirement-text"
                  :class="{ 'student-daily-tasks__requirement-text--checked': taskChecks[task.id]?.review }"
                >
                  مراجعة ({{ task.review }})
                </span>
              </label>
            </div>

            <!-- Send Button -->
            <BaseButton
              v-if="activeTab === 'daily'"
              :disabled="!isTaskComplete(task.id) || task.completed"
              variant="primary"
              size="sm"
              block
              class="student-daily-tasks__card-button"
              @click="handleCompleteTask(task.id)"
            >
              <span>ارسال</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M13 8L3 8M3 8L7 4M3 8L7 12"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </BaseButton>
          </div>
        </div>

        <!-- Grid/table view -->
        <div v-else class="student-daily-tasks__grid">
          <DataTable
            :columns="tableColumns"
            :data="tableData"
            :loading="loading"
            empty-message="لا توجد واجبات"
            loading-message="جاري تحميل الواجبات..."
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.student-daily-tasks {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: $spacing-6;

  @include sm-max {
    gap: $spacing-4;
    padding: 0 $spacing-2;
  }

  &__top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-4;

    @include sm-max {
      flex-direction: column;
      align-items: stretch;
    }
  }

  &__tabs {
    display: inline-flex;
    background: rgba(255, 255, 255, 0.9);
    border-radius: $radius-lg;
    padding: 4px;
    box-shadow: $shadow-sm;
    gap: 0;
    align-self: flex-start;
    min-width: 300px;

    @include sm-max {
      width: 100%;
      align-self: stretch;
    }
  }

  &__view-toggle {
    border: 1px solid var(--color-border);
    background-color: #fff;
    color: var(--color-text-secondary);
    border-radius: $radius-full;
    padding: $spacing-2 $spacing-4;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: $spacing-2;
    transition: all $transition-fast;

    &:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
      box-shadow: $shadow-sm;
    }

    @include sm-max {
      align-self: flex-end;
    }
  }

  &__tab {
    padding: $spacing-2 $spacing-5;
    border: none;
    background: transparent;
    color: var(--color-text-secondary);
    font-weight: $font-weight-medium;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-fast;
    border-radius: $radius-md;
    flex: 1;

    @include sm-max {
      padding: $spacing-2 $spacing-3;
      font-size: $font-size-xs;
    }

    &:first-child {
      border-top-right-radius: $radius-lg;
      border-bottom-right-radius: $radius-lg;
    }

    &:last-child {
      border-top-left-radius: $radius-lg;
      border-bottom-left-radius: $radius-lg;
    }

    &--active {
      background: linear-gradient(90deg, #009968 0%, #136047 100%);
      color: #fff;
    }

    &:not(&--active):hover {
      background: var(--color-background);
    }
  }

  &__content {
    width: 100%;
  }

  &__grid {
    margin-top: $spacing-4;

    .base-table__table {
      border-radius: $radius-xl;
      overflow: hidden;
    }
  }

  &__cards {
    display: flex;
    flex-direction: row;
    gap: $spacing-4;
    overflow-x: auto;
    padding-bottom: $spacing-2;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;

    @include sm-max {
      flex-direction: column;
      overflow-x: visible;
      padding-bottom: 0;
      gap: $spacing-3;
    }

    &::-webkit-scrollbar {
      height: 6px;

      @include sm-max {
        display: none;
      }
    }

    &::-webkit-scrollbar-track {
      background: var(--color-background);
      border-radius: $radius-full;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--color-border);
      border-radius: $radius-full;

      &:hover {
        background: var(--color-text-muted);
      }
    }
  }

  &__card {
    background-color: var(--color-background-card);
    border-radius: $radius-xl;
    padding: $spacing-6;
    padding-bottom: 0;
    box-shadow: $shadow-md;
    min-width: 320px;
    max-width: 320px;
    display: flex;
    flex-direction: column;
    gap: $spacing-4;
    position: relative;
    overflow: hidden;

    @include md-max {
      min-width: 280px;
      max-width: 280px;
      padding: $spacing-4;
      padding-bottom: 0;
    }

    @include sm-max {
      min-width: 100%;
      max-width: 100%;
      width: 100%;
      padding: $spacing-3;
      padding-bottom: 0;
      gap: $spacing-3;
    }

    &--completed {
      opacity: 0.7;
    }
  }

  &__card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-3;
    margin-bottom: $spacing-2;

    @include sm-max {
      gap: $spacing-2;
      margin-bottom: $spacing-1;
    }
  }

  &__card-tag {
    padding: $spacing-1 $spacing-3;
    border-radius: $radius-full;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    background-color:rgba(236, 253, 245, 1);
    color: var(--color-text-secondary);
    flex-shrink: 0;

    @include sm-max {
      padding: 4px $spacing-2;
      font-size: $font-size-xs;
    }

    &--active {
      background-color: var(--color-primary);
      color: #fff;
    }
  }

  &__card-title {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
    margin: 0;
    text-align: right;
    flex: 1;

    @include sm-max {
      font-size: $font-size-base;
    }
  }

  &__card-requirements {
    display: flex;
    flex-direction: column;
    gap: $spacing-3;
    flex: 1;

    @include sm-max {
      gap: $spacing-2;
    }
  }

  &__requirement {
    display: flex;
    align-items: center;
    gap: $spacing-3;
    cursor: pointer;
    padding: .75rem .5rem;
    border-radius: $radius-md;
    transition: background-color $transition-fast;

    @include sm-max {
      gap: $spacing-2;
      padding: $spacing-1;
    }

    &:hover {
      background-color: var(--color-background);
    }
  }

  &__requirement-text {
    font-size: $font-size-base;
    color: var(--color-text-secondary);
    flex: 1;
    text-align: right;
    transition: color $transition-fast;

    @include sm-max {
      font-size: $font-size-sm;
    }

    &--checked {
      color: var(--color-text-primary);
    }
  }

  &__card-button {
    margin-top: auto;
    margin-left: -$spacing-6;
    margin-right: -$spacing-6;
    margin-bottom: 0;
    width: calc(100% + #{$spacing-6 * 2});
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-2;
    border-radius: 0;
    border-bottom-right-radius: $radius-xl;
    border-bottom-left-radius: $radius-xl;
    border: none;
    padding: $spacing-4 $spacing-6;
    background: linear-gradient(90deg, #009968 0%, #136047 100%) !important;
    color: #fff !important;

    &:hover:not(:disabled) {
      background: linear-gradient(90deg, #00a870 0%, #156048 100%) !important;
    }

    &:disabled {
      background: var(--color-border) !important;
      color: var(--color-text-muted) !important;
    }

    @include md-max {
      margin-left: -$spacing-4;
      margin-right: -$spacing-4;
      width: calc(100% + #{$spacing-4 * 2});
      padding: $spacing-3 $spacing-4;
    }

    @include sm-max {
      margin-left: -$spacing-3;
      margin-right: -$spacing-3;
      width: calc(100% + #{$spacing-3 * 2});
      gap: $spacing-1;
      padding: $spacing-3;
    }

    svg {
      width: 16px;
      height: 16px;

      @include sm-max {
        width: 14px;
        height: 14px;
      }
    }
  }

  &__error,
  &__empty {
    text-align: center;
    padding: $spacing-8;
    color: var(--color-text-secondary);

    @include sm-max {
      padding: $spacing-6;
      font-size: $font-size-sm;
    }
  }

  &__error {
    color: var(--color-error);
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-16 $spacing-6;
    min-height: 400px;
    animation: fadeInUp 0.6s ease-out;

    @include sm-max {
      padding: $spacing-12 $spacing-4;
      min-height: 300px;
    }
  }

  &__empty-icon {
    width: 120px;
    height: 120px;
    border-radius: $radius-full;
    background: linear-gradient(135deg, rgba(0, 153, 104, 0.1) 0%, rgba(19, 96, 71, 0.1) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: $spacing-6;
    color: var(--color-primary);
    animation: floatIcon 3s ease-in-out infinite, scaleIn 0.8s ease-out 0.2s both;
    transition: transform $transition-fast;

    @include sm-max {
      width: 100px;
      height: 100px;
      margin-bottom: $spacing-4;
    }

    &:hover {
      transform: scale(1.05);
      animation-play-state: paused;
    }

    svg {
      width: 60px;
      height: 60px;
      animation: pulseIcon 2s ease-in-out infinite;
      animation-delay: 0.5s;

      @include sm-max {
        width: 50px;
        height: 50px;
      }
    }
  }

  &__empty-title {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
    margin: 0 0 $spacing-3 0;
    animation: fadeInUp 0.6s ease-out 0.3s both;

    @include sm-max {
      font-size: $font-size-xl;
      margin-bottom: $spacing-2;
    }
  }

  &__empty-description {
    font-size: $font-size-base;
    color: var(--color-text-secondary);
    margin: 0;
    max-width: 400px;
    line-height: 1.6;
    animation: fadeInUp 0.6s ease-out 0.4s both;

    @include sm-max {
      font-size: $font-size-sm;
      max-width: 100%;
    }
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

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes floatIcon {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulseIcon {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.9;
  }
}
</style>
