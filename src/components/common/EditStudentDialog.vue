<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseDatePicker from '@/components/ui/BaseDatePicker.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BasePhoneInput from '@/components/ui/BasePhoneInput.vue'
import {
  getAdminStudent,
  updateAdminStudent,
  type AdminStudentDetail,
  type UpdateAdminStudentPayload,
} from '@/services/admin.service'
import { getLookups } from '@/services/lookups.service'
import type { LookupItem } from '@/services/lookups.service'
import { LOOKUP_GROUPS } from '@/services/lookups.service'
import { ADMIN_STUDENTS_PAGE } from '@/config/admin.constants'
import { ApiException } from '@/services/api'

interface Props {
  modelValue: boolean
  studentId: number | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
}>()

const L = ADMIN_STUDENTS_PAGE.EDIT_DIALOG

// Form state
const fullName = ref('')
const email = ref('')
const country = ref('')
const genderId = ref<number | null>(null)
const birthDate = ref('')
const educationLevelId = ref<number | null>(null)
const howDidYouKnowUsId = ref<number | null>(null)
const phoneCountryCode = ref('+962')
const phoneNumber = ref('')
const residence = ref('')
const quranMemorizationLevelId = ref<number | null>(null)
const hasIjazaId = ref<number | null>(null)
const watchedIntroVideo = ref<boolean | null>(null) // API expects boolean
const interviewTimePreferenceId = ref<number | null>(null)
const programId = ref<number | null>(null)
const programTrackId = ref<number | null>(null)
const job = ref('')
const volunteer = ref<boolean | null>(null) // API expects boolean
const levelId = ref<number | null>(null)

// UI state
const studentLoading = ref(false)
const submitting = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

// Lookups
const lookups = ref<Record<string, LookupItem[]>>({})

// Derive program_id (1=حفظة, 2=فرسان) from program_track selection
function getProgramIdFromTrackId(trackId: number): number {
  const items = lookups.value.program_track || []
  const item = items.find((i) => i.id === trackId)
  const text = (item?.value_ar || item?.key || '').toLowerCase()
  return text.includes('حفظة') || text.includes('huffaz') || text.includes('itqan') ? 1 : 2
}

// Options for BaseSelect (id, value, label)
function toOptions(items: LookupItem[]) {
  return items.map((item) => ({
    id: item.id,
    value: item.id,
    label: item.value_ar || item.value_en || String(item.id),
  }))
}

const genderOptions = computed(() => toOptions(lookups.value.gender || []))
const educationLevelOptions = computed(() =>
  toOptions(lookups.value.education_level || [])
)
const howDidYouKnowUsOptions = computed(() =>
  toOptions(lookups.value.how_did_you_know_us || [])
)
const quranMemorizationLevelOptions = computed(() =>
  toOptions(lookups.value.quran_memorization_level || [])
)
const interviewTimePreferenceOptions = computed(() =>
  toOptions(lookups.value.interview_time_preference || [])
)
const programTrackOptions = computed(() =>
  toOptions(lookups.value.program_track || [])
)
const hasIjazaOptions = computed(() =>
  toOptions(lookups.value.has_ijaza || [])
)
const levelOptions = computed(() =>
  toOptions(lookups.value.education_level || [])
)
const programOptions = computed(() =>
  toOptions(lookups.value.program_track || [])
)
// Options for watched_intro_video and volunteer (API expects boolean)
const yesNoBooleanOptions = computed(() => [
  { id: 'yes', value: 'true', label: 'نعم' },
  { id: 'no', value: 'false', label: 'لا' },
])

// Resolve lookup id from display string (when API returns display value only)
function findLookupIdByValue(
  group: string,
  displayValue: string | null
): number | null {
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

// Parse phone: "962791234567" or "+962791234567" -> country code + number
function parsePhone(phone: string): { code: string; number: string } {
  if (!phone || typeof phone !== 'string') return { code: '+962', number: '' }
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('962')) {
    return { code: '+962', number: cleaned.slice(3) }
  }
  if (cleaned.startsWith('966')) {
    return { code: '+966', number: cleaned.slice(3) }
  }
  if (cleaned.startsWith('971')) {
    return { code: '+971', number: cleaned.slice(3) }
  }
  return { code: '+962', number: cleaned }
}

