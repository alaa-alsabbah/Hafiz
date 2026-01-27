<script setup lang="ts">
import { ref, computed, onMounted, Teleport, Transition } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useValidation, rules } from '@/composables/useValidation'
import { BaseInput, BaseButton, BaseCheckbox, BaseDatePicker } from '@/components/ui'
import { IconArrowRight } from '@/components/icons'
import bgVideoImage from '@/assets/img/bgVedio.png'
import { apiRequest, ApiException } from '@/services/api'
import { API_BASE_URL } from '@/config/api'
import { translateErrorCode, translateErrorCodes } from '@/utils/errorTranslations'

const router = useRouter()
const route = useRoute()

// Get role from query parameter (defaults to 'student')
const selectedRole = computed(() => {
  const type = route.query.type as string
  return type === 'teacher' ? 'teacher' : 'student'
})

// Step management
const currentStep = ref(1)

// Video tab selection
const selectedProgram = ref<'hafiz' | 'fursan'>('hafiz')

// Terms agreement checkbox
const watchedVideoAndAgreed = ref(false)

// Conditions list for step 1
const conditions = [
  'الجدية والالتزام التام بطريقة البرنامج المقطع التعريفي',
  'السلامة من الأخطاء واللحون الجلية',
  'اجتياز المقابلة',
  'رسوم اشتراك 5 دنانير شهرياً',
  'الاشتراك الشهر الأول مجاني'
]

// Lookups data
const lookups = ref<Record<string, any[]>>({
  gender: [],
  education_level: [],
  how_did_you_know_us: [],
  quran_memorization_level: [],
  has_ijaza: [],
  program_track: [],
  interview_time_preference: [],
  yes_no: [],
  mastery_percentage: [],
  experience_years: [],
  memorized_quran_completely: [
    { id: 1, code: 'memorized_quran_completely', key: 'yes', value_en: 'Yes, praise be to Allah', value_ar: 'نعم ولله الحمد' },
    { id: 2, code: 'memorized_quran_completely', key: 'no', value_en: 'No', value_ar: 'لا' }
  ]
})

const isLoadingLookups = ref(false)
const lookupError = ref<string | null>(null)

// Student form step 2
const { form: studentForm, errors: studentErrors, validate: validateStudentForm } = useValidation(
  {
    fullName: '',
    gender: '',
    dateOfBirth: '',
    country: '',
    educationalLevel: '',
    occupation: '',
    howDidYouHear: '',
    phoneNumber: '',
    email: ''
  },
  {
    fullName: [rules.required('الاسم الكامل مطلوب')],
    gender: [rules.required('الجنس مطلوب')],
    dateOfBirth: [rules.required('تاريخ الميلاد مطلوب')],
    country: [rules.required('بلد الإقامة مطلوب')],
    educationalLevel: [rules.required('المستوى التعليمي مطلوب')],
    occupation: [rules.required('الوظيفة مطلوبة')],
    howDidYouHear: [rules.required('كيف عرفت عن البرنامج مطلوب')],
    phoneNumber: [rules.required('رقم الهاتف مطلوب')],
    email: [rules.email('يرجى إدخال بريد إلكتروني صحيح')]
  }
)

// Student form step 3
const { form: studentStep3Form, errors: studentStep3Errors, validate: validateStudentStep3 } = useValidation(
  {
    placeOfResidence: '',
    quranMemorizationLevel: '',
    ijazahOrSanad: '',
    watchedIntroVideo: '',
    desiredPath: '',
    interviewTime: ''
  },
  {
    placeOfResidence: [rules.required('مكان السكن مطلوب')],
    quranMemorizationLevel: [rules.required('كم تحفظ من كتاب الله مطلوب')],
    ijazahOrSanad: [rules.required('هل لديك إجازة أو سند مطلوب')],
    watchedIntroVideo: [rules.required('هل شاهدت المقطع التعريفي مطلوب')],
    desiredPath: [rules.required('المسار الذي ترغب بالمشاركة فيه مطلوب')],
    interviewTime: [rules.required('الموعد المناسب للمقابلة مطلوب')]
  }
)

