<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { AppLoading } from '@/components/common'
import {
  getAdminInterviews,
  getAdminInterview,
  approveRejectInterview,
  type AdminInterview,
} from '@/services/admin.service'
import { ADMIN_EVALUATIONS_PAGE } from '@/config/admin.constants'

const loading = ref(true)
const error = ref<string | null>(null)
const interviews = ref<AdminInterview[]>([])
const selectedId = ref<number | null>(null)
const selectedInterview = ref<AdminInterview | null>(null)
const detailLoading = ref(false)
const actionLoading = ref<'approve' | 'reject' | null>(null)
const scoreValue = ref<number>(0)
const notes = ref('')

async function fetchInterviews() {
  loading.value = true
  error.value = null
  try {
    const res = await getAdminInterviews()
    if (res.success && res.data) {
      interviews.value = Array.isArray(res.data) ? res.data : []
      if (interviews.value.length > 0 && !selectedId.value) {
        selectedId.value = interviews.value[0].id
      }
    } else {
      interviews.value = []
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'حدث خطأ في تحميل المقابلات'
    interviews.value = []
  } finally {
    loading.value = false
  }
}

async function fetchInterviewDetail() {
  if (!selectedId.value) {
    selectedInterview.value = null
    return
  }
  detailLoading.value = true
  selectedInterview.value = null
  try {
    const res = await getAdminInterview(selectedId.value)
    if (res.success && res.data) {
      selectedInterview.value = res.data
      scoreValue.value = res.data.score ?? 0
      notes.value = ''
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'حدث خطأ في تحميل التفاصيل'
  } finally {
    detailLoading.value = false
  }
}

async function handleApprove() {
  if (!selectedId.value) return
  actionLoading.value = 'approve'
  try {
    const res = await approveRejectInterview(selectedId.value, 1, {
      score: ensureNumber(scoreValue.value),
      notes: notes.value ?? '',
    })
    if (res.success) {
      await fetchInterviews()
      selectedId.value = interviews.value[0]?.id ?? null
    } else {
      error.value = res.message ?? 'فشل الموافقة'
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'حدث خطأ'
  } finally {
    actionLoading.value = null
  }
}

async function handleReject() {
  if (!selectedId.value) return
  actionLoading.value = 'reject'
  try {
    const res = await approveRejectInterview(selectedId.value, 0, {
      score: ensureNumber(scoreValue.value),
      notes: notes.value ?? '',
    })
    if (res.success) {
      await fetchInterviews()
      selectedId.value = interviews.value[0]?.id ?? null
    } else {
      error.value = res.message ?? 'فشل الرفض'
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'حدث خطأ'
  } finally {
    actionLoading.value = null
  }
}

function ensureNumber(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function getInitials(name: string): string {
  const parts = (name ?? '').trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] || '') + (parts[1][0] || '')
  return (name?.[0] ?? '?').toUpperCase()
}

function formatScheduleDate(dateStr: string): string {
  if (!dateStr) return '---'
  const d = new Date(dateStr)
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
  return `${days[d.getDay()]}، ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function formatScheduleTime(dateStr: string): string {
  if (!dateStr) return '---'
  const d = new Date(dateStr)
  const h = d.getHours()
  const m = d.getMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${ampm} ${h12.toString().padStart(2, '0')}.${m.toString().padStart(2, '0')}`
}

function formatListDate(dateStr: string): string {
  if (!dateStr) return '---'
  const d = new Date(dateStr)
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
  return `${d.getDate()} ${months[d.getMonth()]}`
}

function formatValue(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === '') return '---'
  return String(v)
}

const L = ADMIN_EVALUATIONS_PAGE.LABELS
// Right column: بلد الإقامة، العمر، البريد الإلكتروني، مكان الإقامة، الوقت المناسب للمقابلة، البرنامج
const col1 = computed(() => {
  const i = selectedInterview.value
  if (!i) return []
  return [
    [L.COUNTRY, formatValue(i.country)],
    [L.AGE, formatValue(i.age)],
    [L.EMAIL, formatValue(i.email)],
    [L.RESIDENCE, formatValue(i.residence)],
    [L.INTERVIEW_TIME, formatValue(i.interview_time_preference)],
    [L.PROGRAM, formatValue(i.program)],
  ]
})
// Middle column: الجنس، كيف سمعت عن البرنامج، رقم الهاتف، شاهدت الفيديو، أي مسار، المعلم المعين
const col2 = computed(() => {
  const i = selectedInterview.value
  if (!i) return []
  return [
    [L.GENDER, formatValue(i.gender)],
    [L.HOW_KNEW, formatValue(i.how_did_you_know_us)],
    [L.PHONE, formatValue(i.phone_number)],
    [L.WATCHED_VIDEO, formatValue(i.watched_intro_video)],
    [L.TRACK, formatValue(i.program_track)],
    [L.TEACHER, formatValue(i.teacher)],
  ]
})
// Left column: المستوى التعليمي، المهنة، كم جزء، رخصة، المستوى الحالي، تاريخ البدء
const col3 = computed(() => {
  const i = selectedInterview.value
  if (!i) return []
  return [
    [L.EDUCATION, formatValue(i.education_level)],
    [L.PROFESSION, '---'],
    [L.QURAN_PARTS, formatValue(i.quran_memorization_level)],
    [L.HAS_IJAZA, formatValue(i.has_ijaza)],
    [L.CURRENT_LEVEL, formatValue(i.level)],
    [L.START_DATE, formatValue(i.created_at)],
  ]
})

watch(selectedId, () => {
  fetchInterviewDetail()
})

onMounted(() => fetchInterviews())
</script>

<template>
  <div class="admin-evaluations" data-component="AdminInterviewAssessmentsView">
    <div class="admin-evaluations__header">
      <h1 class="admin-evaluations__title">{{ ADMIN_EVALUATIONS_PAGE.PAGE_TITLE }}</h1>
    </div>

    <div v-if="error" class="admin-evaluations__error">{{ error }}</div>

    <div v-if="loading" class="admin-evaluations__loading">
      <AppLoading :full-screen="false" text="جاري تحميل المقابلات..." />
    </div>

    <template v-else>
      <div v-if="interviews.length === 0" class="admin-evaluations__empty">
        {{ ADMIN_EVALUATIONS_PAGE.EMPTY }}
      </div>

      <div v-else class="admin-evaluations__layout">
        <!-- Right: Pending interviews list -->
        <aside class="admin-evaluations__sidebar">
          <div class="admin-evaluations__sidebar-header">
            <h2 class="admin-evaluations__sidebar-title">{{ ADMIN_EVALUATIONS_PAGE.PENDING_LIST_TITLE }}</h2>
            <span class="admin-evaluations__sidebar-badge">{{ interviews.length }}</span>
          </div>
          <div class="admin-evaluations__list">
            <button
              v-for="item in interviews"
              :key="item.id"
              type="button"
              class="admin-evaluations__list-item"
              :class="{ 'admin-evaluations__list-item--active': selectedId === item.id }"
              @click="selectedId = item.id"
            >
              <div class="admin-evaluations__list-item-header">
                <span class="admin-evaluations__list-item-name">{{ item.full_name }}</span>
                <span class="admin-evaluations__list-item-tag">{{ item.program }}</span>
              </div>
              <div class="admin-evaluations__list-item-date">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                {{ formatListDate(item.scheduled_at) }}
              </div>
            </button>
          </div>
        </aside>

        <!-- Left: Detail panel -->
        <main class="admin-evaluations__detail">
          <div v-if="!selectedId" class="admin-evaluations__detail-empty">
            {{ ADMIN_EVALUATIONS_PAGE.SELECT_PROMPT }}
          </div>

          <template v-else-if="detailLoading">
            <div class="admin-evaluations__detail-loading">
              <AppLoading :full-screen="false" text="جاري تحميل التفاصيل..." />
            </div>
          </template>

          <template v-else-if="selectedInterview">
            <!-- Single green header: candidate (right) + schedule (left) -->
            <div class="admin-evaluations__header-banner">
              <div class="admin-evaluations__header-candidate">
                <div
                  class="admin-evaluations__candidate-avatar admin-evaluations__candidate-avatar--green"
                >
                  {{ getInitials(selectedInterview.full_name) }}
                </div>
                <div class="admin-evaluations__header-candidate-info">
                  <div class="admin-evaluations__header-name-row">
                    <h3 class="admin-evaluations__candidate-name">{{ selectedInterview.full_name }}</h3>
                    <span class="admin-evaluations__candidate-status">{{ ADMIN_EVALUATIONS_PAGE.STATUS_ACTIVE }}</span>
                  </div>
                  <p class="admin-evaluations__candidate-level">{{ selectedInterview.level || '---' }}</p>
                </div>
              </div>
              <div class="admin-evaluations__header-schedule">
                <div class="admin-evaluations__header-schedule-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {{ ADMIN_EVALUATIONS_PAGE.SCHEDULE_BANNER }}
                </div>
                <div class="admin-evaluations__header-schedule-dates">
                  <span>{{ formatScheduleDate(selectedInterview.scheduled_at) }}</span>
                  <span>{{ formatScheduleTime(selectedInterview.scheduled_at) }}</span>
                </div>
              </div>
            </div>

            <!-- Main candidate info card (3 columns) -->
            <div class="admin-evaluations__info-card">
              <div class="admin-evaluations__info-grid admin-evaluations__info-grid--3">
                <div class="admin-evaluations__info-col">
                  <div
                    v-for="[label, value] in col1"
                    :key="String(label)"
                    class="admin-evaluations__info-row"
                  >
                    <span class="admin-evaluations__info-label">{{ label }}</span>
                    <span class="admin-evaluations__info-value">{{ value }}</span>
                  </div>
                </div>
                <div class="admin-evaluations__info-col">
                  <div
                    v-for="[label, value] in col2"
                    :key="String(label)"
                    class="admin-evaluations__info-row"
                  >
                    <span class="admin-evaluations__info-label">{{ label }}</span>
                    <span class="admin-evaluations__info-value">{{ value }}</span>
                  </div>
                </div>
                <div class="admin-evaluations__info-col">
                  <div
                    v-for="[label, value] in col3"
                    :key="String(label)"
                    class="admin-evaluations__info-row"
                  >
                    <span class="admin-evaluations__info-label">{{ label }}</span>
                    <span class="admin-evaluations__info-value">{{ value }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Rating section -->
            <section class="admin-evaluations__section">
              <h4 class="admin-evaluations__section-title">{{ ADMIN_EVALUATIONS_PAGE.RECITATION_EVAL }}</h4>
              <div class="admin-evaluations__rating-row">
                <div class="admin-evaluations__rating-stars">
                  <svg v-for="i in 5" :key="i" class="admin-evaluations__star-outline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </div>
                <span class="admin-evaluations__rating-pill">{{ (typeof scoreValue === 'number' && !Number.isNaN(scoreValue)) ? String(scoreValue) : ADMIN_EVALUATIONS_PAGE.UNRATED }}</span>
                <label class="admin-evaluations__score-label">
                  <span>{{ ADMIN_EVALUATIONS_PAGE.SCORE_LABEL }}</span>
                  <input
                    v-model.number="scoreValue"
                    type="number"
                    step="any"
                    class="admin-evaluations__score-input"
                    placeholder="0"
                  />
                </label>
              </div>
              <p class="admin-evaluations__section-desc admin-evaluations__section-desc--below">{{ ADMIN_EVALUATIONS_PAGE.RECITATION_EVAL_DESC }}</p>
            </section>

            <!-- Notes section -->
            <section class="admin-evaluations__section">
              <h4 class="admin-evaluations__section-title">{{ ADMIN_EVALUATIONS_PAGE.EVAL_NOTES }}</h4>
              <p class="admin-evaluations__section-desc">{{ ADMIN_EVALUATIONS_PAGE.EVAL_NOTES_DESC }}</p>
              <textarea
                v-model="notes"
                class="admin-evaluations__notes-input"
                rows="4"
                :placeholder="ADMIN_EVALUATIONS_PAGE.NOTES_PLACEHOLDER"
              />
            </section>

            <!-- Action buttons -->
            <div class="admin-evaluations__actions">
              <button
                type="button"
                class="admin-evaluations__btn admin-evaluations__btn--reject"
                :disabled="actionLoading !== null"
                @click="handleReject"
              >
                {{ ADMIN_EVALUATIONS_PAGE.REJECT }}
              </button>
              <button
                type="button"
                class="admin-evaluations__btn admin-evaluations__btn--approve"
                :disabled="actionLoading !== null"
                @click="handleApprove"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {{ ADMIN_EVALUATIONS_PAGE.APPROVE }}
              </button>
            </div>
          </template>
        </main>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.admin-evaluations {
  direction: rtl;
  width: 100%;
  max-width: 100%;

  &__header {
    margin-bottom: $spacing-4;
  }

  &__title {
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
    margin: 0;
    text-align: right;
  }

  &__error {
    padding: $spacing-4;
    color: var(--color-error);
    text-align: center;
    margin-bottom: $spacing-4;
    background: rgba(239, 68, 68, 0.08);
    border-radius: $radius-lg;
  }

  &__loading {
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__empty {
    padding: $spacing-8;
    text-align: center;
    color: var(--color-text-secondary);
    background: var(--color-background-card);
    border-radius: $radius-xl;
    border: 1px dashed var(--color-border);
  }

  &__layout {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: $spacing-6;
    min-height: 500px;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }
  }

  &__sidebar {
    background: var(--color-background-card);
    border-radius: $radius-xl;
    border: 1px solid var(--color-border);
    box-shadow: $shadow-sm;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  &__sidebar-header {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    padding: $spacing-4;
    border-bottom: 1px solid var(--color-border);
  }

  &__sidebar-title {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
    margin: 0;
  }

  &__sidebar-badge {
    min-width: 28px;
    height: 28px;
    padding: 0 6px;
    border-radius: 50%;
    background: rgba(0, 138, 92, 0.15);
    color: var(--color-primary);
    font-size: $font-size-sm;
    font-weight: $font-weight-bold;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &__list {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-2;
  }

  &__list-item {
    width: 100%;
    padding: $spacing-4;
    border: none;
    border-radius: $radius-lg;
    background: transparent;
    text-align: right;
    cursor: pointer;
    transition: all 0.15s ease;
    font-family: inherit;

    &:hover {
      background: rgba(0, 138, 92, 0.06);
    }

    &--active {
      background: rgba(0, 138, 92, 0.1);
    }
  }

  &__list-item-header {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    margin-bottom: $spacing-2;
  }

  &__list-item-name {
    font-size: $font-size-base;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
  }

  &__list-item-tag {
    padding: 2px 8px;
    border-radius: $radius-full;
    font-size: $font-size-xs;
    font-weight: 600;
    background: rgba(0, 0, 0, 0.06);
    color: var(--color-text-secondary);
  }

  &__list-item-date {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    font-size: $font-size-sm;
    color: var(--color-text-secondary);

    svg {
      flex-shrink: 0;
      opacity: 0.7;
    }
  }

  &__detail {
    background: var(--color-background-card);
    border-radius: $radius-xl;
    border: 1px solid var(--color-border);
    box-shadow: $shadow-sm;
    padding: $spacing-6;
    overflow-y: auto;
  }

  &__detail-empty,
  &__detail-loading {
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-secondary);
  }

  // Single green header (candidate + schedule)
  &__header-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-6;
    padding: $spacing-5;
    background: rgba(0, 138, 92, 0.12);
    border-radius: $radius-lg;
    margin-bottom: $spacing-5;
  }

  &__header-candidate {
    display: flex;
    align-items: center;
    gap: $spacing-3;
  }

  &__header-candidate-info {
    flex: 1;
    min-width: 0;
  }

  &__header-name-row {
    display: flex;
    align-items: center;
    gap: $spacing-2;
  }

  &__header-schedule {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: $spacing-1;
  }

  &__header-schedule-title {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    font-size: $font-size-sm;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
  }

  &__header-schedule-dates {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    font-size: $font-size-sm;
    color: var(--color-text-secondary);
  }

  &__candidate-name {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
    margin: 0;
  }

  &__candidate-status {
    padding: 2px 8px;
    border-radius: $radius-full;
    font-size: $font-size-xs;
    font-weight: 600;
    background: rgba(0, 138, 92, 0.2);
    color: var(--color-primary);
  }

  &__candidate-level {
    font-size: $font-size-sm;
    color: var(--color-text-secondary);
    margin: $spacing-1 0 0 0;
  }

  &__candidate-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $font-size-base;
    font-weight: $font-weight-bold;
    color: #fff;
    flex-shrink: 0;

    &--green {
      background-color: var(--color-primary) !important;
    }
  }

  &__info-card {
    background: #fff;
    border-radius: $radius-lg;
    border: 1px solid var(--color-border);
    padding: $spacing-5;
    margin-bottom: $spacing-6;
  }

  &__info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $spacing-6 $spacing-8;

    &--3 {
      grid-template-columns: 1fr 1fr 1fr;
    }

    @media (max-width: 900px) {
      &--3 {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 640px) {
      grid-template-columns: 1fr !important;

      &--3 {
        grid-template-columns: 1fr !important;
      }
    }
  }

  &__info-row {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-bottom: $spacing-3;
  }

  &__info-label {
    font-size: $font-size-xs;
    font-weight: $font-weight-bold;
    color: var(--color-text-secondary);
  }

  &__info-value {
    font-size: $font-size-sm;
    color: var(--color-text-primary);
  }

  &__section {
    margin-bottom: $spacing-6;
  }

  &__section-title {
    font-size: $font-size-base;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
    margin: 0 0 $spacing-2 0;
  }

  &__section-desc {
    font-size: $font-size-sm;
    color: var(--color-text-secondary);
    margin: 0 0 $spacing-3 0;
  }

  &__rating-row {
    display: flex;
    align-items: center;
    gap: $spacing-3;
    margin-bottom: $spacing-2;
  }

  &__rating-stars {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__star-outline {
    width: 24px;
    height: 24px;
    color: #d1d5db;
    stroke-width: 1.5;
  }

  &__rating-pill {
    padding: 4px 12px;
    border-radius: $radius-full;
    font-size: $font-size-sm;
    font-weight: 600;
    background: rgba(0, 138, 92, 0.15);
    color: var(--color-primary);
  }

  &__section-desc--below {
    margin-top: 0;
  }

  &__score-label {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    font-size: $font-size-sm;
    color: var(--color-text-secondary);
  }

  &__score-input {
    width: 80px;
    padding: $spacing-2 $spacing-3;
    border: 1px solid var(--color-border);
    border-radius: $radius-md;
    font-size: $font-size-sm;
    font-family: inherit;

    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      opacity: 1;
    }
  }

  &__notes-input {
    width: 100%;
    padding: $spacing-3;
    border: 1px solid var(--color-border);
    border-radius: $radius-lg;
    font-size: $font-size-sm;
    font-family: inherit;
    resize: vertical;

    &::placeholder {
      color: var(--color-text-muted);
    }
  }

  &__actions {
    display: flex;
    gap: $spacing-3;
    justify-content: flex-start;
    margin-top: $spacing-6;
    padding-top: $spacing-6;
    border-top: 1px solid var(--color-border);
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: $spacing-2;
    padding: $spacing-3 $spacing-5;
    border-radius: $radius-lg;
    font-size: $font-size-base;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    &--reject {
      background: #fff;
      color: var(--color-text-secondary);
      border: 1px solid #d1d5db;

      &:hover:not(:disabled) {
        background: #f9fafb;
      }
    }

    &--approve {
      background: var(--color-primary);
      color: #fff;
      border: none;

      &:hover:not(:disabled) {
        background: #008a5c;
      }
    }
  }
}
</style>
