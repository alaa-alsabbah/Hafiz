<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import bgVideoImage from '@/assets/img/bgVedio.png'
import childImage from '@/assets/img/child.png'
import humanImage from '@/assets/img/human.png'
import wordImage from '@/assets/img/word.png'
import hiUserImage from '@/assets/img/hiUser.png'

const router = useRouter()
const selectedProgram = ref<'hafiz' | 'fursan'>('hafiz')

function openRegistrationDialog() {
  router.push({ name: 'register', query: { type: 'student' } })
}

function goToLogin() {
  router.push({ name: 'login' })
}

// Stats data
const stats = [
  {
    value: '+500',
    label: 'طلاب نشطون',
    image: childImage,
    color: 'green',
    position: 'top-left'
  },
  {
    value: '+50',
    label: 'معلمون معتمدون',
    image: humanImage,
    color: 'yellow',
    position: 'top-right'
  },
  {
    value: '+30',
    label: 'الدول',
    image: wordImage,
    color: 'blue',
    position: 'bottom-right'
  },
  {
    value: '+200',
    label: 'الإنجازات',
    image: childImage,
    color: 'pink',
    position: 'bottom-left'
  }
]

// Program tracks
const tracks = [
  {
    id: 'asas',
    title: 'مسار الأساس',
    description: 'بناء أساس قوي في قراءة القرآن، وأحكام التجويد. والحفظ الأولي.',
    features: [
      'أساسيات التجويد',
      'إتقان جزء عمّ',
      'طلاقة القراءة',
      'شهادة الأساس'
    ],
    color: 'tertiary'
  },
  {
    id: 'fursan',
    title: 'مسار الفرسان',
    description: 'إتقان التلاوة المتقدمة والتجويد لمن أكمل الحفظ.',
    features: [
      'إتقان التجويد',
      'قراءات متعددة',
      'التحضير للإجازة',
      'شهادة متقدمة'
    ],
    color: 'secondary'
  },
  {
    id: 'hafiz',
    title: 'مسار حافظ',
    description: 'برنامج حفظ القرآن الكريم مع مراجعات أسبوعية وتخصيص للسرعة.',
    features: [
      'حفظ 30 جزءاً',
      'تقديمات أسبوعية',
      'إرشاد فردي',
      'شهادة عند الانتهاء'
    ],
    color: 'primary'
  }
]