async function loadLookupsAndConfig() {
  const groups = [
    LOOKUP_GROUPS.GENDER,
    LOOKUP_GROUPS.EDUCATION_LEVEL,
    LOOKUP_GROUPS.HOW_DID_YOU_KNOW_US,
    LOOKUP_GROUPS.QURAN_MEMORIZATION_LEVEL,
    LOOKUP_GROUPS.HAS_IJAZA,
    LOOKUP_GROUPS.INTERVIEW_TIME_PREFERENCE,
    LOOKUP_GROUPS.PROGRAM_TRACK,
    LOOKUP_GROUPS.YES_NO,
  ]
  const fetched = await getLookups(groups)
  lookups.value = {
    gender: [],
    education_level: [],
    how_did_you_know_us: [],
    quran_memorization_level: [],
    has_ijaza: [],
    interview_time_preference: [],
    program_track: [],
    yes_no: [],
    ...fetched,
  }
}

function populateForm(d: AdminStudentDetail) {
  fullName.value = d.full_name || ''
  email.value = d.email || ''
  country.value = d.country || ''
  birthDate.value = d.birth_date || ''
  residence.value = d.residence || ''
  job.value = d.job || ''

  // Use IDs if available, otherwise resolve from display values
  genderId.value =
    d.gender_id ?? findLookupIdByValue('gender', d.gender) ?? null
  educationLevelId.value =
    d.education_level_id ??
    findLookupIdByValue('education_level', d.education_level) ??
    null
  howDidYouKnowUsId.value =
    d.how_did_you_know_us_id ??
    findLookupIdByValue('how_did_you_know_us', d.how_did_you_know_us) ??
    null
  quranMemorizationLevelId.value =
    d.quran_memorization_level_id ??
    findLookupIdByValue('quran_memorization_level', d.quran_memorization_level) ??
    null
  hasIjazaId.value =
    (d as AdminStudentDetail & { has_ijaza_id?: number }).has_ijaza_id ??
    findLookupIdByValue('has_ijaza', d.has_ijaza) ??
    null
  interviewTimePreferenceId.value =
    d.interview_time_preference_id ??
    findLookupIdByValue('interview_time_preference', d.interview_time_preference) ??
    null
  // watched_intro_video: API expects boolean
  const w = String(d.watched_intro_video || '').toLowerCase()
  if (w.includes('نعم') || w.includes('yes') || w === '1' || w === 'true') {
    watchedIntroVideo.value = true
  } else if (w.includes('لا') || w.includes('no') || w === '0' || w === 'false') {
    watchedIntroVideo.value = false
  } else {
    watchedIntroVideo.value = null
  }

  const v = String(d.volunteer || '').toLowerCase()
  if (v.includes('نعم') || v.includes('yes') || v === '1' || v === 'true') {
    volunteer.value = true
  } else if (v.includes('لا') || v.includes('no') || v === '0' || v === 'false') {
    volunteer.value = false
  } else {
    volunteer.value = null
  }

  levelId.value =
    d.level_id ??
    findLookupIdByValue('education_level', d.level) ??
    null

  programTrackId.value =
    d.program_track_id ??
    findLookupIdByValue('program_track', d.program_track) ??
    findLookupIdByValue('program_track', d.program) ??
    null

  // programId derived from track (1=حفظة for 17,18,19 | 2=فرسان for 20,21)
  programId.value =
    d.program_id ??
    (programTrackId.value != null
      ? getProgramIdFromTrackId(programTrackId.value)
      : null)

  const { code, number } = parsePhone(d.phone_number || '')
  phoneCountryCode.value = d.phone_country_code || code
  phoneNumber.value = number || d.phone_number || ''
}

function resetForm() {
  fullName.value = ''
  email.value = ''
  country.value = ''
  genderId.value = null
  birthDate.value = ''
  educationLevelId.value = null
  howDidYouKnowUsId.value = null
  phoneCountryCode.value = '+962'
  phoneNumber.value = ''
  residence.value = ''
  quranMemorizationLevelId.value = null
  hasIjazaId.value = null
  watchedIntroVideo.value = null
  interviewTimePreferenceId.value = null
  programId.value = null
  programTrackId.value = null
  job.value = ''
  volunteer.value = null
  levelId.value = null
  error.value = null
  successMessage.value = null
}