// Teacher form step 1
const { form: teacherForm, errors: teacherErrors, validate: validateTeacherForm } = useValidation(
  {
    fullName: '',
    email: '',
    password: '',
    country: '',
    dateOfBirth: '',
    occupation: '',
    phoneNumber: '',
    memorizedQuranCompletely: '',
    gender: '',
    educationalLevel: '',
    howDidYouHear: ''
  },
  {
    fullName: [rules.required('الاسم الرباعي مطلوب')],
    email: [rules.required('البريد الإلكتروني مطلوب'), rules.email('يرجى إدخال بريد إلكتروني صحيح')],
    password: [rules.required('كلمة المرور مطلوبة'), rules.minLength(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')],
    country: [rules.required('بلد الإقامة مطلوب')],
    dateOfBirth: [rules.required('تاريخ الميلاد مطلوب')],
    occupation: [rules.required('الوظيفة مطلوبة')],
    phoneNumber: [rules.required('رقم الهاتف مطلوب')],
    memorizedQuranCompletely: [rules.required('هل تحفظ كتاب الله كاملا مطلوب')],
    gender: [rules.required('الجنس مطلوب')],
    educationalLevel: [rules.required('المستوى التعليمي مطلوب')],
    howDidYouHear: [rules.required('كيف عرفت عن البرنامج مطلوب')]
  }
)

// Teacher form step 2
const { form: teacherStep2Form, errors: teacherStep2Errors, validate: validateTeacherStep2 } = useValidation(
  {
    placeOfResidence: '',
    masteryPercentage: '',
    hasIjaza: '',
    experienceYears: '',
    volunteer: '',
    interviewTime: ''
  },
  {
    placeOfResidence: [rules.required('مكان السكن مطلوب')],
    masteryPercentage: [rules.required('نسبة التمكين والإتقان مطلوبة')],
    hasIjaza: [rules.required('هل لديك إجازة أو سند مطلوب')],
    experienceYears: [rules.required('سنوات الخبرة مطلوبة')],
    volunteer: [rules.required('الانضمام مجاناً مطلوب')],
    interviewTime: [rules.required('الموعد المناسب للمقابلة مطلوب')]
  }
)

// Appointment calendar state (for student step 4)
const selectedDate = ref<Date | null>(null)
const selectedTime = ref<string>('')
const calendarMonth = ref(new Date())

// Form submission state
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const submitErrors = ref<Record<string, string[]>>({})
const showSuccessModal = ref(false)
const showErrorModal = ref(false)

// Fetch lookups from API
async function fetchLookup(lookupName: string) {
  try {
    const response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/lookups/${lookupName}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json; charset=utf-8',
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${lookupName}`)
    }
    
    const data = await response.json()
    if (data.success && data.data) {
      return data.data
    }
    return []
  } catch (error) {
    console.error(`Error fetching ${lookupName}:`, error)
    return []
  }
}

async function fetchAllLookups() {
  isLoadingLookups.value = true
  lookupError.value = null
  
  try {
    const lookupNames = ['gender', 'education_level', 'how_did_you_know_us', 'interview_time_preference', 'yes_no']
    
    if (selectedRole.value === 'student') {
      lookupNames.push('quran_memorization_level', 'has_ijaza', 'program_track')
    } else if (selectedRole.value === 'teacher') {
      lookupNames.push('mastery_percentage', 'experience_years', 'has_ijaza')
    }
    
    const results = await Promise.all(lookupNames.map(name => fetchLookup(name)))
    
    lookupNames.forEach((name, index) => {
      lookups.value[name] = results[index] || []
    })
  } catch (error) {
    lookupError.value = 'فشل تحميل البيانات. يرجى المحاولة مرة أخرى.'
    console.error('Error fetching lookups:', error)
  } finally {
    isLoadingLookups.value = false
  }
}

// Helper functions
function getLookupId(lookupName: string, key: string): number | null {
  const items = lookups.value[lookupName] || []
  const item = items.find((i: any) => i.key === key)
  return item ? item.id : null
}

function formatDate(date: Date | string | null): string | null {
  if (!date) return null
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return null
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parsePhoneNumber(phone: string): { countryCode: string | null; number: string } {
  if (!phone) return { countryCode: null, number: phone }
  
  const match = phone.match(/^(\+?962|00962)/i)
  if (match) {
    const countryCode = match[1].replace(/^00/, '+')
    const number = phone.replace(match[1], '').trim()
    return { countryCode, number }
  }
  
  if (phone.startsWith('7')) {
    return { countryCode: '+962', number: phone }
  }
  
  return { countryCode: null, number: phone }
}

function getProgramId(): number {
  return selectedProgram.value === 'fursan' ? 2 : 1
}

// Function to proceed to next step
function nextStep() {
  if (selectedRole.value === 'student') {
    if (currentStep.value === 1) {
      if (!watchedVideoAndAgreed.value) return
      currentStep.value = 2
    } else if (currentStep.value === 2) {
      if (!validateStudentForm()) return
      currentStep.value = 3
    } else if (currentStep.value === 3) {
      if (!validateStudentStep3()) return
      currentStep.value = 4
    }
  } else if (selectedRole.value === 'teacher') {
    if (currentStep.value === 1) {
      if (!validateTeacherForm()) return
      currentStep.value = 2
    }
  }
}

function previousStep() {
  if (selectedRole.value === 'student') {
    if (currentStep.value === 2) {
      currentStep.value = 1
    } else if (currentStep.value === 3) {
      currentStep.value = 2
    } else if (currentStep.value === 4) {
      currentStep.value = 3
    }
  } else if (selectedRole.value === 'teacher') {
    if (currentStep.value === 2) {
      currentStep.value = 1
    } else if (currentStep.value === 1) {
      router.push('/home')
    }
  }
}

// Submit student registration
async function submitStudentRegistration() {
  if (!selectedDate.value || !selectedTime.value) {
    submitError.value = 'يرجى اختيار التاريخ والوقت'
    return
  }
  
  if (!validateStudentForm() || !validateStudentStep3()) {
    submitError.value = 'يرجى ملء جميع الحقول المطلوبة'
    return
  }
  
  isSubmitting.value = true
  submitError.value = null
  submitErrors.value = {}
  
  try {
    const phone = parsePhoneNumber(studentForm.phoneNumber)
    const programTrackId = getLookupId('program_track', studentStep3Form.desiredPath)
    
    if (!programTrackId) {
      submitError.value = 'يرجى اختيار مسار البرنامج الصحيح'
      isSubmitting.value = false
      return
    }
    
    const payload = {
      full_name: studentForm.fullName,
      email: studentForm.email || `${studentForm.fullName.replace(/\s/g, '').toLowerCase()}@hafizfursan.org`,
      password: 'TempPassword123!@#',
      role: 'student',
      gender_id: getLookupId('gender', studentForm.gender),
      country: studentForm.country || null,
      birth_date: formatDate(studentForm.dateOfBirth),
      education_level_id: getLookupId('education_level', studentForm.educationalLevel),
      job: studentForm.occupation || null,
      how_did_you_know_us_id: getLookupId('how_did_you_know_us', studentForm.howDidYouHear),
      phone_country_code: phone.countryCode,
      phone_number: phone.number,
      interview_time_preference_id: getLookupId('interview_time_preference', studentStep3Form.interviewTime),
      interview_date: formatDate(selectedDate.value),
      residence: studentStep3Form.placeOfResidence || null,
      quran_memorization_level_id: getLookupId('quran_memorization_level', studentStep3Form.quranMemorizationLevel),
      has_ijaza_id: getLookupId('has_ijaza', studentStep3Form.ijazahOrSanad),
      watched_intro_video: studentStep3Form.watchedIntroVideo === 'yes' ? 1 : 0,
      program_track_id: programTrackId,
      program_id: getProgramId()
    }
    
    const response = await apiRequest({
      method: 'POST',
      url: '/register',
      data: payload
    })
    
    if (response.success) {
      showSuccessModal.value = true
    }
  } catch (error) {
    if (error instanceof ApiException) {
      if (error.errors && Object.keys(error.errors).length > 0) {
        const translatedErrors: Record<string, string[]> = {}
        Object.keys(error.errors).forEach(key => {
          translatedErrors[key] = translateErrorCodes(error.errors![key])
        })
        submitErrors.value = translatedErrors
        showErrorModal.value = true
      } else {
        submitError.value = translateErrorCode(error.code, error.message || 'حدث خطأ أثناء التسجيل')
      }
    } else {
      submitError.value = 'حدث خطأ غير متوقع'
    }
    console.error('Registration error:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Submit teacher registration
async function submitTeacherRegistration() {
  if (!validateTeacherForm() || !validateTeacherStep2()) {
    submitError.value = 'يرجى ملء جميع الحقول المطلوبة'
    return
  }
  
  isSubmitting.value = true
  submitError.value = null
  submitErrors.value = {}
  
  try {
    const phone = parsePhoneNumber(teacherForm.phoneNumber)
    
    const payload = {
      full_name: teacherForm.fullName,
      email: teacherForm.email,
      password: teacherForm.password,
      role: 'teacher',
      gender_id: getLookupId('gender', teacherForm.gender),
      country: teacherForm.country || null,
      birth_date: formatDate(teacherForm.dateOfBirth),
      education_level_id: getLookupId('education_level', teacherForm.educationalLevel),
      job: teacherForm.occupation || null,
      how_did_you_know_us_id: getLookupId('how_did_you_know_us', teacherForm.howDidYouHear),
      phone_country_code: phone.countryCode,
      phone_number: phone.number,
      interview_time_preference_id: getLookupId('interview_time_preference', teacherStep2Form.interviewTime),
      interview_date: null,
      residence: teacherStep2Form.placeOfResidence || null,
      memorized_quran_completely_id: getLookupId('memorized_quran_completely', teacherForm.memorizedQuranCompletely),
      mastery_percentage_id: getLookupId('mastery_percentage', teacherStep2Form.masteryPercentage),
      experience_years_id: getLookupId('experience_years', teacherStep2Form.experienceYears),
      has_ijaza_id: getLookupId('has_ijaza', teacherStep2Form.hasIjaza),
      volunteer: teacherStep2Form.volunteer === 'yes' ? 1 : 0
    }
    
    const response = await apiRequest({
      method: 'POST',
      url: '/register',
      data: payload
    })
    
    if (response.success) {
      showSuccessModal.value = true
    }
  } catch (error) {
    if (error instanceof ApiException) {
      if (error.errors && Object.keys(error.errors).length > 0) {
        const translatedErrors: Record<string, string[]> = {}
        Object.keys(error.errors).forEach(key => {
          translatedErrors[key] = translateErrorCodes(error.errors![key])
        })
        submitErrors.value = translatedErrors
        showErrorModal.value = true
      } else {
        submitError.value = translateErrorCode(error.code, error.message || 'حدث خطأ أثناء التسجيل')
      }
    } else {
      submitError.value = 'حدث خطأ غير متوقع'
    }
    console.error('Registration error:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Calendar functions
const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
const weekDays = ['سبت', 'أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة']

function isDateAvailable(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const checkDate = new Date(date)
  checkDate.setHours(0, 0, 0, 0)
  
  if (checkDate <= today) return false
  
  const day = checkDate.getDay()
  return day !== 5 && day !== 6 // Not Friday or Saturday
}

function getCalendarDays() {
  const year = calendarMonth.value.getFullYear()
  const month = calendarMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDay = firstDay.getDay()
  const adjustedStartDay = startDay === 6 ? 0 : startDay + 1
  
  const days = []
  
  // Previous month days
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = adjustedStartDay - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i)
    days.push({ date, isCurrentMonth: false, isAvailable: false })
  }
  
  // Current month days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i)
    days.push({ date, isCurrentMonth: true, isAvailable: isDateAvailable(date) })
  }
  
  // Next month days
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i)
    days.push({ date, isCurrentMonth: false, isAvailable: false })
  }
  
  return days
}

function getAvailableTimes(): Array<{ time: string; value: string; label: string }> {
  const times: Array<{ time: string; value: string; label: string }> = []
  
  if (!studentStep3Form.interviewTime) {
    // Default times if no preference selected
    for (let h = 8; h <= 11; h++) {
      times.push({ time: `${h}:00 صباحاً`, value: `${h}:00 AM`, label: `${h}:00 صباحاً` })
    }
    times.push({ time: '12:00 ظهراً', value: '12:00 PM', label: '12:00 ظهراً' })
    for (let h = 1; h <= 11; h++) {
      times.push({ time: `${h}:00 مساءً`, value: `${h}:00 PM`, label: `${h}:00 مساءً` })
    }
    return times
  }
  
  const preference = lookups.value.interview_time_preference.find((p: any) => p.key === studentStep3Form.interviewTime)
  if (!preference) return times
  
  const isMorning = preference.value_ar.includes('صباح') || preference.value_ar.includes('صباحاً')
  const isEvening = preference.value_ar.includes('مساء') || preference.value_ar.includes('مساءً')
  
  if (isMorning) {
    for (let h = 8; h <= 12; h++) {
      const time = h === 12 ? '12:00' : `${h}:00`
      const period = h === 12 ? 'PM' : 'AM'
      const label = h === 12 ? '12:00 ظهراً' : `${h}:00 صباحاً`
      times.push({ time: label, value: `${time} ${period}`, label })
    }
  } else if (isEvening) {
    for (let h = 1; h <= 11; h++) {
      times.push({ time: `${h}:00 مساءً`, value: `${h}:00 PM`, label: `${h}:00 مساءً` })
    }
  }
  
  return times
}

function selectDate(date: Date) {
  if (isDateAvailable(date)) {
    selectedDate.value = date
    selectedTime.value = ''
  }
}

function previousMonth() {
  calendarMonth.value = new Date(calendarMonth.value.getFullYear(), calendarMonth.value.getMonth() - 1, 1)
}

function nextMonth() {
  calendarMonth.value = new Date(calendarMonth.value.getFullYear(), calendarMonth.value.getMonth() + 1, 1)
}

function formatSelectedDate(date: Date): string {
  const dayNames = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
  const dayName = dayNames[date.getDay()]
  const monthName = months[date.getMonth()]
  return `${dayName}، ${monthName} ${date.getDate()}، ${date.getFullYear()}`
}

function formatSelectedTime(time: string): string {
  if (!time) return ''
  const [timePart, period] = time.split(' ')
  return period === 'AM' ? `${timePart} صباحاً` : period === 'PM' ? `${timePart} مساءً` : time
}

function closeSuccessModal() {
  showSuccessModal.value = false
  router.push('/home')
}

function closeErrorModal() {
  showErrorModal.value = false
  submitErrors.value = {}
}

// Load lookups on mount
onMounted(() => {
  fetchAllLookups()
})

</script>

<template>
  <div class="register-view">
    <div class="register-view__container">
      <div 
        class="register-view__grid"
        :class="{ 'register-view__grid--calendar': selectedRole === 'student' && currentStep === 4 }"
      >
        <!-- Form Section -->
        <div class="register-view__form-section">
          <!-- Student Step 1: Video and Conditions -->
          <template v-if="selectedRole === 'student' && currentStep === 1">
            <div class="register-view__header">
              <h1 class="register-view__title">
                نموذج التسجيل في (الدفعة التاسعة) لبرنامجي "حفظة" و "فرسان"
              </h1>
              <p class="register-view__subtitle">
                برنامجان نوعيان لحفظ وإتقان القرآن .
              </p>
            </div>

            <!-- Video Section -->
            <div class="register-view__video-section">
              <div class="register-view__video-tabs">
                <p class="register-view__video-tabs-hint">
                  بالنقر على هذا التبويب يمكنك التبديل بين الفيديوهات
                </p>
                <div class="register-view__video-tabs-buttons">
                  <button
                    class="register-view__video-tab"
                    :class="{ 'register-view__video-tab--active': selectedProgram === 'hafiz' }"
                    @click="selectedProgram = 'hafiz'"
                  >
                    حفظة
                  </button>
                  <button
                    class="register-view__video-tab"
                    :class="{ 'register-view__video-tab--active': selectedProgram === 'fursan' }"
                    @click="selectedProgram = 'fursan'"
                  >
                    فرسان
                  </button>
                </div>
              </div>

              <div class="register-view__video-player">
                <img
                  :src="bgVideoImage"
                  alt="Video thumbnail"
                  class="register-view__video-thumbnail"
                />
                <button class="register-view__video-play-btn">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="11" fill="white" opacity="0.9" />
                    <polygon points="9 7 17 12 9 17 9 7" fill="#1B7A4E" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Conditions -->
            <div class="register-view__conditions">
              <h3 class="register-view__conditions-title">شروط الالتحاق في البرنامج :</h3>
              <ul class="register-view__conditions-list">
                <li
                  v-for="(condition, index) in conditions"
                  :key="index"
                  class="register-view__conditions-item"
                >
                  {{ condition }}
                </li>
              </ul>
            </div>

            <!-- Actions -->
            <div class="register-view__actions">
              <BaseCheckbox
                v-model="watchedVideoAndAgreed"
                label="تمت مشاهدة المقاطع التعريفية وأوافق على الشروط المذكورة"
              />
              <BaseButton
                variant="primary"
                size="lg"
                :disabled="!watchedVideoAndAgreed"
                class="register-view__next-btn"
                @click="nextStep"
              >
                <span>التالي</span>
                <template #trailing>
                  <IconArrowRight />
                </template>
              </BaseButton>
            </div>
          </template>

          <!-- Student Step 2: Personal Information Form -->
          <template v-else-if="selectedRole === 'student' && currentStep === 2">
            <div class="register-view__header">
              <h1 class="register-view__title">
                نموذج التسجيل في (الدفعة التاسعة) لبرنامجي "حفظة" و "فرسان"
              </h1>
              <p class="register-view__subtitle">
                برنامجان نوعيان لحفظ وإتقان القرآن .
              </p>
            </div>

            <div class="register-view__form-fields">
              <BaseInput
                v-model="studentForm.fullName"
                label="الاسم الكامل"
                placeholder="أدخل اسمك الكامل"
                :error="studentErrors.fullName"
                required
              />

              <div class="register-view__field-group">
                <label class="register-view__field-label">
                  الجنس <span class="register-view__required">*</span>
                </label>
                <div class="register-view__segmented-buttons">
                  <button
                    v-for="item in lookups.gender"
                    :key="item.id"
                    type="button"
                    class="register-view__segmented-btn"
                    :class="{ 'register-view__segmented-btn--active': studentForm.gender === item.key }"
                    @click="studentForm.gender = item.key"
                  >
                    {{ item.value_ar }}
                  </button>
                </div>
                <p v-if="studentErrors.gender" class="register-view__field-error">{{ studentErrors.gender }}</p>
              </div>

              <BaseDatePicker
                v-model="studentForm.dateOfBirth"
                label="تاريخ الميلاد"
                placeholder="تاريخ الميلاد"
                :error="studentErrors.dateOfBirth"
                required
              />

              <BaseInput
                v-model="studentForm.country"
                label="بلد الإقامة"
                placeholder="بلد الإقامة"
                :error="studentErrors.country"
                required
              />

              <div class="register-view__field-group">
                <label class="register-view__field-label">
                  المستوى التعليمي <span class="register-view__required">*</span>
                </label>
                <div 
                  class="register-view__segmented-buttons"
                  :class="{
                    'register-view__segmented-buttons--three': lookups.education_level.length === 3,
                    'register-view__segmented-buttons--four': lookups.education_level.length === 4,
                    'register-view__segmented-buttons--five': lookups.education_level.length === 5
                  }"
                >
                  <button
                    v-for="item in lookups.education_level"
                    :key="item.id"
                    type="button"
                    class="register-view__segmented-btn"
                    :class="{ 'register-view__segmented-btn--active': studentForm.educationalLevel === item.key }"
                    @click="studentForm.educationalLevel = item.key"
                  >
                    {{ item.value_ar }}
                  </button>
                </div>
                <p v-if="studentErrors.educationalLevel" class="register-view__field-error">{{ studentErrors.educationalLevel }}</p>
              </div>

              <BaseInput
                v-model="studentForm.occupation"
                label="الوظيفة"
                placeholder="الوظيفة"
                :error="studentErrors.occupation"
                required
              />

              <div class="register-view__field-group">
                <label class="register-view__field-label">
                  كيف عرفت عن البرنامج <span class="register-view__required">*</span>
                </label>
                <div 
                  class="register-view__segmented-buttons"
                  :class="{
                    'register-view__segmented-buttons--two': lookups.how_did_you_know_us.length === 2,
                    'register-view__segmented-buttons--three': lookups.how_did_you_know_us.length === 3,
                    'register-view__segmented-buttons--four': lookups.how_did_you_know_us.length === 4
                  }"
                >
                  <button
                    v-for="item in lookups.how_did_you_know_us"
                    :key="item.id"
                    type="button"
                    class="register-view__segmented-btn"
                    :class="{ 'register-view__segmented-btn--active': studentForm.howDidYouHear === item.key }"
                    @click="studentForm.howDidYouHear = item.key"
                  >
                    {{ item.value_ar }}
                  </button>
                </div>
                <p v-if="studentErrors.howDidYouHear" class="register-view__field-error">{{ studentErrors.howDidYouHear }}</p>
              </div>

              <div class="register-view__field-group">
                <BaseInput
                  v-model="studentForm.phoneNumber"
                  label="رقم الهاتف مع رمز الدولة (واتس اب)"
                  placeholder="رقم هاتف واتساب"
                  :error="studentErrors.phoneNumber"
                  required
                />
                <p class="register-view__field-helper">أرجو التحقق من وجود واتس أب للرقم</p>
              </div>

              <BaseInput
                v-model="studentForm.email"
                type="email"
                label="البريد الإلكتروني (إن وجد)"
                placeholder="example@gmail.com"
                :error="studentErrors.email"
              />

              <div class="register-view__form-actions">
                <BaseButton
                  variant="primary"
                  size="lg"
                  class="register-view__submit-btn"
                  :disabled="!studentForm.fullName || !studentForm.gender || !studentForm.dateOfBirth || !studentForm.country || !studentForm.educationalLevel || !studentForm.occupation || !studentForm.howDidYouHear || !studentForm.phoneNumber || (studentForm.email && studentErrors.email)"
                  @click="nextStep"
                >
                  <span>التالي</span>
                  <template #trailing>
                    <IconArrowRight />
                  </template>
                </BaseButton>
                <BaseButton
                  variant="outline"
                  size="lg"
                  class="register-view__back-btn"
                  @click="previousStep"
                >
                  عودة
                </BaseButton>
              </div>
            </div>
          </template>

          <!-- Student Step 3: Program Questions -->
          <template v-else-if="selectedRole === 'student' && currentStep === 3">
            <div class="register-view__header">
              <h1 class="register-view__title">
                نموذج التسجيل في (الدفعة التاسعة) لبرنامجي "حفظة" و "فرسان"
              </h1>
              <p class="register-view__subtitle">
                برنامجان نوعيان لحفظ وإتقان القرآن .
              </p>
            </div>

            <div class="register-view__form-fields">
              <BaseInput
                v-model="studentStep3Form.placeOfResidence"
                label="مكان السكن (المحافظة-اللواء-القرية أو الحي)"
                placeholder="مكان الإقامة"
                :error="studentStep3Errors.placeOfResidence"
                required
              />

              <div class="register-view__field-group">
                <label class="register-view__field-label">
                  كم تحفظ من كتاب الله ؟ <span class="register-view__required">*</span>
                </label>
                <div 
                  class="register-view__segmented-buttons"
                  :class="{
                    'register-view__segmented-buttons--two': lookups.quran_memorization_level.length === 2,
                    'register-view__segmented-buttons--three': lookups.quran_memorization_level.length === 3,
                    'register-view__segmented-buttons--four': lookups.quran_memorization_level.length === 4,
                    'register-view__segmented-buttons--five': lookups.quran_memorization_level.length === 5,
                    'register-view__segmented-buttons--six': lookups.quran_memorization_level.length === 6
                  }"
                >
                  <button
                    v-for="item in lookups.quran_memorization_level"
                    :key="item.id"
                    type="button"
                    class="register-view__segmented-btn"
                    :class="{ 'register-view__segmented-btn--active': studentStep3Form.quranMemorizationLevel === item.key }"
                    @click="studentStep3Form.quranMemorizationLevel = item.key"
                  >
                    {{ item.value_ar }}
                  </button>
                </div>
                <p v-if="studentStep3Errors.quranMemorizationLevel" class="register-view__field-error">{{ studentStep3Errors.quranMemorizationLevel }}</p>
              </div>

              <div class="register-view__field-group">
                <label class="register-view__field-label">
                  هل لديك إجازة أو سند في القرآن الكريم ؟ <span class="register-view__required">*</span>
                </label>
                <div 
                  class="register-view__segmented-buttons"
                  :class="{
                    'register-view__segmented-buttons--two': lookups.has_ijaza.length === 2,
                    'register-view__segmented-buttons--three': lookups.has_ijaza.length === 3,
                    'register-view__segmented-buttons--four': lookups.has_ijaza.length === 4
                  }"
                >
                  <button
                    v-for="item in lookups.has_ijaza"
                    :key="item.id"
                    type="button"
                    class="register-view__segmented-btn"
                    :class="{ 'register-view__segmented-btn--active': studentStep3Form.ijazahOrSanad === item.key }"
                    @click="studentStep3Form.ijazahOrSanad = item.key"
                  >
                    {{ item.value_ar }}
                  </button>
                </div>
                <p v-if="studentStep3Errors.ijazahOrSanad" class="register-view__field-error">{{ studentStep3Errors.ijazahOrSanad }}</p>
              </div>

              <div class="register-view__field-group">
                <label class="register-view__field-label">
                  هل شاهدت المقطع التعريفي للبرنامجين ؟ <span class="register-view__required">*</span>
                </label>
                <p class="register-view__field-hint">(أرجو مشاهدة المقطع التعريفي قبل اختيار المسار المراد المشاركة فيه)</p>
                <div class="register-view__segmented-buttons">
                  <button
                    v-for="item in lookups.yes_no"
                    :key="item.id"
                    type="button"
                    class="register-view__segmented-btn"
                    :class="{ 'register-view__segmented-btn--active': studentStep3Form.watchedIntroVideo === item.key }"
                    @click="studentStep3Form.watchedIntroVideo = item.key"
                  >
                    {{ item.value_ar }}
                  </button>
                </div>
                <p v-if="studentStep3Errors.watchedIntroVideo" class="register-view__field-error">{{ studentStep3Errors.watchedIntroVideo }}</p>
              </div>

              <div class="register-view__field-group">
                <label class="register-view__field-label">
                  المسار الذي ترغب بالمشاركة فيه ؟ <span class="register-view__required">*</span>
                </label>
                <p class="register-view__field-hint">ملاحظة : برنامج فرسان | المسار الفضي في ست سنوات (مغلق) ، يفتح بعد اجتياز المستوى الثاني (جزء تبارك)</p>
                <div class="register-view__segmented-buttons register-view__segmented-buttons--vertical">
                  <button
                    v-for="item in lookups.program_track"
                    :key="item.id"
                    type="button"
                    class="register-view__segmented-btn register-view__segmented-btn--full"
                    :class="{ 'register-view__segmented-btn--active': studentStep3Form.desiredPath === item.key }"
                    @click="studentStep3Form.desiredPath = item.key"
                  >
                    {{ item.value_ar }}
                  </button>
                </div>
                <p v-if="studentStep3Errors.desiredPath" class="register-view__field-error">{{ studentStep3Errors.desiredPath }}</p>
              </div>

              <div class="register-view__field-group">
                <label class="register-view__field-label">
                  الموعد المناسب للمقابلة ؟ <span class="register-view__required">*</span>
                </label>
                <div class="register-view__segmented-buttons">
                  <button
                    v-for="item in lookups.interview_time_preference"
                    :key="item.id"
                    type="button"
                    class="register-view__segmented-btn"
                    :class="{ 'register-view__segmented-btn--active': studentStep3Form.interviewTime === item.key }"
                    @click="studentStep3Form.interviewTime = item.key"
                  >
                    {{ item.value_ar }}
                  </button>
                </div>
                <p v-if="studentStep3Errors.interviewTime" class="register-view__field-error">{{ studentStep3Errors.interviewTime }}</p>
              </div>

              <div class="register-view__form-actions">
                <BaseButton
                  variant="primary"
                  size="lg"
                  class="register-view__submit-btn"
                  :disabled="!studentStep3Form.placeOfResidence || !studentStep3Form.quranMemorizationLevel || !studentStep3Form.ijazahOrSanad || !studentStep3Form.watchedIntroVideo || !studentStep3Form.desiredPath || !studentStep3Form.interviewTime"
                  @click="nextStep"
                >
                  <span>إرسال التسجيل</span>
                  <template #trailing>
                    <IconArrowRight />
                  </template>
                </BaseButton>
                <BaseButton
                  variant="outline"
                  size="lg"
                  class="register-view__back-btn"
                  @click="previousStep"
                >
                  عودة
                </BaseButton>
              </div>
            </div>
          </template>

          <!-- Student Step 4: Appointment Calendar -->
          <template v-else-if="selectedRole === 'student' && currentStep === 4">
            <div class="register-view__appointment">
              <div class="d-flex align-items-center justify-content-between gap-4">
                <div class="register-view__appointment-header">
                  <h1 class="register-view__appointment-title">حدد موعد مقابلتك</h1>
                  <p class="register-view__appointment-subtitle">اختر تاريخا ووقتا مناسبين لمقابلتك في البرنامج</p>
                </div>
                <div class="register-view__back-section">
                  <BaseButton
                    variant="outline"
                    size="md"
                    class="register-view__back-btn-top"
                    @click="previousStep"
                  >
                    عودة
                  </BaseButton>
                </div>
              </div>

              <div class="register-view__appointment-grid">
                <div class="register-view__appointment-info-panel">
                  <div class="register-view__info-card">
                    <h3 class="register-view__info-card-title">معلوماتك</h3>
                    <div class="register-view__info-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span>{{ studentForm.fullName }}</span>
                    </div>
                    <div class="register-view__info-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      <span>{{ studentForm.email || 'info@hafizfursan.org' }}</span>
                    </div>
                    <div class="register-view__info-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <span>{{ studentForm.phoneNumber }}</span>
                    </div>
                  </div>
                  <div class="register-view__info-card">
                    <h3 class="register-view__info-card-title">تفاصيل البرنامج</h3>
                    <div class="register-view__info-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                      <span>{{ lookups.program_track.find((p: any) => p.key === studentStep3Form.desiredPath)?.value_ar || '' }}</span>
                    </div>
                    <div class="register-view__info-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                      <span>مستوى جزء عم</span>
                    </div>
                  </div>
                </div>

                <div class="register-view__appointment-calendar-panel">
                  <div class="register-view__calendar-header">
                    <button type="button" class="register-view__calendar-nav" @click="previousMonth">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </button>
                    <div class="register-view__calendar-title">
                      {{ months[calendarMonth.value.getMonth()] }} {{ calendarMonth.value.getFullYear() }}
                    </div>
                    <button type="button" class="register-view__calendar-nav" @click="nextMonth">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                    </button>
                  </div>
                  <div class="register-view__calendar-days-header">
                    <div v-for="day in weekDays" :key="day" class="register-view__calendar-day-name">
                      {{ day }}
                    </div>
                  </div>
                  <div class="register-view__calendar-grid">
                    <button
                      v-for="(day, index) in getCalendarDays()"
                      :key="index"
                      type="button"
                      class="register-view__calendar-day-btn"
                      :class="{
                        'register-view__calendar-day-btn--other-month': !day.isCurrentMonth,
                        'register-view__calendar-day-btn--selected': selectedDate && day.date.toDateString() === selectedDate.toDateString(),
                        'register-view__calendar-day-btn--available': day.isAvailable && day.isCurrentMonth
                      }"
                      :disabled="!day.isAvailable || !day.isCurrentMonth"
                      @click="selectDate(day.date)"
                    >
                      {{ day.date.getDate() }}
                    </button>
                  </div>
                </div>

                <div class="register-view__appointment-time-panel">
                  <div v-if="selectedDate" class="register-view__time-header">
                    {{ weekDays[selectedDate.getDay()] }} {{ selectedDate.getDate() }}
                  </div>
                  <div v-else class="register-view__time-header-placeholder">اختر تاريخاً أولاً</div>
                  <div class="register-view__time-slots">
                    <button
                      v-for="time in getAvailableTimes()"
                      :key="time.value"
                      type="button"
                      class="register-view__time-slot"
                      :class="{ 'register-view__time-slot--active': selectedTime === time.value }"
                      :disabled="!selectedDate"
                      @click="selectedTime = time.value"
                    >
                      {{ time.label }}
                    </button>
                  </div>
                </div>
              </div>

              <Transition name="confirmation">
                <div v-if="selectedDate && selectedTime" class="register-view__confirmation-section">
                  <div class="register-view__confirmation-content">
                    <h3 class="register-view__confirmation-title">تم جدولة المقابلة لـ :</h3>
                    <div class="register-view__confirmation-date">{{ formatSelectedDate(selectedDate) }}</div>
                    <div class="register-view__confirmation-time">{{ formatSelectedTime(selectedTime) }}</div>
                    <BaseButton
                      variant="primary"
                      size="lg"
                      class="register-view__confirm-btn"
                      :disabled="isSubmitting"
                      @click="submitStudentRegistration"
                    >
                      {{ isSubmitting ? 'جاري التسجيل...' : 'تأكيد جدول المقابلة' }}
                    </BaseButton>
                    <p v-if="submitError" class="register-view__confirmation-error">{{ submitError }}</p>
                    <p class="register-view__confirmation-note">
                      ستتلقى بريدًا إلكترونيًا للتأكيد يحتوي على تفاصيل المقابلة ورابط للانضمام عبر الإنترنت.
                    </p>
                  </div>
                </div>
              </Transition>
            </div>
          </template>

          <!-- Teacher Step 1 -->
          <template v-else-if="selectedRole === 'teacher' && currentStep === 1">
            <div class="register-view__header">
              <h1 class="register-view__title">
                نموذج تسجيل المقرئين (المستمعين) في برنامجي "حفظة" و"فرسان"
              </h1>
              <p class="register-view__subtitle">
                برنامجان نوعيان لحفظ وإتقان القرآن
              </p>
            </div>

            <div class="register-view__form-fields">
              <BaseInput
                v-model="teacherForm.fullName"
                label="الاسم الرباعي"
                placeholder="أدخل الاسم الرباعي"
                :error="teacherErrors.fullName"
                required
              />

              <BaseInput
                v-model="teacherForm.email"
                type="email"
                label="البريد الإلكتروني"
                placeholder="example@gmail.com"
                :error="teacherErrors.email"
                required
              />

              <BaseInput
                v-model="teacherForm.password"
                type="password"
                label="كلمة المرور"
                placeholder="أدخل كلمة المرور الخاصة بك"
                :error="teacherErrors.password"
                required
              />

              <BaseInput
                v-model="teacherForm.country"
                label="بلد الإقامة"
                placeholder="بلد الإقامة"
                :error="teacherErrors.country"
                required
              />

              <BaseDatePicker
                v-model="teacherForm.dateOfBirth"
                label="تاريخ الميلاد"
                placeholder="تاريخ الميلاد"
                :error="teacherErrors.dateOfBirth"
                required
              />

              <BaseInput
                v-model="teacherForm.occupation"
                label="الوظيفة"
                placeholder="الوظيفة"
                :error="teacherErrors.occupation"
                required
              />

              <div class="register-view__field-group">
                <BaseInput
                  v-model="teacherForm.phoneNumber"
                  label="رقم الهاتف مع رمز الدولة (واتس اب)"
                  placeholder="رقم هاتف واتساب"
                  :error="teacherErrors.phoneNumber"
                  required
                />
                <p class="register-view__field-helper">أرجو التحقق من وجود واتس أب للرقم</p>
              </div>

              <div class="register-view__field-group">
                <label class="register-view__field-label">
                  هل تحفظ كتاب الله كاملا ؟ <span class="register-view__required">*</span>
                </label>
                <div class="register-view__segmented-buttons register-view__segmented-buttons--two">
                  <button
                    v-for="item in lookups.memorized_quran_completely"
                    :key="item.id"
                    type="button"
                    class="register-view__segmented-btn"
                    :class="{ 'register-view__segmented-btn--active': teacherForm.memorizedQuranCompletely === item.key }"
                    @click="teacherForm.memorizedQuranCompletely = item.key"
                  >
                    {{ item.value_ar }}
                  </button>
                </div>
                <p v-if="teacherErrors.memorizedQuranCompletely" class="register-view__field-error">{{ teacherErrors.memorizedQuranCompletely }}</p>
              </div>

              <div class="register-view__field-group">
                <label class="register-view__field-label">
                  الجنس <span class="register-view__required">*</span>
                </label>
                <div class="register-view__segmented-buttons register-view__segmented-buttons--two">
                  <button
                    v-for="item in lookups.gender"
                    :key="item.id"
                    type="button"
                    class="register-view__segmented-btn"
                    :class="{ 'register-view__segmented-btn--active': teacherForm.gender === item.key }"
                    @click="teacherForm.gender = item.key"
                  >
                    {{ item.value_ar }}
                  </button>
                </div>
                <p v-if="teacherErrors.gender" class="register-view__field-error">{{ teacherErrors.gender }}</p>
              </div>

              <div class="register-view__field-group">
                <label class="register-view__field-label">
                  المستوى التعليمي <span class="register-view__required">*</span>
                </label>
                <div 
                  class="register-view__segmented-buttons"
                  :class="{
                    'register-view__segmented-buttons--three': lookups.education_level.length === 3,
                    'register-view__segmented-buttons--four': lookups.education_level.length === 4
                  }"
                >
                  <button
                    v-for="item in lookups.education_level"
                    :key="item.id"
                    type="button"
                    class="register-view__segmented-btn"
                    :class="{ 'register-view__segmented-btn--active': teacherForm.educationalLevel === item.key }"
                    @click="teacherForm.educationalLevel = item.key"
                  >
                    {{ item.value_ar }}
                  </button>
                </div>
                <p v-if="teacherErrors.educationalLevel" class="register-view__field-error">{{ teacherErrors.educationalLevel }}</p>
              </div>

              <div class="register-view__field-group">
                <label class="register-view__field-label">
                  كيف عرفت عن البرنامج ؟ <span class="register-view__required">*</span>
                </label>
                <div 
                  class="register-view__segmented-buttons"
                  :class="{
                    'register-view__segmented-buttons--two': lookups.how_did_you_know_us.length === 2,
                    'register-view__segmented-buttons--three': lookups.how_did_you_know_us.length === 3,
                    'register-view__segmented-buttons--four': lookups.how_did_you_know_us.length === 4
                  }"
                >
                  <button
                    v-for="item in lookups.how_did_you_know_us"
                    :key="item.id"
                    type="button"
                    class="register-view__segmented-btn"
                    :class="{ 'register-view__segmented-btn--active': teacherForm.howDidYouHear === item.key }"
                    @click="teacherForm.howDidYouHear = item.key"
                  >
                    {{ item.value_ar }}
                  </button>
                </div>
                <p v-if="teacherErrors.howDidYouHear" class="register-view__field-error">{{ teacherErrors.howDidYouHear }}</p>
              </div>

              <div class="register-view__form-actions">
                <BaseButton
                  variant="primary"
                  size="lg"
                  class="register-view__submit-btn"
                  :disabled="!teacherForm.fullName || !teacherForm.email || !teacherForm.password || teacherForm.password.length < 8 || !teacherForm.country || !teacherForm.dateOfBirth || !teacherForm.occupation || !teacherForm.phoneNumber || !teacherForm.memorizedQuranCompletely || !teacherForm.gender || !teacherForm.educationalLevel || !teacherForm.howDidYouHear || teacherErrors.email"
                  @click="nextStep"
                >
                  <span>التالي</span>
                  <template #trailing>
                    <IconArrowRight />
                  </template>
                </BaseButton>
                <BaseButton
                  variant="outline"
                  size="lg"
                  class="register-view__back-btn"
                  @click="previousStep"
                >
                  عودة
                </BaseButton>
              </div>
            </div>
          </template>

          <!-- Teacher Step 2 -->
          <template v-else-if="selectedRole === 'teacher' && currentStep === 2">
            <div class="register-view__header">
              <h1 class="register-view__title">
                نموذج التسجيل في المقرئين (المسمعين) لبرنامجي "حفظة" و "فرسان".
              </h1>
              <p class="register-view__subtitle">
                برنامجان نوعيان لحفظ وإتقان القرآن .
              </p>
            </div>

            <div class="register-view__form-fields">
              <BaseInput
                v-model="teacherStep2Form.placeOfResidence"
                label="مكان السكن (المحافظة-اللواء-القرية أو الحي) *"
                placeholder="مكان الإقامة"
                :error="teacherStep2Errors.placeOfResidence"
                required
              />

              <div class="register-view__field-group">
                <label class="register-view__field-label">
                  كم نسبة التمكين والإتقان للقرآن الكريم ؟ <span class="register-view__required">*</span>
                </label>
                <div 
                  class="register-view__segmented-buttons"
                  :class="{ 'register-view__segmented-buttons--three': lookups.mastery_percentage?.length === 3 }"
                >
                  <button
                    v-for="item in (lookups.mastery_percentage || [])"
                    :key="item.id"
                    type="button"
                    class="register-view__segmented-btn"
                    :class="{ 'register-view__segmented-btn--active': teacherStep2Form.masteryPercentage === item.key }"
                    @click="teacherStep2Form.masteryPercentage = item.key"
                  >
                    {{ item.value_ar }}
                  </button>
                </div>
                <p v-if="teacherStep2Errors.masteryPercentage" class="register-view__field-error">{{ teacherStep2Errors.masteryPercentage }}</p>
              </div>

              <div class="register-view__field-group">
                <label class="register-view__field-label">
                  هل لديك إجازة أو سند في القرآن الكريم ؟ <span class="register-view__required">*</span>
                </label>
                <div 
                  class="register-view__segmented-buttons"
                  :class="{
                    'register-view__segmented-buttons--two': lookups.has_ijaza?.length === 2,
                    'register-view__segmented-buttons--three': lookups.has_ijaza?.length === 3
                  }"
                >
                  <button
                    v-for="item in (lookups.has_ijaza || [])"
                    :key="item.id"
                    type="button"
                    class="register-view__segmented-btn"
                    :class="{ 'register-view__segmented-btn--active': teacherStep2Form.hasIjaza === item.key }"
                    @click="teacherStep2Form.hasIjaza = item.key"
                  >
                    {{ item.value_ar }}
                  </button>
                </div>
                <p v-if="teacherStep2Errors.hasIjaza" class="register-view__field-error">{{ teacherStep2Errors.hasIjaza }}</p>
              </div>

              <div class="register-view__field-group">
                <label class="register-view__field-label">
                  عدد سنوات الخبرة في التسميع ؟ <span class="register-view__required">*</span>
                </label>
                <div 
                  class="register-view__segmented-buttons"
                  :class="{ 'register-view__segmented-buttons--four': lookups.experience_years?.length === 4 }"
                >
                  <button
                    v-for="item in (lookups.experience_years || [])"
                    :key="item.id"
                    type="button"
                    class="register-view__segmented-btn"
                    :class="{ 'register-view__segmented-btn--active': teacherStep2Form.experienceYears === item.key }"
                    @click="teacherStep2Form.experienceYears = item.key"
                  >
                    {{ item.value_ar }}
                  </button>
                </div>
                <p v-if="teacherStep2Errors.experienceYears" class="register-view__field-error">{{ teacherStep2Errors.experienceYears }}</p>
              </div>

              <div class="register-view__field-group">
                <label class="register-view__field-label">
                  هل ترغب بالانضمام معنا مجاناً (احتساب) ؟ <span class="register-view__required">*</span>
                </label>
                <div class="register-view__segmented-buttons register-view__segmented-buttons--two">
                  <button
                    v-for="item in lookups.yes_no"
                    :key="item.id"
                    type="button"
                    class="register-view__segmented-btn"
                    :class="{ 'register-view__segmented-btn--active': teacherStep2Form.volunteer === item.key }"
                    @click="teacherStep2Form.volunteer = item.key"
                  >
                    {{ item.value_ar }}
                  </button>
                </div>
                <p v-if="teacherStep2Errors.volunteer" class="register-view__field-error">{{ teacherStep2Errors.volunteer }}</p>
              </div>

              <div class="register-view__field-group">
                <label class="register-view__field-label">
                  الموعد المناسب للمقابلة ؟ <span class="register-view__required">*</span>
                </label>
                <div class="register-view__segmented-buttons register-view__segmented-buttons--two">
                  <button
                    v-for="item in lookups.interview_time_preference"
                    :key="item.id"
                    type="button"
                    class="register-view__segmented-btn"
                    :class="{ 'register-view__segmented-btn--active': teacherStep2Form.interviewTime === item.key }"
                    @click="teacherStep2Form.interviewTime = item.key"
                  >
                    {{ item.value_ar }}
                  </button>
                </div>
                <p v-if="teacherStep2Errors.interviewTime" class="register-view__field-error">{{ teacherStep2Errors.interviewTime }}</p>
              </div>

              <div class="register-view__form-actions">
                <BaseButton
                  variant="primary"
                  size="lg"
                  class="register-view__submit-btn"
                  :disabled="isSubmitting || !teacherStep2Form.placeOfResidence || !teacherStep2Form.masteryPercentage || !teacherStep2Form.hasIjaza || !teacherStep2Form.experienceYears || !teacherStep2Form.volunteer || !teacherStep2Form.interviewTime"
                  @click="submitTeacherRegistration"
                >
                  {{ isSubmitting ? 'جاري التسجيل...' : 'إرسال التسجيل' }}
                </BaseButton>
                <BaseButton
                  variant="outline"
                  size="lg"
                  class="register-view__back-btn"
                  @click="previousStep"
                >
                  عودة
                </BaseButton>
              </div>
              <p v-if="submitError" class="register-view__confirmation-error">{{ submitError }}</p>
            </div>
          </template>
        </div>

        <!-- Success Modal -->
        <Teleport to="body">
          <Transition name="success-modal">
            <div v-if="showSuccessModal" class="registration-success-overlay" @click.self="closeSuccessModal">
              <div class="registration-success-modal">
                <button type="button" class="registration-success-close" @click="closeSuccessModal">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
                <div class="registration-success-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h2 class="registration-success-title">تم التسجيل بنجاح!</h2>
                <p class="registration-success-text">
                  تم تسجيل طلبك بنجاح. سنتواصل معك قريباً لتأكيد موعد المقابلة.
                </p>
                <button type="button" class="registration-success-btn" @click="closeSuccessModal">
                  العودة إلى الصفحة الرئيسية
                </button>
              </div>
            </div>
          </Transition>
        </Teleport>

        <!-- Error Modal -->
        <Teleport to="body">
          <Transition name="error-modal">
            <div v-if="showErrorModal && Object.keys(submitErrors).length > 0" class="registration-error-overlay" @click.self="closeErrorModal">
              <div class="registration-error-modal">
                <button type="button" class="registration-error-close" @click="closeErrorModal">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
                <div class="registration-error-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h2 class="registration-error-title">يرجى تصحيح الأخطاء التالية</h2>
                <div class="registration-error-content">
                  <ul class="registration-error-list">
                    <li v-for="(errors, field) in submitErrors" :key="field" class="registration-error-item">
                      <div class="registration-error-field">
                        <span class="registration-error-field-label">{{ field }}:</span>
                        <ul class="registration-error-messages">
                          <li v-for="(error, index) in errors" :key="index" class="registration-error-message">
                            {{ error }}
                          </li>
                        </ul>
                      </div>
                    </li>
                  </ul>
                </div>
                <button type="button" class="registration-error-btn" @click="closeErrorModal">
                  فهمت
                </button>
              </div>
            </div>
          </Transition>
        </Teleport>

        <!-- Info Section (shown when not on appointment step) -->
        <div v-if="selectedRole === 'student' && currentStep !== 4" class="register-view__info-section">
          <div class="register-view__journey">
            <h2 class="register-view__journey-title">ابدأ رحلتك القرآنية</h2>
            <p class="register-view__journey-text">
              انضم إلى برنامج شامل مصمم خصيصاً لمساعدتك في حفظ وإتقان القرآن الكريم. مع إرشادات شخصية من معلمين معتمدين، وخطط دراسية منظمة، ودعم مستمر طوال رحلتك. ابدأ اليوم واتخذ خطوتك الأولى نحو إتقان كتاب الله.
            </p>
          </div>

          <div class="register-view__help">
            <h3 class="register-view__help-title">هل تحتاج مساعدة في التسجيل؟</h3>
            <p class="register-view__help-text">
              إذا واجهت أي صعوبة أثناء التسجيل أو لديك أي استفسار، لا تتردد في التواصل معنا. فريقنا جاهز لمساعدتك في أي وقت.
            </p>
            <BaseButton
              variant="secondary"
              size="lg"
              class="register-view__contact-btn"
            >
              <span>اتصل بنا</span>
              <template #trailing>
                <IconArrowRight />
              </template>
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.register-view {
  min-height: calc(100vh - 200px);
  padding: 2rem 1.5rem;
  background: transparent;
}

.register-view__container {
  max-width: 1200px;
  margin: 0 auto;
}

.register-view__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;

  @include md {
    grid-template-columns: 1.2fr 1fr;
    gap: 3rem;
  }

  &--calendar {
    grid-template-columns: 1fr;

    @include md {
      grid-template-columns: 1fr;
    }
  }
}

.register-view__form-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.register-view__header {
  text-align: right;
}

.register-view__title {
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.register-view__subtitle {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.register-view__video-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.register-view__video-tabs {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.register-view__video-tabs-hint {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
  text-align: right;
}

.register-view__video-tabs-buttons {
  display: inline-flex;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 0.75rem;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  gap: 0;
  align-self: flex-end;
}

.register-view__video-tab {
  padding: 0.5rem 1.25rem;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-weight: 500;
  font-family: inherit;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease;
  border-radius: 0.5rem;

  &:first-child {
    border-top-right-radius: 0.75rem;
    border-bottom-right-radius: 0.75rem;
  }

  &:last-child {
    border-top-left-radius: 0.75rem;
    border-bottom-left-radius: 0.75rem;
  }

  &--active {
    background: var(--color-primary);
    color: #fff;
  }

  &:not(&--active):hover {
    background: var(--color-background);
  }
}

.register-view__video-player {
  position: relative;
  width: 100%;
  border-radius: 1rem;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle at 20% 30%, rgba(27, 122, 78, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(27, 122, 78, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
}

.register-view__video-thumbnail {
  width: 100%;
  height: auto;
  border-radius: 0.75rem;
  display: block;
  position: relative;
  z-index: 1;
}

.register-view__video-play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  z-index: 2;

  &:hover {
    transform: translate(-50%, -50%) scale(1.1);
  }
}

.register-view__conditions {
  background: transparent;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.register-view__conditions-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 1rem;
  text-align: right;
}

.register-view__conditions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.register-view__conditions-item {
  font-size: 1rem;
  color: var(--color-text-primary);
  padding-right: 1.25rem;
  position: relative;
  line-height: 1.6;

  &::before {
    content: '•';
    position: absolute;
    right: 0;
    color: var(--color-primary);
    font-weight: 700;
    font-size: 1.25rem;
  }
}

.register-view__actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.register-view__next-btn {
  align-self: flex-start;
}

.register-view__form-fields {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: #fbfbfb;
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid rgb(217, 217, 217);
}

.register-view__form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-start;
  margin-top: 0.5rem;
}

.register-view__back-btn,
.register-view__submit-btn {
  min-width: 120px;
}

.register-view__info-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.register-view__journey {
  text-align: right;
}

.register-view__journey-title {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 1rem;
}

.register-view__journey-text {
  font-size: 1rem;
  color: var(--color-text-secondary);
  line-height: 1.8;
  margin: 0;
}

.register-view__help {
  position: relative;
  background: linear-gradient(85.98deg, #ecfdf5 -69.11%, #009968 97.02%);
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: right;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.register-view__help-title {
  position: relative;
  z-index: 1;
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.75rem;
}

.register-view__help-text {
  position: relative;
  z-index: 1;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.8;
  margin-bottom: 1.5rem;
}

.register-view__contact-btn {
  position: relative;
  z-index: 1;
  background: linear-gradient(90deg, #3c3c3c, #1e1e1e);
  color: #fff;
  border: none;

  &:hover:not(:disabled) {
    background: linear-gradient(90deg, #505050, #323232);
  }

  svg {
    transform: rotate(180deg);
  }
}

/* Field groups and segmented buttons */
.register-view__field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.register-view__field-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary);
}

.register-view__required {
  color: var(--color-error);
  margin-right: 0.25rem;
}

.register-view__field-helper {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
  margin-top: -0.25rem;
}

.register-view__field-hint {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
  margin-bottom: 0.5rem;
  font-style: italic;
}

.register-view__field-error {
  font-size: 0.875rem;
  color: var(--color-error);
  margin: 0;
}

.register-view__segmented-buttons {
  display: inline-flex;
  gap: 0.5rem;
  align-self: flex-start;
  flex-wrap: wrap;
}

.register-view__segmented-buttons--two .register-view__segmented-btn {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
}

.register-view__segmented-buttons--three .register-view__segmented-btn {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
}

.register-view__segmented-buttons--four .register-view__segmented-btn {
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
}

.register-view__segmented-buttons--five .register-view__segmented-btn {
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
}

.register-view__segmented-buttons--six .register-view__segmented-btn {
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
  flex: 0 1 auto;
}

.register-view__segmented-buttons--vertical {
  flex-direction: column;
  width: 100%;
  align-self: stretch;
}

.register-view__segmented-btn {
  padding: 0.5rem 1.25rem;
  border: 1px solid;
  background: #f6f6f6;
  color: #d9d9d9;
  border-color: #d9d9d9;
  font-weight: 500;
  font-family: inherit;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.15s ease;
  border-radius: 0.5rem;
  white-space: nowrap;

  &--active {
    background: #ecfdf5;
    color: #14a274;
    border-color: #14a274;
  }

  &--full {
    width: 100%;
    text-align: right;
    white-space: normal;
  }

  &:not(&--active):hover {
    background: #f6f6f6;
    color: #d9d9d9;
    border-color: #d9d9d9;
  }
}

// Appointment calendar styles
.register-view__appointment {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.register-view__appointment-header {
  text-align: right;
}

.register-view__appointment-title {
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.register-view__appointment-subtitle {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.register-view__back-section {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 1rem;
}

.register-view__back-btn-top {
  min-width: 100px;
}

.register-view__appointment-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @include md {
    grid-template-columns: 300px 1fr 200px;
  }
}

.register-view__appointment-info-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.register-view__info-card {
  background: #fff;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.register-view__info-card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgb(217, 217, 217);
}

.register-view__info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
  color: var(--color-text-primary);
  padding: 0.25rem 0;

  svg {
    width: 16px;
    height: 16px;
    color: var(--color-text-secondary);
    flex-shrink: 0;
  }
}

.register-view__appointment-calendar-panel {
  background: #fff;
  border-radius: 1rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.register-view__calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.register-view__calendar-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.15s ease;

  &:hover {
    background: #ecfdf5;
    color: #14a274;
  }

  svg {
    width: 20px;
    height: 20px;
  }
}

.register-view__calendar-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.register-view__calendar-days-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.register-view__calendar-day-name {
  text-align: center;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  padding: 0.5rem;
}

.register-view__calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1.25rem;
}

.register-view__calendar-day-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  background: transparent;
  color: var(--color-text-primary);
  font-size: 1rem;
  cursor: pointer;
  border-radius: 0.75rem;
  transition: all 0.15s ease;
  padding: 0.5rem;
  min-height: 44px;
  font-weight: 500;

  &--available {
    background: #f6f6f6;
    color: var(--color-text-primary);
    cursor: pointer;
    border: 1px solid rgb(217, 217, 217);

    &:hover {
      background: #ecfdf5;
      border-color: #14a274;
      color: #14a274;
      transform: scale(1.05);
      box-shadow: 0 2px 6px rgba(20, 162, 116, 0.2);
    }
  }

  &--selected {
    background: #14a274;
    color: #fff;
    font-weight: 700;
    border-color: #14a274;
    box-shadow: 0 2px 8px rgba(20, 162, 116, 0.4);
    transform: scale(1.05);
  }

  &--other-month {
    opacity: 0.3;
    cursor: not-allowed;
    background: transparent;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    background: transparent;
  }
}

.register-view__appointment-time-panel {
  background: #fff;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.register-view__time-header {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-primary);
  text-align: center;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
}

.register-view__time-header-placeholder {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  text-align: center;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
}

.register-view__time-slots {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 450px;
  overflow-y: auto;
  padding: 0.5rem 0;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #d9d9d9;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(20, 162, 116, 0.5);
  }
}

.register-view__time-slot {
  padding: 1rem 1.25rem;
  border: 1px solid rgb(217, 217, 217);
  background: #f6f6f6;
  color: #646464;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
  font-size: 1rem;
  font-weight: 500;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:not(:disabled):hover {
    border-color: #14a274;
    color: #14a274;
    background: rgba(236, 253, 245, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(20, 162, 116, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--active {
    background: #ecfdf5;
    color: #14a274;
    border-color: #14a274;
    font-weight: 700;
    box-shadow: 0 2px 8px rgba(20, 162, 116, 0.3);
  }
}

.register-view__confirmation-section {
  position: relative;
  background: #ecfdf5;
  border-radius: 1rem;
  padding: 0.5rem 1rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
  align-items: center;
  margin-top: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.register-view__confirmation-content {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-align: right;
  z-index: 1;
}

.register-view__confirmation-title {
  font-size: clamp(1.25rem, 2vw, 1.5rem);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  margin-bottom: 0.5rem;
  text-align: right;
}

.register-view__confirmation-date {
  font-size: 1rem;
  color: var(--color-text-primary);
  padding: 0.25rem 0;
  font-weight: 400;
  text-align: right;
}

.register-view__confirmation-time {
  font-size: 1rem;
  color: var(--color-text-primary);
  padding: 0.25rem 0;
  font-weight: 400;
  text-align: right;
  margin-bottom: 0.25rem;
}

.register-view__confirmation-error {
  font-size: 0.875rem;
  color: var(--color-error);
  margin: 0.5rem 0 0;
  text-align: right;
  padding: 0.5rem;
  background: rgba(220, 38, 38, 0.1);
  border-radius: 0.5rem;
  border: 1px solid rgba(220, 38, 38, 0.2);
}

.register-view__confirmation-note {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
  margin-top: 0.75rem;
  line-height: 1.6;
  text-align: right;
}

.register-view__confirm-btn {
  align-self: stretch;
  margin: 1rem 0;
  padding: 0.75rem 2rem;
  background: linear-gradient(90deg, #14a274, #10825d);
  box-shadow: 0 4px 12px rgba(20, 162, 116, 0.3);
  border: none;
  font-weight: 700;
  color: #fff;
  max-width: 100%;

  &:hover:not(:disabled) {
    background: linear-gradient(90deg, #10825d, #14a274);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(20, 162, 116, 0.4);
  }
}

/* Success Modal */
.registration-success-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}

.registration-success-modal {
  position: relative;
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 2rem;
  text-align: center;
}

.registration-success-close {
  position: absolute;
  top: 1rem;
  left: 1rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: color 0.15s ease, background 0.15s ease;

  &:hover {
    color: #374151;
    background: rgba(0, 0, 0, 0.05);
  }
}

.registration-success-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  border-radius: 50%;
  background: #16a34a;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.registration-success-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 1rem;
  line-height: 1.25;
}

.registration-success-text {
  font-size: 1rem;
  color: #6b7280;
  line-height: 1.5;
  margin: 0 0 1.5rem;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
}

.registration-success-btn {
  display: block;
  width: 100%;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 700;
  font-family: inherit;
  color: #fff;
  background: linear-gradient(90deg, #009968, #136047);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.15s ease, opacity 0.15s ease;

  &:hover {
    background: linear-gradient(90deg, #136047, #009968);
  }

  &:active {
    opacity: 0.9;
  }
}

/* Error Modal */
.registration-error-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}

.registration-error-modal {
  position: relative;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.registration-error-close {
  position: absolute;
  top: 1rem;
  left: 1rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: color 0.15s ease, background 0.15s ease;

  &:hover {
    color: #374151;
    background: rgba(0, 0, 0, 0.05);
  }
}

.registration-error-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dc2626;
}

.registration-error-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 1rem;
  text-align: center;
  line-height: 1.25;
}

.registration-error-content {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 1.5rem;
}

.registration-error-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.registration-error-item {
  padding: 0.75rem 1rem;
  background: rgba(254, 226, 226, 0.3);
  border-radius: 0.75rem;
  border: 1px solid rgba(220, 38, 38, 0.2);
}

.registration-error-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.registration-error-field-label {
  font-weight: 700;
  color: #991b1b;
  font-size: 0.875rem;
}

.registration-error-messages {
  list-style: none;
  padding: 0;
  margin: 0;
  padding-right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.registration-error-message {
  font-size: 0.875rem;
  color: #dc2626;
  line-height: 1.5;
  position: relative;

  &::before {
    content: '•';
    position: absolute;
    right: -1rem;
    color: #dc2626;
    font-weight: 700;
  }
}

.registration-error-btn {
  display: block;
  width: 100%;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 700;
  font-family: inherit;
  color: #fff;
  background: linear-gradient(90deg, #dc2626, #b91c1c);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.15s ease, opacity 0.15s ease, transform 0.15s ease;

  &:hover {
    background: linear-gradient(90deg, #b91c1c, #dc2626);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
  }

  &:active {
    opacity: 0.9;
    transform: translateY(0);
  }
}

/* Transitions */
.success-modal-enter-active,
.success-modal-leave-active {
  transition: opacity 0.25s ease;
}

.success-modal-enter-active .registration-success-modal,
.success-modal-leave-active .registration-success-modal {
  transition: transform 0.25s ease;
}

.success-modal-enter-from,
.success-modal-leave-to {
  opacity: 0;
}

.success-modal-enter-from .registration-success-modal,
.success-modal-leave-to .registration-success-modal {
  transform: scale(0.95);
}

.success-modal-enter-to,
.success-modal-leave-from {
  opacity: 1;
}

.success-modal-enter-to .registration-success-modal,
.success-modal-leave-from .registration-success-modal {
  transform: scale(1);
}

.error-modal-enter-active,
.error-modal-leave-active {
  transition: opacity 0.25s ease;
}

.error-modal-enter-active .registration-error-modal,
.error-modal-leave-active .registration-error-modal {
  transition: transform 0.25s ease;
}

.error-modal-enter-from,
.error-modal-leave-to {
  opacity: 0;
}

.error-modal-enter-from .registration-error-modal,
.error-modal-leave-to .registration-error-modal {
  transform: scale(0.95);
}

.error-modal-enter-to,
.error-modal-leave-from {
  opacity: 1;
}

.error-modal-enter-to .registration-error-modal,
.error-modal-leave-from .registration-error-modal {
  transform: scale(1);
}

.confirmation-enter-active,
.confirmation-leave-active {
  transition: all 0.25s ease;
}

.confirmation-enter-from,
.confirmation-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.d-flex {
  display: flex;
}

.align-items-center {
  align-items: center;
}

.justify-content-between {
  justify-content: space-between;
}

.gap-4 {
  gap: 1rem;
}

@media (max-width: 767px) {
  .register-view {
    padding: 1.5rem 1rem;
  }

  .register-view__grid {
    gap: 1.5rem;
  }

  .register-view__video-player {
    padding: 0.75rem;
  }

  .register-view__conditions,
  .register-view__help {
    padding: 1rem;
  }

  .register-view__segmented-buttons--six .register-view__segmented-btn {
    flex: 1 1 calc(50% - 0.25rem);
    min-width: 0;
  }

  .register-view__appointment-grid {
    grid-template-columns: 1fr;
  }

  .register-view__confirmation-section {
    grid-template-columns: 1fr;
    padding: 2rem 1.5rem;
    gap: 1.5rem;
  }

  .register-view__confirmation-content {
    text-align: right;
    align-items: flex-end;
    order: 1;
  }

  .register-view__confirmation-title,
  .register-view__confirmation-date,
  .register-view__confirmation-time,
  .register-view__confirmation-note {
    text-align: right;
  }

  .register-view__confirm-btn {
    width: 100%;
  }
}
</style>