// Features
const features = [
  {
    image: 'data:image/svg+xml,%3csvg%20width=\'40\'%20height=\'40\'%20viewBox=\'0%200%2040%2040\'%20fill=\'none\'%20xmlns=\'http://www.w3.org/2000/svg\'%3e%3cpath%20d=\'M6.66675%2013.3334H33.3334M6.66675%2013.3334V28.0004C6.66675%2029.8672%206.66675%2030.8001%207.03006%2031.5132C7.34964%2032.1404%207.8592%2032.6508%208.48641%2032.9704C9.19875%2033.3334%2010.1317%2033.3334%2011.9949%2033.3334H28.0052C29.8684%2033.3334%2030.8001%2033.3334%2031.5124%2032.9704C32.1396%2032.6508%2032.6509%2032.1404%2032.9705%2031.5132C33.3334%2030.8008%2033.3334%2029.8692%2033.3334%2028.006V13.3334M6.66675%2013.3334V12.0004C6.66675%2010.1335%206.66675%209.19941%207.03006%208.48637C7.34964%207.85916%207.8592%207.3496%208.48641%207.03002C9.19945%206.66671%2010.1336%206.66671%2012.0004%206.66671H13.3334M33.3334%2013.3334V11.9949C33.3334%2010.1317%2033.3334%209.19871%2032.9705%208.48637C32.6509%207.85916%2032.1396%207.3496%2031.5124%207.03002C30.7994%206.66671%2029.8672%206.66671%2028.0004%206.66671H26.6667M13.3334%206.66671H26.6667M13.3334%206.66671V3.33337M26.6667%206.66671V3.33337M26.6667%2020H13.3334\'%20stroke=\'%23009968\'%20stroke-width=\'2\'%20stroke-linecap=\'round\'%20stroke-linejoin=\'round\'/%3e%3c/svg%3e',
    title: 'جدولة مرنة',
    description: 'اختر مواعيد المقابلات التي تناسب جدولك'
  },
  {
    image: 'data:image/svg+xml,%3csvg%20width=\'40\'%20height=\'40\'%20viewBox=\'0%200%2040%2040\'%20fill=\'none\'%20xmlns=\'http://www.w3.org/2000/svg\'%3e%3cpath%20d=\'M35%2033.3333C35%2030.4306%2032.2173%2027.9611%2028.3333%2027.0459M25%2033.3334C25%2029.6515%2020.5228%2026.6667%2015%2026.6667C9.47715%2026.6667%205%2029.6515%205%2033.3334M25%2021.6667C28.6819%2021.6667%2031.6667%2018.6819%2031.6667%2015C31.6667%2011.3181%2028.6819%208.33337%2025%208.33337M15%2021.6667C11.3181%2021.6667%208.33333%2018.6819%208.33333%2015C8.33333%2011.3181%2011.3181%208.33337%2015%208.33337C18.6819%208.33337%2021.6667%2011.3181%2021.6667%2015C21.6667%2018.6819%2018.6819%2021.6667%2015%2021.6667Z\'%20stroke=\'%23009968\'%20stroke-width=\'2\'%20stroke-linecap=\'round\'%20stroke-linejoin=\'round\'/%3e%3c/svg%3e',
    title: 'معلمون خبراء',
    description: 'تعلم من مشايخ مؤهلين ومعتمدين'
  },
  {
    image: 'data:image/svg+xml,%3csvg%20width=\'32\'%20height=\'27\'%20viewBox=\'0%200%2032%2027\'%20fill=\'none\'%20xmlns=\'http://www.w3.org/2000/svg\'%3e%3cpath%20d=\'M16%208.99967V25.9997M16%208.99967C16%206.19941%2016%204.79986%2016.545%203.73031C17.0243%202.7895%2017.7887%202.02433%2018.7295%201.54497C19.7991%201%2021.1994%201%2023.9997%201H28.333C29.2664%201%2029.7335%201%2030.09%201.18166C30.4036%201.34144%2030.6579%201.59623%2030.8177%201.90983C30.9994%202.26635%2031%202.73341%2031%203.66683V18.3335C31%2019.2669%2030.9994%2019.733%2030.8177%2020.0895C30.6579%2020.4031%2030.4041%2020.6587%2030.0905%2020.8185C29.7344%2021%2029.2683%2021%2028.3367%2021H23.6156C22.0502%2021%2021.2661%2021%2020.5557%2021.2158C19.9267%2021.4068%2019.3428%2021.7195%2018.835%2022.1369C18.2614%2022.6083%2017.8267%2023.2596%2016.9584%2024.562L16%2025.9997M16%208.99967C16%206.19941%2015.9997%204.79986%2015.4548%203.73031C14.9754%202.7895%2014.2104%202.02433%2013.2696%201.54497C12.2001%201%2010.7996%201%207.99935%201H3.66602C2.73259%201%202.26635%201%201.90983%201.18166C1.59623%201.34144%201.34144%201.59623%201.18166%201.90983C1%202.26635%201%202.73341%201%203.66683V18.3335C1%2019.2669%201%2019.733%201.18166%2020.0895C1.34144%2020.4031%201.59623%2020.6587%201.90983%2020.8185C2.266%2021%202.73168%2021%203.66328%2021H8.38455C9.9499%2021%2010.7324%2021%2011.4428%2021.2158C12.0718%2021.4068%2012.6585%2021.7195%2013.1663%2022.1369C13.7376%2022.6064%2014.1695%2023.2543%2015.0308%2024.5462L16%2025.9997\'%20stroke=\'%23009968\'%20stroke-width=\'2\'%20stroke-linecap=\'round\'%20stroke-linejoin=\'round\'/%3e%3c/svg%3e',
    title: 'خطط شخصية',
    description: 'خطط دراسية مخصصة تناسب مستواك'
  },
  {
    image: 'data:image/svg+xml,%3csvg%20width=\'40\'%20height=\'40\'%20viewBox=\'0%200%2040%2040\'%20fill=\'none\'%20xmlns=\'http://www.w3.org/2000/svg\'%3e%3cpath%20d=\'M5%2025.0004V28C5%2029.8669%205%2030.7997%205.36331%2031.5127C5.68289%2032.1399%206.19245%2032.6508%206.81966%2032.9704C7.532%2033.3334%208.46499%2033.3334%2010.3282%2033.3334H35.0003M5%2025.0004V8.33337M5%2025.0004L11.4223%2019.6485L11.4276%2019.6442C12.5894%2018.676%2013.1715%2018.191%2013.8026%2017.994C14.5481%2017.7613%2015.3512%2017.7981%2016.0726%2018.0974C16.6842%2018.3511%2017.2204%2018.8873%2018.2929%2019.9599L18.3037%2019.9706C19.3929%2021.0598%2019.9389%2021.6058%2020.5603%2021.8589C21.2956%2022.1585%2022.1142%2022.1843%2022.8678%2021.9343C23.5068%2021.7224%2024.0903%2021.2126%2025.2572%2020.1916L34.9999%2011.6667\'%20stroke=\'%23009968\'%20stroke-width=\'2\'%20stroke-linecap=\'round\'%20stroke-linejoin=\'round\'/%3e%3c/svg%3e',
    title: 'تتبع التقدم',
    description: 'راقب رحلتك من خلال لوحات معلومات مفصلة'
  }
]
</script>

