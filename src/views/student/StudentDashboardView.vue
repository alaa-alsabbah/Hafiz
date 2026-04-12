<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getStudentDashboard, type StudentDashboard } from '@/services/student.service'
import { ApiException } from '@/services/api'
import { AppLoading } from '@/components/common'
import quranImage from '@/assets/img/quran.svg'
import starIcon from '@/assets/img/icons/starGreen.svg'
import flashIcon from '@/assets/img/icons/flash.svg'
import hatIcon from '@/assets/img/icons/hat.svg'
import loopyallowIcon from '@/assets/img/icons/loopyallow.svg'
import loopIcon from '@/assets/img/icons/loop.svg'

const router = useRouter()

const loading = ref(true)
const dashboardData = ref<StudentDashboard | null>(null)
const error = ref<string | null>(null)

// Extract level parts from level string (e.g., "المستوى الأول" -> ["المستوى", "الأول"])
function extractLevelParts(level: string | null | undefined): { main: string; sub: string } {
  if (level == null || String(level).trim() === '') {
    return { main: '—', sub: '' }
  }
  const s = String(level).trim()
  const parts = s.split(/\s+/)
  if (parts.length >= 2) {
    return {
      main: parts[0],
      sub: parts.slice(1).join(' ')
    }
  }
  return {
    main: s,
    sub: ''
  }
}

/**
 * Show track text from API: prefer the segment after "|" (actual مسار), else full string.
 * No guessed metal-tier labels unless present in the API text.
 */
function formatTrackDisplay(programTrack: string | null | undefined): string {
  if (programTrack == null || String(programTrack).trim() === '') {
    return '—'
  }
  const t = String(programTrack).trim()
  const pipe = t.indexOf('|')
  if (pipe !== -1) {
    const after = t.slice(pipe + 1).trim()
    if (after) return after
  }
  return t
}

const levelParts = computed(() => extractLevelParts(dashboardData.value?.level))

/** الفرص: only show a number when API sends opportunities_count */
const opportunitiesDisplay = computed(() => {
  const d = dashboardData.value
  if (!d) return '—'
  const n = d.opportunities_count
  if (n === null || n === undefined) return '—'
  return String(n)
})

async function fetchDashboard() {
  try {
    loading.value = true
    error.value = null
    const response = await getStudentDashboard()
    
    if (response.success && response.data) {
      dashboardData.value = response.data
    } else {
      error.value = response.message || 'فشل تحميل بيانات لوحة التحكم'
    }
  } catch (err) {
    if (err instanceof ApiException) {
      error.value = err.message || 'حدث خطأ أثناء تحميل البيانات'
    } else {
      error.value = 'حدث خطأ غير متوقع'
    }
    console.error('Dashboard fetch error:', err)
  } finally {
    loading.value = false
  }
}

function goToDailyTasks() {
  router.push({ name: 'student-daily-tasks' })
}

onMounted(() => {
  fetchDashboard()
})
</script>

