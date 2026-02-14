<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { ApiResponse } from '@/services/api'
import {
  getStudentById,
  getStudentAttendance,
  getStudentNotes,
  addStudentNote,
  deleteStudentNote,
  getStudentPresentationTests,
  deletePresentationTest,
  type Student,
  type AttendanceRecord,
  type StudentNote,
  type PresentationTestRecord,
} from '@/services/teacher.service'
import { BaseTabs } from '@/components/ui'
import {
  BaseTable,
  AddAttendanceDialog,
  AddPresentationTestDialog,
} from '@/components/common'
import ActionMenu from '@/components/ui/ActionMenu.vue'
import AppLoading from '@/components/common/AppLoading.vue'
import {
  STUDENT_PROFILE_LABELS,
  STUDENT_STATUS_COLORS,
  ATTENDANCE_LOG_LABELS,
  ATTENDANCE_STATUS_CONFIG,
  NOTES_TAB_LABELS,
  NOTE_MAX_LENGTH,
  PRESENTATION_TEST_TAB_LABELS,
  TRACK_BADGE_COLORS,
} from '@/config/teacher.constants'

interface Props {
  modelValue: boolean
  studentId: number | null
  /** When provided (e.g. from admin), used instead of teacher getStudentById to fetch student */
  getStudent?: (id: number) => Promise<ApiResponse<Student>>
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

/** When getStudent is provided (e.g. admin), show only overview tab and do not call teacher APIs */
const overviewOnly = computed(() => !!props.getStudent)
const visibleTabs = computed(() =>
  overviewOnly.value ? [tabs[0]] : tabs
)

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
    const fetcher = props.getStudent ?? getStudentById
    const res = await fetcher(props.studentId)
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

// Attendance (Weekly Recitation tab)
const attendanceRecords = ref<AttendanceRecord[]>([])
const attendanceLoading = ref(false)
const addAttendanceDialogOpen = ref(false)

const attendanceColumns = [
  { key: 'date', label: ATTENDANCE_LOG_LABELS.DATE },
  { key: 'session', label: ATTENDANCE_LOG_LABELS.SESSION },
  { key: 'status', label: ATTENDANCE_LOG_LABELS.STATUS },
  { key: 'page_number', label: ATTENDANCE_LOG_LABELS.LAST_PAGE },
  { key: 'score', label: ATTENDANCE_LOG_LABELS.EVALUATION },
  { key: 'action', label: ATTENDANCE_LOG_LABELS.ACTIONS },
]

function getStatusStyle(status: string) {
  const config = ATTENDANCE_STATUS_CONFIG[status as keyof typeof ATTENDANCE_STATUS_CONFIG]
  if (config?.color) {
    return { backgroundColor: config.color.background, color: config.color.text }
  }
  return { backgroundColor: '#f3f4f6', color: '#6b7280' }
}

async function fetchAttendance() {
  if (!props.studentId) return
  attendanceLoading.value = true
  attendanceRecords.value = []
  try {
    const res = await getStudentAttendance(props.studentId)
    if (res.success && Array.isArray(res.data)) {
      attendanceRecords.value = res.data
    }
  } catch {
    attendanceRecords.value = []
  } finally {
    attendanceLoading.value = false
  }
}

function handleAddRecord() {
  addAttendanceDialogOpen.value = true
}

function onAddAttendanceSuccess() {
  fetchAttendance()
}

function handleAttendanceAction(record: AttendanceRecord, actionId: string) {
  if (actionId === 'edit') {
    console.log('Edit record', record.id)
  } else if (actionId === 'delete') {
    console.log('Delete record', record.id)
  }
}

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

// Notes tab
const notes = ref<StudentNote[]>([])
const notesLoading = ref(false)
const noteContent = ref('')
const addNoteLoading = ref(false)
const noteError = ref<string | null>(null)
const noteEditorRef = ref<HTMLDivElement | null>(null)
const deleteNoteConfirm = ref<StudentNote | null>(null)

async function fetchNotes() {
  if (!props.studentId) return
  notesLoading.value = true
  notes.value = []
  try {
    const res = await getStudentNotes(props.studentId)
    if (res.success && Array.isArray(res.data)) {
      notes.value = res.data
    }
  } catch {
    notes.value = []
  } finally {
    notesLoading.value = false
  }
}

function execFormat(command: string, value?: string) {
  document.execCommand(command, false, value)
  noteEditorRef.value?.focus()
}

function execFormatLink() {
  const url = typeof window !== 'undefined' ? window.prompt('الرابط:') : null
  if (url) execFormat('createLink', url)
}

async function handleAddNote() {
  if (!props.studentId) return
  noteError.value = null

  const content = noteEditorRef.value?.innerHTML?.trim() || noteContent.value?.trim()
  const text = noteEditorRef.value?.innerText?.trim() || noteContent.value?.trim()

  if (!text) {
    noteError.value = NOTES_TAB_LABELS.ERRORS.REQUIRED
    return
  }

  if (text.length > NOTE_MAX_LENGTH) {
    noteError.value = NOTES_TAB_LABELS.ERRORS.MAX_LENGTH
    return
  }

  addNoteLoading.value = true
  try {
    const res = await addStudentNote(props.studentId, content || text)
    if (res.success) {
      noteContent.value = ''
      if (noteEditorRef.value) noteEditorRef.value.innerHTML = ''
      fetchNotes()
    }
  } catch {
    noteError.value = 'حدث خطأ أثناء إضافة الملاحظة'
  } finally {
    addNoteLoading.value = false
  }
}

function openDeleteNoteConfirm(note: StudentNote) {
  deleteNoteConfirm.value = note
}

function closeDeleteNoteConfirm() {
  deleteNoteConfirm.value = null
}

async function confirmDeleteNote() {
  const note = deleteNoteConfirm.value
  if (!note) return
  try {
    const res = await deleteStudentNote(note.id)
    if (res.success) {
      closeDeleteNoteConfirm()
      fetchNotes()
    }
  } catch {
    // Error handled by UI
  }
}

// Presentation & Test tab
const presentationTests = ref<PresentationTestRecord[]>([])
const presentationTestsLoading = ref(false)
const addPresentationTestDialogOpen = ref(false)
const deletePresentationTestConfirm = ref<PresentationTestRecord | null>(null)

const presentationTestColumns = [
  { key: 'program_track', label: PRESENTATION_TEST_TAB_LABELS.TRACK },
  { key: 'level', label: PRESENTATION_TEST_TAB_LABELS.LEVEL },
  { key: 'created_at', label: PRESENTATION_TEST_TAB_LABELS.DATE },
  { key: 'score_presentation', label: PRESENTATION_TEST_TAB_LABELS.SCORE_PRESENTATION },
  { key: 'score_tests', label: PRESENTATION_TEST_TAB_LABELS.SCORE_TEST },
  { key: 'action', label: PRESENTATION_TEST_TAB_LABELS.ACTIONS },
]

function getTrackBadgeStyle(programTrack: string) {
  const lower = programTrack || ''
  for (const [key, style] of Object.entries(TRACK_BADGE_COLORS)) {
    if (lower.includes(key)) return style
  }
  return { background: '#F3F4F6', text: '#6B7280' }
}

function formatPresentationDate(dateStr: string) {
  if (!dateStr) return '---'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
  return `${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`
}

async function fetchPresentationTests() {
  if (!props.studentId) return
  presentationTestsLoading.value = true
  presentationTests.value = []
  try {
    const res = await getStudentPresentationTests(props.studentId)
    if (res.success && Array.isArray(res.data)) {
      presentationTests.value = res.data
    }
  } catch {
    presentationTests.value = []
  } finally {
    presentationTestsLoading.value = false
  }
}

function handleAddPresentationTest() {
  addPresentationTestDialogOpen.value = true
}

function onAddPresentationTestSuccess() {
  fetchPresentationTests()
}

function openDeletePresentationTestConfirm(record: PresentationTestRecord) {
  deletePresentationTestConfirm.value = record
}

function closeDeletePresentationTestConfirm() {
  deletePresentationTestConfirm.value = null
}

async function confirmDeletePresentationTest() {
  const record = deletePresentationTestConfirm.value
  if (!record) return
  try {
    const res = await deletePresentationTest(record.id)
    if (res.success) {
      closeDeletePresentationTestConfirm()
      fetchPresentationTests()
    }
  } catch {
    // Error handled by UI
  }
}

watch(activeTab, (tab) => {
  if (overviewOnly.value) return
  if (tab === 'weekly' && props.studentId) {
    fetchAttendance()
  }
  if (tab === 'notes' && props.studentId) {
    fetchNotes()
  }
  if (tab === 'test' && props.studentId) {
    fetchPresentationTests()
  }
})
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

