<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { getStudentById, type Student } from '@/services/teacher.service'
import { BaseTabs } from '@/components/ui'
import AppLoading from '@/components/common/AppLoading.vue'
import {
  STUDENT_PROFILE_LABELS,
  STUDENT_STATUS_COLORS,
} from '@/config/teacher.constants'

interface Props {
  modelValue: boolean
  studentId: number | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const student = ref<Student | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const activeTab = ref<string | null>('overview')

const tabs = [
  { id: 'overview', label: STUDENT_PROFILE_LABELS.TABS.OVERVIEW, value: 'overview' },
  { id: 'weekly', label: STUDENT_PROFILE_LABELS.TABS.WEEKLY_RECITATION, value: 'weekly' },
  { id: 'notes', label: STUDENT_PROFILE_LABELS.TABS.NOTES, value: 'notes' },
  { id: 'test', label: STUDENT_PROFILE_LABELS.TABS.PRESENTATION_TEST, value: 'test' },
]

const statusStyle = computed(() => {
  const status = student.value?.status || 'نشط'
  return STUDENT_STATUS_COLORS[status] || STUDENT_STATUS_COLORS['نشط']
})

const initials = computed(() => {
  const name = student.value?.full_name || ''
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '—'
})

function close() {
  emit('update:modelValue', false)
}

function handleOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) close()
}

