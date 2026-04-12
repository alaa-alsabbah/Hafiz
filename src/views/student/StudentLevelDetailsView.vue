<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { STUDENT_LABELS, STUDENT_LEVEL_TABLE_LABELS } from '@/config/student.constants'
import { DataTable, AppLoading } from '@/components/common'
import { getStudentLevels, getStudentLevel, exportStudentLevel, type StudentLevel } from '@/services/student.service'
import { ApiException, type ApiResponse } from '@/services/api'

/** Backend: no Level row for this student (e.g. code 9009 or Laravel not-found message). */
const LEVEL_NOT_FOUND_API_CODE = 9009

function isNoLevelAssignedError(err: unknown): boolean {
  if (!(err instanceof ApiException)) return false
  if (err.code === LEVEL_NOT_FOUND_API_CODE) return true
  const m = (err.message || '').toLowerCase()
  return m.includes('no query results') && m.includes('level')
}

function isNoLevelAssignedResponse(response: ApiResponse<StudentLevel>): boolean {
  if (response.success && response.data) return false
  const code = response.error?.code ?? response.code
  if (code === LEVEL_NOT_FOUND_API_CODE) return true
  const m = (response.error?.message || response.message || '').toLowerCase()
  return m.includes('no query results') && m.includes('level')
}

const loading = ref(true)
const error = ref<string | null>(null)
const currentLevel = ref<StudentLevel | null>(null)
const noLevelAssignedYet = ref(false)

const isDialogOpen = ref(false)
const dialogLoading = ref(false)
const selectedLevel = ref<StudentLevel | null>(null)
const exportLoadingId = ref<number | null>(null)

const columns = [
  { key: 'name', label: STUDENT_LEVEL_TABLE_LABELS.LEVEL_NUMBER },
  { key: 'description', label: STUDENT_LEVEL_TABLE_LABELS.DETAILS },
  { key: 'created_at', label: STUDENT_LEVEL_TABLE_LABELS.CREATED_AT },
  { key: 'action', label: STUDENT_LEVEL_TABLE_LABELS.ACTION, align: 'center' as const, width: '100px' },
]

/** One row for shared DataTable when API returns a single level object */
const tableData = computed(() => {
  const level = currentLevel.value
  if (!level) return []
  return [
    {
      ...level,
      description: level.description ?? '---',
      created_at: level.created_at,
      action: 'download',
    },
  ]
})