            <!-- Tabs (overview only when getStudent is provided, e.g. admin; hide tab bar when single tab) -->
            <div v-if="visibleTabs.length > 1" class="student-profile-drawer__tabs">
              <BaseTabs v-model="activeTab" :tabs="visibleTabs" />
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
              <div v-else-if="activeTab === 'weekly'" class="student-profile-drawer__weekly">
                <div class="student-profile-drawer__weekly-header">
                  <h3 class="student-profile-drawer__weekly-title">
                    {{ ATTENDANCE_LOG_LABELS.TITLE }}
                  </h3>
                  <button
                    type="button"
                    class="student-profile-drawer__add-record-btn"
                    @click="handleAddRecord"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    {{ ATTENDANCE_LOG_LABELS.ADD_RECORD }}
                  </button>
                </div>
                <div class="student-profile-drawer__weekly-table">
                  <BaseTable
                    :columns="attendanceColumns"
                    :data="attendanceRecords"
                    :loading="attendanceLoading"
                    :empty-message="ATTENDANCE_LOG_LABELS.EMPTY"
                    :loading-message="ATTENDANCE_LOG_LABELS.LOADING"
                    :page-size-options="[5, 10, 25]"
                  >
                    <template #cell-status="{ row }">
                      <span
                        class="student-profile-drawer__status-badge"
                        :style="getStatusStyle(row.status)"
                      >
                        {{ row.status }}
                      </span>
                    </template>
                    <template #cell-score="{ row }">
                      <span class="student-profile-drawer__score-cell">
                        {{ row.score > 0 ? row.score : '---' }}
                        <svg
                          v-if="row.score > 0"
                          class="student-profile-drawer__star-icon"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="#F59E0B"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </span>
                    </template>
                    <template #cell-page_number="{ row }">
                      {{ row.page_number != null ? row.page_number : '---' }}
                    </template>
                    <template #cell-action="{ row }">
                      <div @click.stop>
                        <ActionMenu
                          :items="[
                            { id: 'edit', label: 'تعديل', onClick: () => handleAttendanceAction(row, 'edit') },
                            { id: 'delete', label: 'حذف', onClick: () => handleAttendanceAction(row, 'delete') },
                          ]"
                        />
                      </div>
                    </template>
                  </BaseTable>
                </div>
              </div>
              <div v-else-if="activeTab === 'notes'" class="student-profile-drawer__notes">
                <h3 class="student-profile-drawer__notes-title">{{ NOTES_TAB_LABELS.TITLE }}</h3>

                <div class="student-profile-drawer__notes-editor">
                  <div class="student-profile-drawer__notes-toolbar">
                    <button type="button" class="student-profile-drawer__toolbar-btn" @click="execFormat('undo')" title="تراجع">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 7v6h6" /><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
                      </svg>
                    </button>
                    <button type="button" class="student-profile-drawer__toolbar-btn" @click="execFormat('redo')" title="إعادة">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 7v6h-6" /><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7" />
                      </svg>
                    </button>
                    <select class="student-profile-drawer__toolbar-select" @change="execFormat('formatBlock', ($event.target as HTMLSelectElement).value); ($event.target as HTMLSelectElement).value = 'p'">
                      <option value="p">{{ NOTES_TAB_LABELS.NORMAL_TEXT }}</option>
                      <option value="h2">عنوان</option>
                      <option value="h3">عنوان فرعي</option>
                    </select>
                    <button type="button" class="student-profile-drawer__toolbar-btn" @click="execFormat('justifyLeft')" title="محاذاة لليسار">&#8678;</button>
                    <button type="button" class="student-profile-drawer__toolbar-btn" @click="execFormat('justifyCenter')" title="توسيط">&#9744;</button>
                    <button type="button" class="student-profile-drawer__toolbar-btn" @click="execFormat('justifyRight')" title="محاذاة لليمين">&#8680;</button>
                    <button type="button" class="student-profile-drawer__toolbar-btn" @click="execFormat('justifyFull')" title="ضبط">&#9635;</button>
                    <button type="button" class="student-profile-drawer__toolbar-btn" @click="execFormat('bold')" title="عريض"><b>B</b></button>
                    <button type="button" class="student-profile-drawer__toolbar-btn" @click="execFormat('italic')" title="مائل"><i>I</i></button>
                    <button type="button" class="student-profile-drawer__toolbar-btn" @click="execFormat('underline')" title="تحته خط"><u>U</u></button>
                    <button type="button" class="student-profile-drawer__toolbar-btn" @click="execFormat('insertUnorderedList')" title="قائمة نقطية">&#8226;</button>
                    <button type="button" class="student-profile-drawer__toolbar-btn" @click="execFormat('insertOrderedList')" title="قائمة مرقمة">1.</button>
                    <button
                      type="button"
                      class="student-profile-drawer__toolbar-btn"
                      @click="execFormatLink"
                      title="رابط"
                    >
                      &#128279;
                    </button>
                    <button type="button" class="student-profile-drawer__toolbar-btn" @click="execFormat('formatBlock', 'blockquote')" title="اقتباس">&quot;</button>
                  </div>
                  <div
                    ref="noteEditorRef"
                    class="student-profile-drawer__notes-input"
                    contenteditable="true"
                    data-placeholder="أدخل الملاحظة هنا..."
                    @input="noteContent = ($event.target as HTMLElement).innerHTML; noteError = null"
                  />
                </div>

                <button
                  type="button"
                  class="student-profile-drawer__add-note-btn"
                  :disabled="addNoteLoading"
                  @click="handleAddNote"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  {{ NOTES_TAB_LABELS.ADD_NOTE }}
                </button>

                <p v-if="noteError" class="student-profile-drawer__notes-error">{{ noteError }}</p>

                <div v-if="notesLoading" class="student-profile-drawer__notes-loading">
                  <AppLoading :full-screen="false" size="sm" :text="NOTES_TAB_LABELS.LOADING" />
                </div>
                <div v-else-if="notes.length === 0" class="student-profile-drawer__notes-empty">
                  {{ NOTES_TAB_LABELS.EMPTY }}
                </div>
                <div v-else class="student-profile-drawer__notes-list">
                  <div
                    v-for="note in notes"
                    :key="note.id"
                    class="student-profile-drawer__note-card"
                  >
                    <div class="student-profile-drawer__note-card-header">
                      <svg class="student-profile-drawer__note-doc-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                      <span class="student-profile-drawer__note-date">{{ note.created_at }}</span>
                  
                    </div>
                    <div class="student-profile-drawer__note-content" v-html="note.note" />
                    <button
                      type="button"
                      class="student-profile-drawer__note-delete"
                      aria-label="حذف"
                      @click="openDeleteNoteConfirm(note)"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div v-else-if="activeTab === 'test'" class="student-profile-drawer__presentation-test">
                <div class="student-profile-drawer__presentation-test-header">
                  <h3 class="student-profile-drawer__presentation-test-title">
                    {{ PRESENTATION_TEST_TAB_LABELS.TITLE }}
                  </h3>
                  <button
                    type="button"
                    class="student-profile-drawer__add-record-btn"
                    @click="handleAddPresentationTest"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    {{ PRESENTATION_TEST_TAB_LABELS.ADD_RECORD }}
                  </button>
                </div>
                <div class="student-profile-drawer__presentation-test-table">
                  <BaseTable
                    :columns="presentationTestColumns"
                    :data="presentationTests"
                    :loading="presentationTestsLoading"
                    :empty-message="PRESENTATION_TEST_TAB_LABELS.EMPTY"
                    :loading-message="PRESENTATION_TEST_TAB_LABELS.LOADING"
                    :page-size-options="[5, 10, 25]"
                  >
                    <template #cell-program_track="{ row }">
                      <span
                        class="student-profile-drawer__track-badge"
                        :style="getTrackBadgeStyle(row.program_track)"
                      >
                        {{ row.program_track }}
                      </span>
                    </template>
                    <template #cell-created_at="{ row }">
                      {{ formatPresentationDate(row.created_at) }}
                    </template>
                    <template #cell-action="{ row }">
                      <div @click.stop>
                        <ActionMenu
                          :items="[
                            {
                              id: 'delete',
                              label: 'حذف',
                              onClick: () => openDeletePresentationTestConfirm(row),
                            },
                          ]"
                        />
                      </div>
                    </template>
                  </BaseTable>
                </div>
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

    <AddAttendanceDialog
      v-model="addAttendanceDialogOpen"
      :student-id="props.studentId"
      @success="onAddAttendanceSuccess"
    />

    <AddPresentationTestDialog
      v-model="addPresentationTestDialogOpen"
      :student-id="props.studentId"
      @success="onAddPresentationTestSuccess"
    />

    <!-- Delete Note Confirmation Dialog -->
    <Transition name="dialog">
      <div
        v-if="deleteNoteConfirm"
        class="student-profile-drawer__confirm-overlay"
        @click.self="closeDeleteNoteConfirm"
      >
        <div class="student-profile-drawer__confirm-dialog">
          <h3 class="student-profile-drawer__confirm-title">
            {{ NOTES_TAB_LABELS.DELETE_CONFIRM.TITLE }}
          </h3>
          <p class="student-profile-drawer__confirm-message">
            {{ NOTES_TAB_LABELS.DELETE_CONFIRM.MESSAGE }}
          </p>
          <div class="student-profile-drawer__confirm-actions">
            <button
              type="button"
              class="student-profile-drawer__confirm-btn student-profile-drawer__confirm-btn--cancel"
              @click="closeDeleteNoteConfirm"
            >
              {{ NOTES_TAB_LABELS.DELETE_CONFIRM.CANCEL }}
            </button>
            <button
              type="button"
              class="student-profile-drawer__confirm-btn student-profile-drawer__confirm-btn--delete"
              @click="confirmDeleteNote"
            >
              {{ NOTES_TAB_LABELS.DELETE_CONFIRM.DELETE }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Delete Presentation Test Confirmation Dialog -->
    <Transition name="dialog">
      <div
        v-if="deletePresentationTestConfirm"
        class="student-profile-drawer__confirm-overlay"
        @click.self="closeDeletePresentationTestConfirm"
      >
        <div class="student-profile-drawer__confirm-dialog">
          <h3 class="student-profile-drawer__confirm-title">
            {{ PRESENTATION_TEST_TAB_LABELS.DELETE_CONFIRM.TITLE }}
          </h3>
          <p class="student-profile-drawer__confirm-message">
            {{ PRESENTATION_TEST_TAB_LABELS.DELETE_CONFIRM.MESSAGE }}
          </p>
          <div class="student-profile-drawer__confirm-actions">
            <button
              type="button"
              class="student-profile-drawer__confirm-btn student-profile-drawer__confirm-btn--cancel"
              @click="closeDeletePresentationTestConfirm"
            >
              {{ PRESENTATION_TEST_TAB_LABELS.DELETE_CONFIRM.CANCEL }}
            </button>
            <button
              type="button"
              class="student-profile-drawer__confirm-btn student-profile-drawer__confirm-btn--delete"
              @click="confirmDeletePresentationTest"
            >
              {{ PRESENTATION_TEST_TAB_LABELS.DELETE_CONFIRM.DELETE }}
            </button>
          </div>
        </div>
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
  font-size: 0.8125rem; /* 13px base - smaller text throughout */
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
  top: $spacing-1;
  right: $spacing-3;
  width: 32px;
  height: 32px;
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
  padding: $spacing-6;
  font-size: 0.75rem;
}