async function fetchStudent() {
  if (!props.studentId) return
  loading.value = true
  error.value = null
  student.value = null
  try {
    const res = await getStudentById(props.studentId)
    if (res.success && res.data) {
      student.value = { ...res.data, status: res.data.status || 'نشط' }
    } else {
      error.value = res.message || 'فشل تحميل بيانات الطالب'
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'حدث خطأ أثناء التحميل'
  } finally {
    loading.value = false
  }
}

function formatValue(val: string | number | null | undefined): string {
  if (val === null || val === undefined || val === '') return STUDENT_PROFILE_LABELS.EMPTY
  return String(val)
}

function sendWhatsApp() {
  const phone = student.value?.phone_number?.replace(/\D/g, '') || ''
  if (phone) window.open(`https://wa.me/${phone}`, '_blank')
}

function sendEmail() {
  const email = student.value?.email || ''
  if (email) window.open(`mailto:${email}`)
}

function handleExport() {
  // TODO: Implement export
  console.log('Export student', student.value?.id)
}

function handleCopy() {
  if (!student.value) return
  const text = Object.entries(overviewRows.value)
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n')
  navigator.clipboard.writeText(text).catch(() => {})
}

const L = STUDENT_PROFILE_LABELS.OVERVIEW

// Right column (first in RTL): Country, Education, How heard, Email, Quran parts, Watched video, Interview time, Level, Teacher
const overviewRightCol = computed(() => {
  const s = student.value
  if (!s) return []
  return [
    [L.COUNTRY, formatValue(s.country)],
    [L.EDUCATION_LEVEL, formatValue(s.education_level)],
    [L.HOW_DID_YOU_KNOW, formatValue(s.how_did_you_know_us)],
    [L.EMAIL, formatValue(s.email)],
    [L.QURAN_LEVEL, formatValue(s.quran_memorization_level)],
    [L.WATCHED_VIDEO, formatValue(s.watched_intro_video)],
    [L.INTERVIEW_TIME, formatValue(s.interview_time_preference)],
    [L.CURRENT_LEVEL, formatValue(s.level)],
    [L.TEACHER, formatValue(s.teacher)],
  ]
})

// Left column: Gender, Age, Profession, Phone, Residence, Ijaza, Track, Program, Start date
const overviewLeftCol = computed(() => {
  const s = student.value
  if (!s) return []
  return [
    [L.GENDER, formatValue(s.gender)],
    [L.AGE, formatValue(s.age)],
    [L.PROFESSION, formatValue(s.profession)],
    [L.PHONE, formatValue(s.phone_number)],
    [L.RESIDENCE, formatValue(s.residence)],
    [L.HAS_IJAZA, formatValue(s.has_ijaza_id)],
    [L.PROGRAM_TRACK, formatValue(s.program_track)],
    [L.PROGRAM, formatValue(s.program)],
    [L.START_DATE, formatValue(s.created_at)],
  ]
})

const overviewRows = computed(() => {
  const right = Object.fromEntries(overviewRightCol.value)
  const left = Object.fromEntries(overviewLeftCol.value)
  return { ...right, ...left }
})

watch(
  () => [props.modelValue, props.studentId] as const,
  ([open, id]) => {
    if (open && id) {
      activeTab.value = 'overview'
      fetchStudent()
    }
  },
  { immediate: true }
)
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div
        v-if="modelValue"
        class="student-profile-drawer"
        @click="handleOverlayClick"
      >
        <aside class="student-profile-drawer__panel">
          <!-- Close button - top right corner -->
          <button
            type="button"
            class="student-profile-drawer__close"
            aria-label="إغلاق"
            @click="close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <template v-if="loading">
            <div class="student-profile-drawer__loading">
              <AppLoading :full-screen="false" size="md" />
            </div>
          </template>

          <template v-else-if="error">
            <div class="student-profile-drawer__error">{{ error }}</div>
          </template>

          <template v-else-if="student">
            <!-- Header: Avatar + Name + Level + Status + Action buttons -->
            <div class="student-profile-drawer__header">
              <div class="student-profile-drawer__header-main">
                <div class="student-profile-drawer__avatar">{{ initials }}</div>
                <div class="student-profile-drawer__header-info">
                  <div class="student-profile-drawer__header-name-row">
                    <h2 class="student-profile-drawer__name">{{ student.full_name }}</h2>
                    <span
                      class="student-profile-drawer__status"
                      :style="{ backgroundColor: statusStyle.bg, color: statusStyle.text }"
                    >
                      {{ student.status || STUDENT_PROFILE_LABELS.STATUS_ACTIVE }}
                    </span>
                  </div>
                  <p class="student-profile-drawer__level">{{ student.level }}</p>
                </div>
              </div>
              <div class="student-profile-drawer__action-buttons">
                <button
                  type="button"
                  class="student-profile-drawer__action-btn"
                  @click="sendWhatsApp"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {{ STUDENT_PROFILE_LABELS.ACTIONS.SEND_WHATSAPP }}
                </button>
                <button
                  type="button"
                  class="student-profile-drawer__action-btn"
                  @click="sendEmail"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  {{ STUDENT_PROFILE_LABELS.ACTIONS.SEND_EMAIL }}
                </button>
              </div>
            </div>

            <!-- Tabs -->
            <div class="student-profile-drawer__tabs">
              <BaseTabs v-model="activeTab" :tabs="tabs" />
            </div>

            <!-- Content -->
            <div class="student-profile-drawer__content">
              <div v-if="activeTab === 'overview'" class="student-profile-drawer__overview">
                <!-- <h3 class="student-profile-drawer__overview-title">
                  {{ STUDENT_PROFILE_LABELS.OVERVIEW.TITLE }}
                </h3> -->
                <div class="student-profile-drawer__overview-grid">
                  <div class="student-profile-drawer__overview-col">
                    <div
                      v-for="[label, value] in overviewRightCol"
                      :key="String(label)"
                      class="student-profile-drawer__row"
                    >
                      <span class="student-profile-drawer__label">{{ label }}</span>
                      <span class="student-profile-drawer__value">{{ value }}</span>
                    </div>
                  </div>
                  <div class="student-profile-drawer__overview-col">
                    <div
                      v-for="[label, value] in overviewLeftCol"
                      :key="String(label)"
                      class="student-profile-drawer__row"
                    >
                      <span class="student-profile-drawer__label">{{ label }}</span>
                      <span class="student-profile-drawer__value">{{ value }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else-if="activeTab === 'weekly'" class="student-profile-drawer__placeholder">
                التسميع الأسبوعي - قريباً
              </div>
              <div v-else-if="activeTab === 'notes'" class="student-profile-drawer__placeholder">
                ملاحظات - قريباً
              </div>
              <div v-else-if="activeTab === 'test'" class="student-profile-drawer__placeholder">
                العرض والاختبار - قريباً
              </div>
            </div>

            <!-- Footer: Copy (secondary) + Export (primary) -->
            <div class="student-profile-drawer__footer">
              <button type="button" class="student-profile-drawer__copy-btn" @click="handleCopy">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                {{ STUDENT_PROFILE_LABELS.ACTIONS.COPY }}
              </button>
              <button type="button" class="student-profile-drawer__export-btn" @click="handleExport">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {{ STUDENT_PROFILE_LABELS.ACTIONS.EXPORT }}
              </button>
            </div>
          </template>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.student-profile-drawer {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
  align-items: stretch;
  direction: rtl;
}

.student-profile-drawer__panel {
  width: 100%;
  max-width: 640px;
  background: #fff;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  border-radius: 0 $radius-2xl $radius-2xl 0;
  direction: rtl;

  @include sm-max {
    max-width: 100%;
    border-radius: 0;
  }
}

.student-profile-drawer__close {
  position: absolute;
  top: $spacing-4;
  right: $spacing-4;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all $transition-fast;
  z-index: 10;

  &:hover {
    background: rgba(0, 0, 0, 0.08);
    color: var(--color-text-primary);
  }
}

.student-profile-drawer__loading,
.student-profile-drawer__error {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-8;
}

.student-profile-drawer__error {
  color: var(--color-error);
  text-align: center;
}

.student-profile-drawer__header {
  padding: $spacing-6 $spacing-6 $spacing-4;
  padding-top: $spacing-12;
  background: #fff;
  flex-shrink: 0;
  border-bottom: none;
}

.student-profile-drawer__header-main {
  display: flex;
  align-items: flex-start;
  gap: $spacing-4;
  margin-bottom: $spacing-4;
}

.student-profile-drawer__avatar {
  width: 56px;
  height: 56px;
  min-width: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #009968 0%, #136047 100%);
  color: #fff;
  font-weight: $font-weight-bold;
  font-size: $font-size-lg;
  display: flex;
  align-items: center;
  justify-content: center;
}

.student-profile-drawer__header-info {
  flex: 1;
  min-width: 0;
}

.student-profile-drawer__header-name-row {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  flex-wrap: wrap;
  margin-bottom: $spacing-1;
  justify-content: space-between;
}

.student-profile-drawer__name {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: var(--color-text-primary);
  margin: 0;
}

.student-profile-drawer__level {
  font-size: $font-size-sm;
  color: var(--color-text-secondary);
  margin: 0;
}

.student-profile-drawer__status {
  display: inline-block;
  padding: $spacing-1 $spacing-3;
  border-radius: $radius-full;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
}

.student-profile-drawer__action-buttons {
  display: flex;
  gap: $spacing-3;
  flex-wrap: wrap;
  justify-content: end;
}

.student-profile-drawer__action-btn {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-2 $spacing-4;
  border: 1px solid var(--color-border);
  border-radius: $radius-lg;
  background: #f9fafb;
  color: var(--color-text-primary);
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    border-color: $color-primary;
    color: $color-primary;
    background: $color-primary-lighter;
  }

  svg {
    flex-shrink: 0;
  }
}

.student-profile-drawer__tabs {
  padding: 0;
  flex-shrink: 0;

  :deep(.base-tabs) {
    background: #f3f4f6;
    padding: 4px;
    border-radius: $radius-lg;
    min-width: 0;

    .base-tabs__tab {
      background: #f3f4f6;
      color: var(--color-text-secondary);

      &--active {
        background: linear-gradient(90deg, #009968 0%, #136047 100%);
        color: #fff;
      }

      &:not(.base-tabs__tab--active):hover {
        background: #d1d5db;
      }
    }
  }
}

.student-profile-drawer__content {
  flex: 1;
  overflow-y: auto;
  padding: $spacing-4;
  min-height: 200px;
}

.student-profile-drawer__overview-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: var(--color-text-primary);
  margin: 0 0 $spacing-4 0;
}

.student-profile-drawer__overview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-6 $spacing-8;

  @include sm-max {
    grid-template-columns: 1fr;
    gap: $spacing-4;
  }
}

