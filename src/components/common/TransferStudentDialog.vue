<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import {
  getAdminStudent,
  transferAdminStudent,
  type AdminStudentDetail,
} from '@/services/admin.service'
import { getLookups, LOOKUP_GROUPS, type LookupItem } from '@/services/lookups.service'
import { ADMIN_STUDENTS_PAGE } from '@/config/admin.constants'
import AppLoading from '@/components/common/AppLoading.vue'

export interface TransferStudentPayload {
  id: number
  full_name: string
  program: string
  program_track: string
  level: string | null
}

interface Props {
  modelValue: boolean
  student: TransferStudentPayload | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
}>()

const LABELS = ADMIN_STUDENTS_PAGE.TRANSFER_DIALOG

const lookups = ref<Record<string, LookupItem[]>>({})
const lookupsLoading = ref(false)
const programId = ref<number | null>(null)
const programTrackId = ref<number | null>(null)
const levelId = ref<number | null>(null)
const submitting = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const programOptions = [
  { id: 1, value: 1, label: ADMIN_STUDENTS_PAGE.FILTERS.HEFAZA },
  { id: 2, value: 2, label: ADMIN_STUDENTS_PAGE.FILTERS.FURSAN },
]

function toOptions(items: LookupItem[]) {
  return items.map((item) => ({
    id: item.id,
    value: item.id,
    label: item.value_ar || item.value_en || String(item.id),
  }))
}

function getProgramIdFromTrackId(trackId: number): number {
  const items = lookups.value.program_track || []
  const item = items.find((i) => i.id === trackId)
  const text = (item?.value_ar || item?.key || '').toLowerCase()
  return text.includes('حفظة') || text.includes('huffaz') || text.includes('itqan') ? 1 : 2
}

function findLookupIdByValue(group: string, displayValue: string | null): number | null {
  if (!displayValue) return null
  const items = lookups.value[group] || []
  const item = items.find(
    (i) =>
      i.value_ar === displayValue ||
      i.value_en === displayValue ||
      i.key === displayValue
  )
  return item ? item.id : null
}

const programTrackOptions = computed(() => {
  const all = toOptions(lookups.value.program_track || [])
  if (programId.value == null) return all
  return all.filter((opt) => getProgramIdFromTrackId(Number(opt.value)) === programId.value)
})

const levelOptions = computed(() => toOptions(lookups.value.education_level || []))

watch(
  () => props.modelValue,
  async (open) => {
    if (!open) {
      programId.value = null
      programTrackId.value = null
      levelId.value = null
      error.value = null
      successMessage.value = null
      return
    }
    if (!props.student) return

    error.value = null
    successMessage.value = null
    lookupsLoading.value = true
    try {
      const fetched = await getLookups([
        LOOKUP_GROUPS.PROGRAM_TRACK,
        LOOKUP_GROUPS.EDUCATION_LEVEL,
      ])
      lookups.value = {
        program_track: [],
        education_level: [],
        ...fetched,
      }

      const res = await getAdminStudent(props.student.id)
      if (res.success && res.data) {
        populateForm(res.data)
      } else {
        populateFormFromRow(props.student)
      }
    } catch {
      populateFormFromRow(props.student)
    } finally {
      lookupsLoading.value = false
    }
  }
)

function populateForm(d: AdminStudentDetail) {
  programTrackId.value =
    d.program_track_id ??
    findLookupIdByValue('program_track', d.program_track) ??
    findLookupIdByValue('program_track', d.program) ??
    null

  programId.value =
    d.program_id ??
    (programTrackId.value != null ? getProgramIdFromTrackId(programTrackId.value) : null)

  levelId.value =
    d.level_id ??
    findLookupIdByValue('education_level', d.level) ??
    null
}

function populateFormFromRow(row: TransferStudentPayload) {
  programTrackId.value = findLookupIdByValue('program_track', row.program_track)
  programId.value =
    programTrackId.value != null
      ? getProgramIdFromTrackId(programTrackId.value)
      : row.program.includes('فرسان')
        ? 2
        : row.program.includes('حفظ')
          ? 1
          : null
  levelId.value = findLookupIdByValue('education_level', row.level)
}

function onProgramSelect(v: string | number | null) {
  const id = v === null || v === '' ? null : Number(v)
  programId.value = id
  if (programTrackId.value != null) {
    const trackProgramId = getProgramIdFromTrackId(programTrackId.value)
    if (id != null && trackProgramId !== id) {
      programTrackId.value = null
    }
  }
}

function onProgramTrackSelect(v: string | number | null) {
  const id = v === null || v === '' ? null : Number(v)
  programTrackId.value = id
  if (id != null) {
    programId.value = getProgramIdFromTrackId(id)
  }
}

function closeDialog() {
  emit('update:modelValue', false)
}

function handleOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) closeDialog()
}