<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero__container">
        <div class="hero__content">
          <h1 class="hero__title">برنامج حفظ وتلاوة القرآن الكريم الشامل</h1>
        <p class="hero__subtitle">
            انضم إلى آلاف الطلاب حول العالم في إتقان القرآن الكريم مع إرشادات شخصية، وخطط دراسية منظمة، ودعم مستمر من علماء معتمدين.
          </p>
          <div class="hero__cta">
            <button class="hero__btn hero__btn--primary" @click="openRegistrationDialog">
              سجل الآن
            </button>
            <button class="hero__btn hero__btn--secondary" @click="goToLogin">
              تسجيل الدخول
            </button>
          </div>
          <div class="hero__toggle-group">
            <button
              class="hero__toggle-btn"
              :class="{ 'hero__toggle-btn--active': selectedProgram === 'hafiz' }"
              @click="selectedProgram = 'hafiz'"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              حفظة
            </button>
            <button
              class="hero__toggle-btn"
              :class="{ 'hero__toggle-btn--active': selectedProgram === 'fursan' }"
              @click="selectedProgram = 'fursan'"
            >
              فرسان
            </button>
          </div>
        </div>
        <div class="hero__visual">
          <div class="hero__video-wrapper">
            <img :src="bgVideoImage" alt="حافظ" class="hero__video-bg" />
            <button class="hero__play-btn">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="11" fill="white" opacity="0.9" />
                <polygon points="9 7 17 12 9 17 9 7" fill="#1B7A4E" />
              </svg>
            </button>
          </div>
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="hero__stat"
            :class="[`hero__stat--${stat.position}`, `hero__stat--${stat.color}`]"
          >
            <div class="hero__stat-icon">
              <img :src="stat.image" :alt="stat.label" />
            </div>
            <div class="hero__stat-content">
              <span class="hero__stat-value">{{ stat.value }}</span>
              <span class="hero__stat-label">{{ stat.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Program Tracks Section -->
    <section class="tracks">
      <div class="tracks__container">
        <div class="tracks__header">
          <h2 class="tracks__title">مسارات البرنامج</h2>
          <p class="tracks__subtitle">
            تم تصميم كل مسار بعناية لتلبية احتياجات المشاركين في مراحل مختلفة من رحلتهم القرآنية، مما يضمن بيئة تعليمية منظمة وداعمة. سيتلقى المشاركون توجيهًا شخصيًا، وتقييمات منتظمة، وتقديرًا لإنجازاتهم مع تقدمهم.
          </p>
        </div>
        <div class="tracks__grid">
          <div
            v-for="track in tracks"
            :key="track.id"
            class="track-card"
            :class="`track-card--${track.color}`"
          >
            <h3 class="track-card__title">{{ track.title }}</h3>
            <p class="track-card__desc">{{ track.description }}</p>
            <ul class="track-card__features">
              <li
                v-for="(feature, index) in track.features"
                :key="feature"
                class="track-card__feature-item"
                :class="`track-card__feature-item--${index}`"
              >
                {{ feature }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="features__container">
        <div class="features__header">
          <h2 class="features__title">ميزات البرنامج</h2>
          <p class="features__subtitle">
            تم تصميم برنامجنا لتوفير تجربة تعلم سلسة، مع تحقيق التوازن بين المرونة والإرشاد الخبير. سيستفيد المشاركون من دعم منظم ورؤى واضحة حول تقدمهم في كل مرحلة.
          </p>
        </div>
        <div class="features__grid">
          <div
            v-for="(feature, index) in features"
            :key="index"
            class="feature-card"
          >
            <div class="feature-card__image">
              <img :src="feature.image" :alt="feature.title" />
            </div>
            <h3 class="feature-card__title">{{ feature.title }}</h3>
            <p class="feature-card__desc">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="cta__container">
        <div class="cta__content">
          <div class="cta__image">
            <img :src="hiUserImage" alt="مرحبا" />
          </div>
          <div class="cta__text">
            <h2 class="cta__title">ابدأ رحلتك في إتقان القرآن</h2>
            <p class="cta__subtitle">
              افتح مسارا منظما وموجها مصممًا لمساعدتك على الحفظ والتلاوة بإتقان. انضم اليوم واتخذ خطوتك الأولى نحو التحول.
            </p>
            <button class="cta__btn" @click="openRegistrationDialog">
              تقديم الطلب
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.home {
  background: transparent;
}

.hero {
  padding: 0;
  background: transparent;
  overflow: hidden;

  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 $spacing-6;
    display: flex;
    flex-direction: column;
    gap: $spacing-8;
  }

  &__content {
    text-align: center;
    max-width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;

    @include md {
      max-width: 900px;
    }
  }

  &__title {
    font-size: clamp(1.75rem, 5vw, 2.75rem);
    font-weight: 800;
    line-height: 1.4;
    color: var(--color-primary);
    margin-bottom: $spacing-4;
    text-align: center;
  }

  &__subtitle {
    font-size: $font-size-base;
    color: var(--color-text-primary);
    line-height: 1.8;
    margin-bottom: $spacing-6;
    text-align: center;
  }

  &__cta {
    display: flex;
    justify-content: center;
    margin-bottom: $spacing-4;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-2;
    padding: $spacing-3 $spacing-6;
    border-radius: $radius-lg;
    font-weight: 600;
    font-family: inherit;
    font-size: $font-size-base;
    cursor: pointer;
    transition: all $transition-fast;

    &--primary {
      background: var(--color-primary);
      color: #fff;
      border: none;

      &:hover {
        background: var(--color-primary-dark);
        transform: translateY(-2px);
      }
    }

    &--secondary {
      background: transparent;
      color: var(--color-primary);
      border: 1px solid var(--color-primary);
      margin-inline-start: $spacing-3;

      &:hover {
        background: var(--color-primary-lighter);
        transform: translateY(-2px);
      }
    }
  }

  &__toggle-group {
    display: inline-flex;
    background: rgba(255, 255, 255, 0.9);
    border-radius: $radius-xl;
    padding: 5px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin: 0 auto;
    gap: 0;
    overflow: hidden;
  }

  &__toggle-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-2;
    padding: $spacing-2 $spacing-5;
    border: none;
    font-weight: 600;
    font-family: inherit;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-fast;
    background: transparent;
    color: var(--color-text-primary);
    position: relative;

    &:first-child {
      border-top-right-radius: $radius-lg;
      border-bottom-right-radius: $radius-lg;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }

    &:last-child {
      border-top-left-radius: $radius-lg;
      border-bottom-left-radius: $radius-lg;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    &--active {
      background: var(--color-primary);
      color: #fff;
    }

    &:not(&--active) {
      background: transparent;
      color: var(--color-text-primary);

      &:hover {
        background: rgba(255, 255, 255, 0.5);
      }
    }
  }

  &__visual {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 350px;
    margin: 0 auto;
    width: 100%;
    max-width: 600px;
    padding: 0 0 $spacing-4 0;

    @include lg {
      max-width: 700px;
    }
  }

  &__video-wrapper {
    position: relative;
    width: 100%;
    max-width: 600px;
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__video-bg {
    width: 100%;
    height: auto;
    border-radius: $radius-xl;
  }

  &__play-btn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: none;
    border: none;
    cursor: pointer;
    transition: all $transition-fast;
    z-index: 2;

    &:hover {
      transform: translate(-50%, -50%) scale(1.1);
    }
  }

  &__stat {
    position: absolute;
    padding: $spacing-3 $spacing-4;
    border-radius: $radius-xl;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    z-index: 2;
    display: flex;
    align-items: center;
    gap: $spacing-3;
    min-width: 140px;

    @include sm-max {
      padding: $spacing-2 $spacing-3;
      min-width: 120px;
      gap: $spacing-2;
    }

    &--green {
      background: var(--color-stat-green);
    }

    &--yellow {
      background: var(--color-stat-yellow);
    }

    &--blue {
      background: var(--color-stat-blue);
    }

    &--pink {
      background: var(--color-stat-pink);
    }

    &--top-left {
      top: -50px;
      left: -200px;

      @include sm-max {
        transform: scale(0.75);
        top: -5px;
        left: -15px;
      }
    }

    &--top-right {
      top: -50px;
      right: -200px;

      @include sm-max {
        transform: scale(0.75);
        top: -5px;
        right: -15px;
      }
    }

    &--bottom-right {
      bottom: 20%;
      right: -200px;

      @include sm-max {
        transform: scale(0.75);
        bottom: 15%;
        right: -15px;
      }
    }

    &--bottom-left {
      bottom: 20%;
      left: -200px;

      @include sm-max {
        transform: scale(0.75);
        bottom: 15%;
        left: -15px;
      }
    }
  }

  &__stat-icon {
    width: 50px;
    height: 50px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    @include sm-max {
      width: 40px;
      height: 40px;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  &__stat-content {
    display: flex;
    flex-direction: column;
    gap: $spacing-1;
  }

  &__stat-value {
    font-weight: $font-weight-bold;
    font-size: $font-size-xl;
    color: var(--color-text);

    @include sm-max {
      font-size: $font-size-lg;
    }
  }

  &__stat-label {
    font-size: $font-size-sm;
    color: var(--color-text-muted);
    line-height: 1.3;

    @include sm-max {
      font-size: $font-size-xs;
    }
  }
}

.tracks {
  padding: $spacing-16 0;
  background: transparent;

  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 $spacing-6;
  }

  &__header {
    text-align: center;
    max-width: 700px;
    margin: 0 auto $spacing-12;
  }

  &__title {
    font-size: clamp(1.5rem, 4vw, 2rem);
    font-weight: 800;
    margin-bottom: $spacing-4;
    color: var(--color-text);
  }

  &__subtitle {
    font-size: $font-size-sm;
    color: var(--color-text-muted);
    line-height: 1.8;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-6;

    @include md-max {
      grid-template-columns: 1fr;
      gap: $spacing-4;
    }
  }
}

.track-card {
  border-radius: $radius-xl;
  padding: $spacing-8;
  transition: all $transition-normal;

  &--primary {
    background: var(--color-track-primary);
  }

  &--secondary {
    background: var(--color-track-secondary);
  }

  &--tertiary {
    background: var(--color-track-tertiary);
  }

  &__title {
    font-size: clamp(1.25rem, 3vw, 1.5rem);
    font-weight: $font-weight-bold;
    margin-bottom: $spacing-3;
    color: #1e1e1e;
  }

  &__desc {
    font-size: $font-size-base;
    color: #1e1e1e;
    line-height: 1.7;
    margin-bottom: $spacing-6;
  }

  &__features {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: $spacing-3;
  }

  &__feature-item {
    font-size: $font-size-sm;
    padding: $spacing-3 $spacing-4;
    border-radius: $radius-lg;
    color: #1e1e1e;
    font-weight: $font-weight-medium;
  }
}

.track-card--primary {
  .track-card__feature-item--0 {
    background: #ecfdf5;
  }
  .track-card__feature-item--1 {
    background: #ceffe8;
  }
  .track-card__feature-item--2 {
    background: #b8f3d7;
  }
  .track-card__feature-item--3 {
    background: #94ebc2;
  }
}

.track-card--secondary {
  .track-card__feature-item--0 {
    background: #e0f6ff;
  }
  .track-card__feature-item--1 {
    background: #ccf0ff;
  }
  .track-card__feature-item--2 {
    background: #bfeafb;
  }
  .track-card__feature-item--3 {
    background: #9adbf5;
  }
}

.track-card--tertiary {
  .track-card__feature-item--0 {
    background: #fff9e8;
  }
  .track-card__feature-item--1 {
    background: #fbf1d5;
  }
  .track-card__feature-item--2 {
    background: #f3e6c1;
  }
  .track-card__feature-item--3 {
    background: #f9e6b0;
  }
}

.features {
  padding: $spacing-16 0;
  background: transparent;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 50%;
    height: 50%;
    background: radial-gradient(ellipse at top left, rgba(240, 247, 242, 0.5) 0%, transparent 70%);
    pointer-events: none;
  }

  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 $spacing-6;
    position: relative;
    z-index: 1;
  }

  &__header {
    text-align: center;
    max-width: 700px;
    margin: 0 auto $spacing-12;
  }

  &__title {
    font-size: clamp(1.5rem, 4vw, 2rem);
    font-weight: 800;
    margin-bottom: $spacing-4;
    color: #1e1e1e;
  }

  &__subtitle {
    font-size: $font-size-sm;
    color: #1e1e1e;
    line-height: 1.8;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: $spacing-6;

    @include sm-max {
      grid-template-columns: 1fr 1fr;
    }
  }
}

.feature-card {
  text-align: center;
  padding: $spacing-6;
  background: rgba(255, 255, 255, 0.7);
  border-radius: $radius-xl;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  &__image {
    width: 80px;
    height: 80px;
    margin: 0 auto $spacing-4;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-primary-lighter);
    border-radius: $radius-lg;

    img {
      width: 48px;
      height: 48px;
      object-fit: contain;
    }
  }

  &__title {
    font-size: $font-size-base;
    font-weight: $font-weight-bold;
    margin-bottom: $spacing-2;
    color: #1e1e1e;
  }

  &__desc {
    font-size: $font-size-sm;
    color: #1e1e1e;
    line-height: 1.6;
  }
}