.student-profile-drawer__overview-col {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
}

.student-profile-drawer__row {
  display: flex;
  flex-direction: column;
  gap: $spacing-1;
}

.student-profile-drawer__label {
  font-size: $font-size-sm;
  font-weight: $font-weight-bold;
  color: var(--color-text-primary);
}

.student-profile-drawer__value {
  font-size: $font-size-sm;
  color: var(--color-text-primary);
  padding-right: 0;
}

.student-profile-drawer__placeholder {
  text-align: center;
  color: var(--color-text-muted);
  padding: $spacing-8;
}

.student-profile-drawer__footer {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-4 $spacing-6;
  border-top: 1px solid var(--color-border);
  background: #fff;
  flex-shrink: 0;
}

.student-profile-drawer__copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  padding: $spacing-3 $spacing-5;
  border: 1px solid var(--color-border);
  border-radius: $radius-lg;
  background: #fff;
  color: var(--color-text-secondary);
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: all $transition-fast;
  flex: 1;

  &:hover {
    border-color: $color-primary;
    color: $color-primary;
    background: $color-primary-lighter;
  }

  svg {
    flex-shrink: 0;
  }
}

.student-profile-drawer__export-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  padding: $spacing-3 $spacing-5;
  border: none;
  border-radius: $radius-lg;
  background: linear-gradient(90deg, #009968 0%, #136047 100%);
  color: #fff;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: all $transition-fast;
  flex: 1;

  &:hover {
    opacity: 0.95;
    filter: brightness(1.05);
  }

  svg {
    flex-shrink: 0;
  }
}

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity $transition-normal;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-active .student-profile-drawer__panel,
.drawer-leave-active .student-profile-drawer__panel {
  transition: transform $transition-normal ease-out;
}

.drawer-enter-from .student-profile-drawer__panel,
.drawer-leave-to .student-profile-drawer__panel {
  transform: translateX(100%);
}
</style>