<template>
  <div class="student-dashboard" data-component="StudentDashboardView">
    <!-- Loading State (initial full-area loader) -->
    <AppLoading
      v-if="loading && !dashboardData && !error"
      :full-screen="false"
      size="md"
      text="جاري تحميل لوحة التحكم..."
    />

    <template v-else>
    <!-- Welcome Banner Section -->
    <section class="student-dashboard__banner">
      <div class="student-dashboard__banner-content">
        <div class="student-dashboard__banner-text">
          <h1 class="student-dashboard__banner-title">
            <span>مرحباً {{ dashboardData?.full_name || 'الطالب' }} 👋</span>
          </h1>
          <p class="student-dashboard__banner-description">
            مرحبا بك في لوحة تحكم تعلم القرآن الخاصة بك! تابع رحلتك من خلال استكشاف مسار برنامجك سواء كنت على مسار الفرسان أو مسار الحافظ. من هنا، يمكنك الوصول إلى مهامك، ومراجعة تقدمك، والبقاء على اطلاع مع الإرشادات الشخصية من معلمك.
          </p>
          <button class="student-dashboard__banner-button" @click="goToDailyTasks">
            <span>الواجبات اليومية</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 12L12 4M12 4H6M12 4V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="student-dashboard__banner-illustration">
          <img :src="quranImage" alt="Quran" class="student-dashboard__quran-image" />
        </div>
      </div>
    </section>

    <!-- Stat Cards Section -->
    <section class="student-dashboard__stats" v-if="dashboardData">
      <div class="student-dashboard__stats-grid">
        <!-- Level Card -->
        <div class="student-dashboard__stat-card-wrapper">
          <div class="student-dashboard__stat-card">
            <div class="student-dashboard__stat-icon" style="background-color: rgba(232, 245, 233, 1);">
              <img :src="starIcon" alt="Level" />
            </div>
            <div class="student-dashboard__stat-content">
              <div class="student-dashboard__stat-value">
                <span v-if="loading" class="student-dashboard__stat-skeleton">---</span>
                <template v-else>
                  <div class="student-dashboard__stat-value-main">{{ levelParts.main }}</div>
                  <div class="student-dashboard__stat-value-sub" v-if="levelParts.sub">
                    {{ levelParts.sub }}
                  </div>
                </template>
              </div>
              <div class="student-dashboard__stat-label">المستوى</div>
            </div>
          </div>
        </div>

        <!-- Track Card -->
        <div class="student-dashboard__stat-card-wrapper">
          <div class="student-dashboard__stat-card">
            <div class="student-dashboard__stat-icon" style="background-color: rgba(255, 235, 238, 1);">
              <img :src="flashIcon" alt="Track" />
            </div>
            <div class="student-dashboard__stat-content">
              <div class="student-dashboard__stat-value">
                <span v-if="loading" class="student-dashboard__stat-skeleton">---</span>
                <span v-else class="student-dashboard__stat-value--track">{{ formatTrackDisplay(dashboardData.program_track) }}</span>
              </div>
              <div class="student-dashboard__stat-label">المسار</div>
            </div>
          </div>
        </div>

        <!-- Program Card -->
        <div class="student-dashboard__stat-card-wrapper">
          <div class="student-dashboard__stat-card">
            <div class="student-dashboard__stat-icon" style="background-color: rgba(227, 242, 253, 1);">
              <img :src="hatIcon" alt="Program" />
            </div>
            <div class="student-dashboard__stat-content">
              <div class="student-dashboard__stat-value">
                <span v-if="loading" class="student-dashboard__stat-skeleton">---</span>
                <span v-else>{{ dashboardData.program }}</span>
              </div>
              <div class="student-dashboard__stat-label">البرنامج</div>
            </div>
          </div>
        </div>

        <!-- Opportunities Card -->
        <div class="student-dashboard__stat-card-wrapper">
          <div class="student-dashboard__stat-card">
            <div class="student-dashboard__stat-icon student-dashboard__stat-icon--circle" style="background-color: rgba(255, 248, 225, 1);">
              <img :src="loopyallowIcon" alt="Opportunities" />
            </div>
            <div class="student-dashboard__stat-content">
              <div class="student-dashboard__stat-value">
                <span v-if="loading" class="student-dashboard__stat-skeleton">---</span>
                <span v-else>{{ opportunitiesDisplay }}</span>
              </div>
              <div class="student-dashboard__stat-label">الفرص</div>
            </div>
          </div>
        </div>

        <!-- Permission Usage Card -->
        <div class="student-dashboard__stat-card-wrapper">
          <div class="student-dashboard__stat-card">
            <div class="student-dashboard__stat-icon student-dashboard__stat-icon--circle" style="background-color: rgba(243, 232, 255, 1);">
              <img :src="loopIcon" alt="Permission" />
            </div>
            <div class="student-dashboard__stat-content">
              <div class="student-dashboard__stat-value">
                <span v-if="loading" class="student-dashboard__stat-skeleton">---</span>
                <span v-else>{{ dashboardData.count_leaves }}</span>
              </div>
              <div class="student-dashboard__stat-label">استخدام الاستئذان</div>
            </div>
          </div>
        </div>
      </div>
    </section>

      <!-- Error State -->
      <div v-if="error" class="student-dashboard__error">
        <p>{{ error }}</p>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.student-dashboard {
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: $spacing-6;

  &__banner {
    background: linear-gradient(90deg, #009968 0%, #136047 100%);
    border-radius: $radius-2xl;
    padding: $spacing-8;
    overflow: hidden;
    position: relative;

    @include sm-max {
      padding: $spacing-6;
    }
  }

  &__banner-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-6;
    position: relative;
    z-index: 1;

    @include md-max {
      flex-direction: column;
      text-align: center;
    }
  }

  &__banner-text {
    flex: 1;
    color: #fff;
    display: flex;
    flex-direction: column;
    gap: $spacing-4;
  }

  &__banner-title {
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    margin: 0;
    line-height: 1.3;

    @include sm-max {
      font-size: $font-size-2xl;
    }
  }

  &__banner-description {
    font-size: $font-size-base;
    color: rgba(255, 255, 255, 0.95);
    line-height: 1.7;
    margin: 0;
    max-width: 600px;

    @include sm-max {
      font-size: $font-size-sm;
    }
  }

  &__banner-button {
    display: inline-flex;
    align-items: center;
    gap: $spacing-2;
    background-color: #fff;
    color: #0A3D2E;
    border: none;
    border-radius: $radius-full;
    padding: $spacing-3 $spacing-6;
    font-size: $font-size-base;
    font-weight: $font-weight-bold;
    cursor: pointer;
    transition: all $transition-fast;
    align-self: flex-start;
    margin-top: $spacing-2;

    @include md-max {
      align-self: center;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: $shadow-lg;
    }

    svg {
      width: 16px;
      height: 16px;
    }
  }

  &__banner-illustration {
    flex-shrink: 0;
    width: 200px;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;

    @include md-max {
      width: 150px;
      height: 150px;
    }

    @include sm-max {
      width: 120px;
      height: 120px;
    }
  }

  &__quran-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &__stats {
    width: 100%;
  }

  &__stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-4;
    overflow-x: auto;
    padding-bottom: $spacing-2;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;

    &::-webkit-scrollbar {
      height: 6px;
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

    @include sm-max {
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: $spacing-3;
    }
  }

  &__stat-card-wrapper {
    position: relative;
  }

  &__stat-card {
    background-color: var(--color-background-card);
    border-radius: $radius-xl;
    padding: $spacing-3;
    box-shadow: $shadow-md;
    min-height: 140px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: visible;
  }

  &__stat-icon {
    width: 48px;
    height: 48px;
    border-radius: $radius-lg;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: $shadow-sm;
    position: absolute;
    top: $spacing-10;
    left: $spacing-4;
    z-index: 2;
    animation: floatIcon 3s ease-in-out infinite;
    transition: transform $transition-fast;

    &:hover {
      transform: scale(1.1) rotate(5deg);
      animation-play-state: paused;
    }

    &--circle {
      border-radius: 50%;
    }

    img {
      width: 24px;
      height: 24px;
      object-fit: contain;
      animation: pulseIcon 2s ease-in-out infinite;
    }
  }

  &__stat-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: $spacing-2;
    margin-top: $spacing-7;
  }

  &__stat-value {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  &__stat-value--track {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    line-height: 1.5;
    word-break: break-word;
  }

  &__stat-value-main {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
    line-height: 1.3;
  }

  &__stat-value-sub {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
    line-height: 1.3;
    margin-top: -$spacing-1;
  }

  &__stat-skeleton {
    color: var(--color-text-muted);
    animation: pulse 1.5s ease-in-out infinite;
  }

  &__stat-label {
    font-size: $font-size-sm;
    color: var(--color-text-secondary);
    font-weight: $font-weight-medium;
  }

  &__loading,
  &__error {
    text-align: center;
    padding: $spacing-8;
    color: var(--color-text-secondary);
  }

  &__error {
    color: var(--color-error);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes floatIcon {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
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