async function fetchLevel() {
  try {
    loading.value = true
    error.value = null
    noLevelAssignedYet.value = false
    const response = await getStudentLevels()

    if (response.success && response.data) {
      currentLevel.value = response.data
    } else if (isNoLevelAssignedResponse(response)) {
      currentLevel.value = null
      noLevelAssignedYet.value = true
    } else {
      currentLevel.value = null
      error.value =
        response.error?.message || response.message || 'فشل تحميل بيانات المستوى'
    }
  } catch (err) {
    if (isNoLevelAssignedError(err)) {
      currentLevel.value = null
      noLevelAssignedYet.value = true
    } else if (err instanceof ApiException) {
      error.value = err.message || 'حدث خطأ أثناء تحميل البيانات'
    } else {
      error.value = 'حدث خطأ غير متوقع'
    }
    if (!isNoLevelAssignedError(err)) {
      console.error('Student level fetch error:', err)
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLevel()
})

async function openLevelDetails(row: StudentLevel) {
  try {
    isDialogOpen.value = true
    dialogLoading.value = true
    selectedLevel.value = null

    const response = await getStudentLevel(row.id)
    if (response.success && response.data) {
      selectedLevel.value = response.data
    } else {
      error.value = response.message || 'فشل تحميل تفاصيل المستوى'
    }
  } catch (err) {
    if (err instanceof ApiException) {
      error.value = err.message || 'حدث خطأ أثناء تحميل تفاصيل المستوى'
    } else {
      error.value = 'حدث خطأ غير متوقع'
    }
    console.error('Student level detail fetch error:', err)
  } finally {
    dialogLoading.value = false
  }
}

function closeDialog() {
  isDialogOpen.value = false
}

async function handleExport(row: StudentLevel) {
  try {
    exportLoadingId.value = row.id
    const response = await exportStudentLevel(row.id)

    if (response.success && response.data) {
      window.open(response.data, '_blank')
    } else {
      error.value = response.message || 'فشل تحميل ملف المستوى'
    }
  } catch (err) {
    if (err instanceof ApiException) {
      error.value = err.message || 'حدث خطأ أثناء تحميل ملف المستوى'
    } else {
      error.value = 'حدث خطأ غير متوقع'
    }
    console.error('Student level export error:', err)
  } finally {
    exportLoadingId.value = null
  }
}
</script>

<template>
  <div class="student-level-details" data-component="StudentLevelDetailsView">
    <div class="student-level-details__header">
      <h1 class="student-level-details__title">
        {{ STUDENT_LABELS.LEVEL_DETAILS }}
      </h1>
    </div>

    <div class="student-level-details__content">
      <AppLoading
        v-if="loading && !tableData.length && !error"
        :full-screen="false"
        size="md"
        text="جاري تحميل تفاصيل المستويات..."
      />

      <template v-else>
        <div v-if="error" class="student-level-details__error">
          <p>{{ error }}</p>
        </div>

        <div v-else>
          <DataTable
            :columns="columns"
            :data="tableData"
            :loading="loading"
            :empty-message="
              noLevelAssignedYet ? STUDENT_LABELS.LEVEL_NOT_ASSIGNED_YET : 'لا توجد مستويات متاحة'
            "
            loading-message="جاري تحميل تفاصيل المستويات..."
            @row-click="openLevelDetails"
          >
            <template #cell-action="{ row }">
              <button
                type="button"
                class="student-level-details__action-btn"
                :disabled="exportLoadingId === row.id"
                @click.stop.prevent="handleExport(row)"
              >
                <svg
                  v-if="exportLoadingId !== row.id"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 2V10.5M8 10.5L4.5 7M8 10.5L11.5 7M3 12.5H13"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span v-else class="student-level-details__action-spinner" />
              </button>
            </template>
          </DataTable>
        </div>
      </template>
    </div>

    <div
      v-if="isDialogOpen"
      class="student-level-details__dialog-backdrop"
      @click.self="closeDialog"
    >
      <div class="student-level-details__dialog">
        <button
          type="button"
          class="student-level-details__dialog-close"
          @click="closeDialog"
        >
          ✕
        </button>

        <div v-if="dialogLoading" class="student-level-details__dialog-loading">
          <AppLoading :full-screen="false" size="sm" text="جاري تحميل تفاصيل المستوى..." />
        </div>

        <div v-else-if="selectedLevel" class="student-level-details__dialog-content">
          <h2 class="student-level-details__dialog-title">
            {{ selectedLevel.name }}
          </h2>

          <p class="student-level-details__dialog-meta">
            تاريخ الإنشاء: {{ selectedLevel.created_at }}
          </p>

          <p class="student-level-details__dialog-description">
            {{ selectedLevel.description ?? 'لا توجد تفاصيل إضافية لهذا المستوى حالياً.' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.student-level-details {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: $spacing-4;

  &__header {
    margin-bottom: $spacing-2;
  }

  &__title {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
    margin: 0;
    text-align: right;
  }

  &__content {
    width: 100%;

    :deep(.base-table__table) {
      border-radius: $radius-xl;
      overflow: hidden;
    }
  }

  &__error {
    text-align: center;
    padding: $spacing-8;
    color: var(--color-error);
  }

  &__action-btn {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    border: none;
    background: rgba(244, 244, 244, 1);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--color-text-secondary);
    transition: all $transition-fast;

    &:hover {
      background: rgba(0, 141, 153, 0.12);
      color: rgba(0, 141, 153, 1);
    }

    &:disabled {
      opacity: 0.7;
      cursor: wait;
    }
  }

  &__action-spinner {
    width: 14px;
    height: 14px;
    border-radius: 999px;
    border: 2px solid rgba(148, 163, 184, 0.5);
    border-top-color: rgba(0, 141, 153, 1);
    animation: spin 0.6s linear infinite;
  }

  &__dialog-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1500;
  }

  &__dialog {
    position: relative;
    width: 100%;
    max-width: 480px;
    background: #fff;
    border-radius: $radius-2xl;
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.25);
    padding: $spacing-6;

    @include sm-max {
      margin: 0 $spacing-3;
      padding: $spacing-4;
    }
  }

  &__dialog-close {
    position: absolute;
    top: $spacing-3;
    left: $spacing-3;
    width: 28px;
    height: 28px;
    border-radius: 999px;
    border: none;
    background: rgba(244, 244, 244, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $font-size-sm;
    cursor: pointer;
    color: var(--color-text-secondary);
    transition: all $transition-fast;

    &:hover {
      background: rgba(0, 141, 153, 0.1);
      color: rgba(0, 141, 153, 1);
    }
  }

  &__dialog-loading {
    padding: $spacing-4 0;
  }

  &__dialog-content {
    display: flex;
    flex-direction: column;
    gap: $spacing-3;
  }

  &__dialog-title {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
    margin: 0;
    text-align: right;
  }

  &__dialog-meta {
    font-size: $font-size-sm;
    color: var(--color-text-secondary);
    margin: 0;
    text-align: right;
  }

  &__dialog-description {
    font-size: $font-size-base;
    color: var(--color-text-primary);
    margin: $spacing-2 0 0;
    line-height: 1.7;
    text-align: right;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