.cta {
  padding: $spacing-8 $spacing-6;

  &__container {
    max-width: 1200px;
    margin: 0 auto;
  }

  &__content {
    background: linear-gradient(87.06deg, #ecfdf5 -25.27%, #009968 97.19%);
    border-radius: $radius-3xl;
    padding: 0 $spacing-6;
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    gap: $spacing-8;
    position: relative;
    overflow: hidden;

    @include sm-max {
      flex-direction: column;
      padding: $spacing-6;
      gap: $spacing-6;
    }
  }

  &__image {
    flex-shrink: 0;
    z-index: 1;

    img {
      width: 200px;
      height: auto;
      max-width: 100%;
      display: block;

      @include sm-max {
        width: 150px;
      }
    }
  }

  &__text {
    flex: 1;
    z-index: 1;
    text-align: center;
  }

  &__title {
    font-size: clamp(1.5rem, 4vw, 2rem);
    font-weight: 800;
    color: #fff;
    margin-bottom: $spacing-3;
  }

  &__subtitle {
    font-size: $font-size-base;
    color: rgba(255, 255, 255, 0.85);
    line-height: 1.8;
    margin-bottom: $spacing-6;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: $spacing-3;
    background: linear-gradient(90deg, #3c3c3c, #1e1e1e);
    color: #fff;
    padding: $spacing-4 $spacing-8;
    border: none;
    border-radius: $radius-lg;
    font-weight: 600;
    font-size: $font-size-base;
    font-family: inherit;
    cursor: pointer;
    transition: all $transition-fast;

    svg {
      width: 20px;
      height: 20px;
      stroke: #fff;
      transform: rotate(230deg);
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }
  }
}
</style>