watch(
  () => props.modelValue,
  async (open) => {
    if (!open) {
      resetForm()
      return
    }
    error.value = null
    successMessage.value = null
    if (!props.studentId) return
    studentLoading.value = true
    try {
      await loadLookupsAndConfig()
      const res = await getAdminStudent(props.studentId)
      if (res.success && res.data) {
        populateForm(res.data)
      } else {
        error.value = L.LOAD_ERROR
      }
    } catch {
      error.value = L.LOAD_ERROR
    } finally {
      studentLoading.value = false
    }
  }
)

function formatDateForApi(val: string): string {
  if (!val) return ''
  const d = new Date(val)
  if (isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function closeDialog() {
  emit('update:modelValue', false)
}

function onProgramTrackSelect(v: string | number | null) {
  const id = v === null || v === '' ? null : Number(v)
  programTrackId.value = id
  programId.value = id != null ? getProgramIdFromTrackId(id) : null
}

function handleOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) closeDialog()
}

async function handleSave() {
  error.value = null
  successMessage.value = null

  if (
    !fullName.value.trim() ||
    !email.value.trim() ||
    !country.value.trim() ||
    genderId.value == null ||
    !birthDate.value ||
    educationLevelId.value == null ||
    howDidYouKnowUsId.value == null ||
    hasIjazaId.value == null ||
    !phoneCountryCode.value ||
    !residence.value.trim() ||
    quranMemorizationLevelId.value == null ||
    watchedIntroVideo.value === null ||
    watchedIntroVideo.value === undefined ||
    interviewTimePreferenceId.value == null ||
    programId.value == null ||
    programTrackId.value == null ||
    volunteer.value === null ||
    volunteer.value === undefined ||
    levelId.value == null
  ) {
    error.value = 'يرجى ملء جميع الحقول المطلوبة'
    return
  }

  if (!props.studentId) return

  const payload: UpdateAdminStudentPayload = {
    full_name: fullName.value.trim(),
    email: email.value.trim(),
    country: country.value.trim(),
    gender_id: Number(genderId.value),
    birth_date: formatDateForApi(birthDate.value),
    education_level_id: Number(educationLevelId.value),
    how_did_you_know_us_id: Number(howDidYouKnowUsId.value),
    has_ijaza_id: Number(hasIjazaId.value),
    phone_country_code: phoneCountryCode.value,
    phone_number: phoneNumber.value.trim() || '',
    residence: residence.value.trim(),
    quran_memorization_level_id: Number(quranMemorizationLevelId.value),
    watched_intro_video: Boolean(watchedIntroVideo.value),
    interview_time_preference_id: Number(interviewTimePreferenceId.value),
    program_id: Number(programId.value),
    program_track_id: Number(programTrackId.value),
    job: job.value.trim() || '',
    volunteer: Boolean(volunteer.value),
    level_id: Number(levelId.value),
  }

  submitting.value = true
  try {
    const res = await updateAdminStudent(props.studentId, payload)
    if (res.success) {
      successMessage.value = L.SUCCESS
      setTimeout(() => {
        closeDialog()
        emit('success')
      }, 1500)
    } else {
      error.value = res.message ?? 'فشل تحديث البيانات'
    }
  } catch (e: unknown) {
    error.value =
      e instanceof ApiException
        ? e.message
        : e instanceof Error
          ? e.message
          : 'حدث خطأ أثناء الحفظ'
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
        class="edit-student-dialog"
        @click="handleOverlayClick"
      >
        <div class="edit-student-dialog__content">
          <button
            type="button"
            class="edit-student-dialog__close"
            aria-label="إغلاق"
            @click="closeDialog"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <h2 class="edit-student-dialog__title">{{ L.TITLE }}</h2>
          <p class="edit-student-dialog__subtitle">{{ L.SUBTITLE }}</p>

          <div v-if="studentLoading" class="edit-student-dialog__loading">
            جاري تحميل البيانات...
          </div>

          <form
            v-else
            class="edit-student-dialog__form"
            @submit.prevent="handleSave"
          >
            <div class="edit-student-dialog__grid">
              <div class="edit-student-dialog__field">
                <label class="edit-student-dialog__label">{{ L.FULL_NAME }} *</label>
                <BaseInput v-model="fullName" :placeholder="L.FULL_NAME" required />
              </div>
              <div class="edit-student-dialog__field">
                <label class="edit-student-dialog__label">{{ L.EMAIL }} *</label>
                <BaseInput
                  v-model="email"
                  type="email"
                  :placeholder="L.EMAIL"
                  required
                />
              </div>
              <div class="edit-student-dialog__field">
                <label class="edit-student-dialog__label">{{ L.COUNTRY }} *</label>
                <BaseInput v-model="country" :placeholder="L.COUNTRY" required />
              </div>
              <div class="edit-student-dialog__field">
                <label class="edit-student-dialog__label">{{ L.GENDER }} *</label>
                <BaseSelect
                  :model-value="genderId"
                  :options="genderOptions"
                  :placeholder="L.GENDER"
                  :disabled="studentLoading"
                  @update:model-value="
                    (v) => (genderId = v === null || v === '' ? null : Number(v))
                  "
                />
              </div>
              <div class="edit-student-dialog__field">
                <label class="edit-student-dialog__label">{{ L.BIRTH_DATE }} *</label>
                <BaseDatePicker v-model="birthDate" :placeholder="L.BIRTH_DATE" />
              </div>
              <div class="edit-student-dialog__field">
                <label class="edit-student-dialog__label"
                  >{{ L.EDUCATION_LEVEL }} *</label
                >
                <BaseSelect
                  :model-value="educationLevelId"
                  :options="educationLevelOptions"
                  :placeholder="L.EDUCATION_LEVEL"
                  @update:model-value="
                    (v) =>
                      (educationLevelId =
                        v === null || v === '' ? null : Number(v))
                  "
                />
              </div>
              <div class="edit-student-dialog__field">
                <label class="edit-student-dialog__label"
                  >{{ L.HOW_DID_YOU_KNOW_US }} *</label
                >
                <BaseSelect
                  :model-value="howDidYouKnowUsId"
                  :options="howDidYouKnowUsOptions"
                  :placeholder="L.HOW_DID_YOU_KNOW_US"
                  @update:model-value="
                    (v) =>
                      (howDidYouKnowUsId =
                        v === null || v === '' ? null : Number(v))
                  "
                />
              </div>
              <div class="edit-student-dialog__field">
                <label class="edit-student-dialog__label">{{ L.PHONE }} *</label>
                <BasePhoneInput
                  v-model="phoneNumber"
                  v-model:country-code="phoneCountryCode"
                  :placeholder="L.PHONE"
                />
              </div>
              <div class="edit-student-dialog__field">
                <label class="edit-student-dialog__label">{{ L.RESIDENCE }} *</label>
                <BaseInput v-model="residence" :placeholder="L.RESIDENCE" required />
              </div>
              <div class="edit-student-dialog__field">
                <label class="edit-student-dialog__label"
                  >{{ L.QURAN_MEMORIZATION_LEVEL }} *</label
                >
                <BaseSelect
                  :model-value="quranMemorizationLevelId"
                  :options="quranMemorizationLevelOptions"
                  :placeholder="L.QURAN_MEMORIZATION_LEVEL"
                  @update:model-value="
                    (v) =>
                      (quranMemorizationLevelId =
                        v === null || v === '' ? null : Number(v))
                  "
                />
              </div>
              <div class="edit-student-dialog__field">
                <label class="edit-student-dialog__label"
                  >{{ L.HAS_IJAZA }} *</label
                >
                <BaseSelect
                  :model-value="hasIjazaId"
                  :options="hasIjazaOptions"
                  :placeholder="L.HAS_IJAZA"
                  @update:model-value="
                    (v) =>
                      (hasIjazaId =
                        v === null || v === '' ? null : Number(v))
                  "
                />
              </div>
              <div class="edit-student-dialog__field">
                <label class="edit-student-dialog__label"
                  >{{ L.WATCHED_INTRO_VIDEO }} *</label
                >
                <BaseSelect
                  :model-value="watchedIntroVideo === true ? 'true' : watchedIntroVideo === false ? 'false' : ''"
                  :options="yesNoBooleanOptions"
                  :placeholder="L.WATCHED_INTRO_VIDEO"
                  @update:model-value="
                    (v) =>
                      (watchedIntroVideo =
                        v === 'true'
                          ? true
                          : v === 'false'
                            ? false
                            : null)
                  "
                />
              </div>
              <div class="edit-student-dialog__field">
                <label class="edit-student-dialog__label"
                  >{{ L.INTERVIEW_TIME_PREFERENCE }} *</label
                >
                <BaseSelect
                  :model-value="interviewTimePreferenceId"
                  :options="interviewTimePreferenceOptions"
                  :placeholder="L.INTERVIEW_TIME_PREFERENCE"
                  @update:model-value="
                    (v) =>
                      (interviewTimePreferenceId =
                        v === null || v === '' ? null : Number(v))
                  "
                />
              </div>
              <div class="edit-student-dialog__field">
                <label class="edit-student-dialog__label">{{ L.PROGRAM }} *</label>
                <BaseSelect
                  :model-value="programTrackId"
                  :options="programOptions"
                  :placeholder="L.PROGRAM"
                  @update:model-value="onProgramTrackSelect"
                />
              </div>
              <div class="edit-student-dialog__field">
                <label class="edit-student-dialog__label"
                  >{{ L.PROGRAM_TRACK }} *</label
                >
                <BaseSelect
                  :model-value="programTrackId"
                  :options="programTrackOptions"
                  :placeholder="L.PROGRAM_TRACK"
                  @update:model-value="onProgramTrackSelect"
                />
              </div>
              <div class="edit-student-dialog__field">
                <label class="edit-student-dialog__label">{{ L.JOB }}</label>
                <BaseInput v-model="job" :placeholder="L.JOB" />
              </div>
              <div class="edit-student-dialog__field">
                <label class="edit-student-dialog__label">{{ L.VOLUNTEER }} *</label>
                <BaseSelect
                  :model-value="volunteer === true ? 'true' : volunteer === false ? 'false' : ''"
                  :options="yesNoBooleanOptions"
                  :placeholder="L.VOLUNTEER"
                  @update:model-value="
                    (v) =>
                      (volunteer =
                        v === 'true'
                          ? true
                          : v === 'false'
                            ? false
                            : null)
                  "
                />
              </div>
              <div class="edit-student-dialog__field">
                <label class="edit-student-dialog__label">{{ L.LEVEL }} *</label>
                <BaseSelect
                  :model-value="levelId"
                  :options="levelOptions"
                  :placeholder="L.LEVEL"
                  @update:model-value="
                    (v) =>
                      (levelId = v === null || v === '' ? null : Number(v))
                  "
                />
              </div>
            </div>

            <p v-if="successMessage" class="edit-student-dialog__success">
              {{ successMessage }}
            </p>
            <p v-if="error" class="edit-student-dialog__error">{{ error }}</p>

            <div class="edit-student-dialog__actions">
              <button
                type="submit"
                class="edit-student-dialog__btn edit-student-dialog__btn--primary"
                :disabled="submitting"
              >
                {{ submitting ? L.SAVING : L.SAVE }}
              </button>
              <button
                type="button"
                class="edit-student-dialog__btn edit-student-dialog__btn--cancel"
                @click="closeDialog"
              >
                {{ L.CANCEL }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.edit-student-dialog {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-4;
  background: rgba(0, 0, 0, 0.4);
  direction: rtl;
  overflow-y: auto;
}

.edit-student-dialog__content {
  position: relative;
  width: 100%;
  max-width: 720px;
  max-height: 90vh;
  overflow-y: auto;
  background: #fff;
  border-radius: $radius-xl;
  box-shadow: $shadow-lg;
  padding: $spacing-6;
}

.edit-student-dialog__close {
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

.edit-student-dialog__title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: var(--color-text-primary);
  margin: 0 0 $spacing-1;
  text-align: right;
}

.edit-student-dialog__subtitle {
  font-size: $font-size-sm;
  color: var(--color-text-secondary);
  margin: 0 0 $spacing-5;
  text-align: right;
}

.edit-student-dialog__loading {
  padding: $spacing-8;
  text-align: center;
  color: var(--color-text-secondary);
}

.edit-student-dialog__form {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
}

.edit-student-dialog__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-4;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.edit-student-dialog__field {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}

.edit-student-dialog__label {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: var(--color-text-primary);
  text-align: right;
}

.edit-student-dialog__success {
  padding: $spacing-3 $spacing-4;
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  border-radius: $radius-lg;
  margin: 0;
  text-align: right;
}

.edit-student-dialog__error {
  color: var(--color-error);
  font-size: $font-size-sm;
  margin: 0;
  text-align: right;
}

.edit-student-dialog__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: $spacing-3;
  flex-wrap: wrap;
}

.edit-student-dialog__btn {
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

.dialog-enter-active .edit-student-dialog__content,
.dialog-leave-active .edit-student-dialog__content {
  transition: transform 0.2s ease;
}

.dialog-enter-from .edit-student-dialog__content,
.dialog-leave-to .edit-student-dialog__content {
  transform: scale(0.96);
}
</style>