.student-profile-drawer__error {
  color: var(--color-error);
  text-align: center;
}

.student-profile-drawer__header {
  padding: $spacing-4 $spacing-5 $spacing-3;
  padding-top: $spacing-10;
  background: #fff;
  flex-shrink: 0;
  border-bottom: none;
}

.student-profile-drawer__header-main {
  display: flex;
  align-items: flex-start;
  gap: $spacing-3;
  margin-bottom: $spacing-3;
}

.student-profile-drawer__avatar {
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #009968 0%, #136047 100%);
  color: #fff;
  font-weight: $font-weight-bold;
  font-size: 0.875rem;
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
  font-size: 1rem;
  font-weight: $font-weight-bold;
  color: var(--color-text-primary);
  margin: 0;
}

.student-profile-drawer__level {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.student-profile-drawer__status {
  display: inline-block;
  padding: 2px $spacing-2;
  border-radius: $radius-full;
  font-size: 0.6875rem;
  font-weight: $font-weight-medium;
}

.student-profile-drawer__action-buttons {
  display: flex;
  gap: $spacing-2;
  flex-wrap: wrap;
  justify-content: end;
}

.student-profile-drawer__action-btn {
  display: inline-flex;
  align-items: center;
  gap: $spacing-1;
  padding: $spacing-1 $spacing-3;
  border: 1px solid var(--color-border);
  border-radius: $radius-md;
  background: #f9fafb;
  color: var(--color-text-primary);
  font-size: 0.75rem;
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
  padding: 0 $spacing-4 $spacing-3;
  flex-shrink: 0;

  :deep(.base-tabs) {
    background: #f3f4f6;
    padding: 4px;
    border-radius: $radius-lg;
    min-width: 0;

    .base-tabs__tab {
      background: #f3f4f6;
      color: var(--color-text-secondary);
      font-size: 0.75rem;
      padding: $spacing-1 $spacing-3;

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
  padding: $spacing-3 $spacing-4;
  min-height: 160px;
}

.student-profile-drawer__overview-title {
  font-size: 0.875rem;
  font-weight: $font-weight-bold;
  color: var(--color-text-primary);
  margin: 0 0 $spacing-3 0;
}

.student-profile-drawer__overview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-4 $spacing-6;

  @include sm-max {
    grid-template-columns: 1fr;
    gap: $spacing-3;
  }
}

.student-profile-drawer__overview-col {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.student-profile-drawer__row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.student-profile-drawer__label {
  font-size: 0.75rem;
  font-weight: $font-weight-bold;
  color: var(--color-text-primary);
}

.student-profile-drawer__value {
  font-size: 0.75rem;
  color: var(--color-text-primary);
  padding-right: 0;
}

.student-profile-drawer__placeholder {
  text-align: center;
  color: var(--color-text-muted);
  padding: $spacing-6;
  font-size: 0.75rem;
}

.student-profile-drawer__weekly {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.student-profile-drawer__weekly-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-2;
  flex-wrap: wrap;
}

.student-profile-drawer__weekly-title {
  font-size: 0.875rem;
  font-weight: $font-weight-bold;
  color: var(--color-text-primary);
  margin: 0;
}

.student-profile-drawer__add-record-btn {
  display: inline-flex;
  align-items: center;
  gap: $spacing-1;
  padding: $spacing-1 $spacing-3;
  border: 1px solid var(--color-border);
  border-radius: $radius-md;
  background: #fff;
  color: var(--color-text-primary);
  font-size: 0.75rem;
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

.student-profile-drawer__weekly-table {
  overflow-x: auto;

  :deep(.base-table__table) {
    th, td {
      font-size: 0.75rem;
      padding: $spacing-2 $spacing-3;
    }
  }

  :deep(.base-table__pagination),
  :deep(.base-table__page-size-select) {
    font-size: 0.75rem;
  }
}

.student-profile-drawer__status-badge {
  display: inline-block;
  padding: 2px $spacing-2;
  border-radius: $radius-full;
  font-size: 0.6875rem;
  font-weight: $font-weight-medium;
}

.student-profile-drawer__score-cell {
  display: inline-flex;
  align-items: center;
  gap: $spacing-1;
  font-size: 0.75rem;
}

.student-profile-drawer__star-icon {
  flex-shrink: 0;
}

/* Notes tab */
.student-profile-drawer__notes {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.student-profile-drawer__notes-title {
  font-size: 0.875rem;
  font-weight: $font-weight-bold;
  color: var(--color-text-primary);
  margin: 0;
}

.student-profile-drawer__notes-editor {
  border: 1px solid var(--color-border);
  border-radius: $radius-lg;
  overflow: hidden;
  background: #f9fafb;
}

.student-profile-drawer__notes-toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: $spacing-2;
  border-bottom: 1px solid var(--color-border);
  background: #fff;
  flex-wrap: wrap;
}

.student-profile-drawer__toolbar-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: $radius-sm;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 0.75rem;
  transition: all $transition-fast;

  &:hover {
    background: #f3f4f6;
    color: var(--color-text-primary);
  }
}

.student-profile-drawer__toolbar-select {
  padding: 2px $spacing-2;
  border: 1px solid var(--color-border);
  border-radius: $radius-sm;
  background: #fff;
  font-size: 0.6875rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  margin: 0 2px;
}

.student-profile-drawer__notes-input {
  min-height: 80px;
  padding: $spacing-3;
  font-size: 0.75rem;
  color: var(--color-text-primary);
  outline: none;
  overflow-y: auto;

  &:empty::before {
    content: attr(data-placeholder);
    color: var(--color-text-muted);
  }
}

.student-profile-drawer__add-note-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  padding: $spacing-2 $spacing-4;
  border: none;
  border-radius: $radius-lg;
  background: linear-gradient(90deg, #009968 0%, #136047 100%);
  color: #fff;
  font-size: 0.75rem;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: all $transition-fast;
  align-self: flex-start;

  &:hover:not(:disabled) {
    opacity: 0.95;
    filter: brightness(1.05);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  svg {
    flex-shrink: 0;
  }
}

.student-profile-drawer__notes-error {
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-error);
}

.student-profile-drawer__notes-loading,
.student-profile-drawer__notes-empty {
  padding: $spacing-6;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.75rem;
}

.student-profile-drawer__notes-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.student-profile-drawer__note-card {
  position: relative;
  padding: $spacing-3;
  background: #f3f4f6;
  border-radius: $radius-lg;
  border: 1px solid #e5e7eb;
  box-shadow: $shadow-sm;
}

.student-profile-drawer__note-card-header {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  margin-bottom: $spacing-2;
}

.student-profile-drawer__note-date {
  font-size: 0.6875rem;
  color: var(--color-text-secondary);
}

.student-profile-drawer__note-doc-icon {
  flex-shrink: 0;
  color: var(--color-text-secondary);
}

.student-profile-drawer__note-content {
  font-size: 0.75rem;
  color: var(--color-text-primary);
  line-height: 1.5;
  padding-left: $spacing-8;
  word-break: break-word;

  :deep(p) {
    margin: 0 0 $spacing-1 0;
  }
}

/* Presentation & Test tab */
.student-profile-drawer__presentation-test {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.student-profile-drawer__presentation-test-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-2;
  flex-wrap: wrap;
}

.student-profile-drawer__presentation-test-title {
  font-size: 0.875rem;
  font-weight: $font-weight-bold;
  color: var(--color-text-primary);
  margin: 0;
}

.student-profile-drawer__presentation-test-table {
  overflow-x: auto;
}

.student-profile-drawer__track-badge {
  display: inline-block;
  padding: $spacing-1 $spacing-3;
  border-radius: $radius-full;
  font-size: 0.6875rem;
  font-weight: $font-weight-medium;
}

.student-profile-drawer__presentation-test-table :deep(.base-table__table) {
  th,
  td {
    font-size: 0.75rem;
    padding: $spacing-2 $spacing-3;
  }
}

.student-profile-drawer__note-delete {
  position: absolute;
  top: $spacing-3;
  left: $spacing-3;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: $radius-sm;
  background: transparent;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    background: rgba(239, 68, 68, 0.1);
  }

  svg {
    flex-shrink: 0;
  }
}

.student-profile-drawer__footer {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-3 $spacing-4;
  border-top: 1px solid var(--color-border);
  background: #fff;
  flex-shrink: 0;
}

.student-profile-drawer__copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-1;
  padding: $spacing-2 $spacing-4;
  border: 1px solid var(--color-border);
  border-radius: $radius-md;
  background: #fff;
  color: var(--color-text-secondary);
  font-size: 0.75rem;
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
  gap: $spacing-1;
  padding: $spacing-2 $spacing-4;
  border: none;
  border-radius: $radius-md;
  background: linear-gradient(90deg, #009968 0%, #136047 100%);
  color: #fff;
  font-size: 0.75rem;
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

/* Delete note confirmation dialog */
.student-profile-drawer__confirm-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: $spacing-4;
  direction: rtl;
}

.student-profile-drawer__confirm-dialog {
  background: #fff;
  border-radius: $radius-xl;
  padding: $spacing-6;
  max-width: 400px;
  width: 100%;
  box-shadow: $shadow-lg;
}

.student-profile-drawer__confirm-title {
  font-size: 1rem;
  font-weight: $font-weight-bold;
  color: var(--color-text-primary);
  margin: 0 0 $spacing-3 0;
}

.student-profile-drawer__confirm-message {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0 0 $spacing-5 0;
  line-height: 1.5;
}

.student-profile-drawer__confirm-actions {
  display: flex;
  gap: $spacing-3;
  justify-content: flex-start;
}

.student-profile-drawer__confirm-btn {
  padding: $spacing-2 $spacing-5;
  border-radius: $radius-lg;
  font-size: 0.875rem;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: all $transition-fast;
  border: none;

  &--cancel {
    background: #fff;
    border: 1px solid var(--color-border);
    color: var(--color-text-secondary);

    &:hover {
      background: #f9fafb;
      border-color: var(--color-text-muted);
    }
  }

  &--delete {
    background: #ef4444;
    color: #fff;

    &:hover {
      background: #dc2626;
    }
  }
}

.dialog-enter-active,
.dialog-leave-active {
  transition: opacity $transition-normal;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-active .student-profile-drawer__confirm-dialog,
.dialog-leave-active .student-profile-drawer__confirm-dialog {
  transition: transform $transition-normal;
}

.dialog-enter-from .student-profile-drawer__confirm-dialog,
.dialog-leave-to .student-profile-drawer__confirm-dialog {
  transform: scale(0.95);
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