async function handleTransfer() {
  if (!props.student) return
  if (programId.value == null || programTrackId.value == null || levelId.value == null) {
    error.value = 'يرجى اختيار البرنامج والمسار والمستوى'
    return
  }

  error.value = null
  successMessage.value = null
  submitting.value = true
  try {
    const res = await transferAdminStudent(props.student.id, {
      program_id: programId.value,
      program_track_id: programTrackId.value,
      level_id: levelId.value,
    })
    if (res.success) {
      successMessage.value = res.message ?? 'تم نقل الطالب بنجاح'
      setTimeout(() => {
        closeDialog()
        emit('success')
      }, 1800)
    } else {
      error.value = res.message ?? 'فشل نقل الطالب'
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'حدث خطأ أثناء النقل'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="modelValue"
        class="transfer-student-dialog"
        @click="handleOverlayClick"
      >
        <div class="transfer-student-dialog__content">
          <button
            type="button"
            class="transfer-student-dialog__close"
            aria-label="إغلاق"
            @click="closeDialog"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <h2 class="transfer-student-dialog__title">{{ LABELS.TITLE }}</h2>
          <p class="transfer-student-dialog__subtitle">
            {{ LABELS.SUBTITLE }}
            <template v-if="student">{{ student.full_name }}</template>
            {{ LABELS.SUBTITLE_SUFFIX }}
          </p>

          <div v-if="lookupsLoading" class="transfer-student-dialog__loading">
            <AppLoading :full-screen="false" text="جاري التحميل..." />
          </div>

          <template v-else>
            <div class="transfer-student-dialog__current">
              {{ LABELS.CURRENT_PROGRAM }}: {{ student?.program ?? '—' }}
              <span v-if="student?.program_track"> — {{ student.program_track }}</span>
            </div>

            <div class="transfer-student-dialog__field">
              <label class="transfer-student-dialog__label">{{ LABELS.PROGRAM }}</label>
              <BaseSelect
                :model-value="programId"
                :options="programOptions"
                :placeholder="LABELS.PROGRAM"
                class="transfer-student-dialog__select"
                @update:model-value="onProgramSelect"
              />
            </div>

            <div class="transfer-student-dialog__field">
              <label class="transfer-student-dialog__label">{{ LABELS.PROGRAM_TRACK }}</label>
              <BaseSelect
                :model-value="programTrackId"
                :options="programTrackOptions"
                :placeholder="LABELS.PROGRAM_TRACK"
                class="transfer-student-dialog__select"
                @update:model-value="onProgramTrackSelect"
              />
            </div>

            <div class="transfer-student-dialog__field">
              <label class="transfer-student-dialog__label">{{ LABELS.LEVEL }}</label>
              <BaseSelect
                :model-value="levelId"
                :options="levelOptions"
                :placeholder="LABELS.LEVEL"
                class="transfer-student-dialog__select"
                @update:model-value="(v) => { levelId = v === null || v === '' ? null : Number(v) }"
              />
            </div>

            <p v-if="successMessage" class="transfer-student-dialog__success">{{ successMessage }}</p>
            <p v-if="error" class="transfer-student-dialog__error">{{ error }}</p>

            <div class="transfer-student-dialog__actions">
              <button
                type="button"
                class="transfer-student-dialog__btn transfer-student-dialog__btn--primary"
                :disabled="submitting"
                @click="handleTransfer"
              >
                {{ submitting ? 'جاري النقل...' : LABELS.TRANSFER_BTN }}
              </button>
              <button
                type="button"
                class="transfer-student-dialog__btn transfer-student-dialog__btn--cancel"
                @click="closeDialog"
              >
                {{ LABELS.CANCEL }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.transfer-student-dialog {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-4;
  background: rgba(0, 0, 0, 0.4);
  direction: rtl;
}

.transfer-student-dialog__content {
  position: relative;
  width: 100%;
  max-width: 480px;
  background: #fff;
  border-radius: $radius-xl;
  box-shadow: $shadow-lg;
  padding: $spacing-6;
}

.transfer-student-dialog__close {
  position: absolute;
  top: $spacing-4;
  left: $spacing-4;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: $radius-md;
  cursor: pointer;
  color: var(--color-text-secondary);

  &:hover {
    background: var(--color-border);
    color: var(--color-text-primary);
  }
}

.transfer-student-dialog__title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: var(--color-text-primary);
  margin: 0 0 $spacing-2;
  text-align: right;
}

.transfer-student-dialog__subtitle {
  font-size: $font-size-base;
  color: var(--color-text-secondary);
  margin: 0 0 $spacing-5;
  text-align: right;
}

.transfer-student-dialog__loading {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.transfer-student-dialog__current {
  padding: $spacing-3 $spacing-4;
  background: rgba(227, 242, 253, 0.8);
  border-radius: $radius-lg;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: var(--color-text-primary);
  margin-bottom: $spacing-4;
  text-align: right;
}

.transfer-student-dialog__field {
  margin-bottom: $spacing-4;
}

.transfer-student-dialog__label {
  display: block;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: var(--color-text-primary);
  margin-bottom: $spacing-2;
  text-align: right;
}

.transfer-student-dialog__select {
  width: 100%;
}

.transfer-student-dialog__success {
  padding: $spacing-3 $spacing-4;
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  border-radius: $radius-lg;
  margin: 0 0 $spacing-4;
  text-align: right;
}

.transfer-student-dialog__error {
  color: var(--color-error);
  font-size: $font-size-sm;
  margin: 0 0 $spacing-4;
  text-align: right;
}

.transfer-student-dialog__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: $spacing-3;
  flex-wrap: wrap;
}

.transfer-student-dialog__btn {
  padding: $spacing-2 $spacing-5;
  border-radius: $radius-lg;
  font-size: $font-size-base;
  font-weight: $font-weight-bold;
  cursor: pointer;
  transition: all $transition-fast;

  &--primary {
    background: var(--color-primary);
    color: #fff;
    border: none;

    &:hover:not(:disabled) {
      filter: brightness(1.05);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &--cancel {
    background: #fff;
    color: var(--color-text-primary);
    border: 1px solid var(--color-border);

    &:hover {
      background: var(--color-border);
    }
  }
}

.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-active .transfer-student-dialog__content,
.dialog-leave-active .transfer-student-dialog__content {
  transition: transform 0.2s ease;
}

.dialog-enter-from .transfer-student-dialog__content,
.dialog-leave-to .transfer-student-dialog__content {
  transform: scale(0.96);
}
</style>
