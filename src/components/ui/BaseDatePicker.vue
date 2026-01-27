<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
  id?: string
  min?: string
  max?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  placeholder: 'تاريخ الميلاد',
  error: '',
  disabled: false,
  required: false,
  id: () => `datepicker-${Math.random().toString(36).substr(2, 9)}`,
  min: '',
  max: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const isOpen = ref(false)
const isFocused = ref(false)
const datePickerRef = ref<HTMLElement | null>(null)

const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
const weekDays = ['سبت', 'أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة']

const selectedDate = computed(() => {
  if (!props.modelValue) return null
  const date = new Date(props.modelValue)
  return isNaN(date.getTime()) ? null : date
})

const displayValue = computed(() => {
  if (!selectedDate.value) return ''
  const day = selectedDate.value.getDate()
  const month = months[selectedDate.value.getMonth()]
  const year = selectedDate.value.getFullYear()
  return `${day} ${month} ${year}`
})

const currentMonth = ref(new Date())
const currentYear = computed(() => currentMonth.value.getFullYear())
const currentMonthIndex = computed(() => currentMonth.value.getMonth())

const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonthIndex.value
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDay = firstDay.getDay()
  const adjustedStartDay = startDay === 6 ? 0 : startDay + 1
  
  const days = []
  
  // Previous month days
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = adjustedStartDay - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i)
    days.push({ date, isCurrentMonth: false, isToday: false, isSelected: false })
  }
  
  // Current month days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i)
    const today = new Date()
    days.push({
      date,
      isCurrentMonth: true,
      isToday: date.toDateString() === today.toDateString(),
      isSelected: selectedDate.value ? date.toDateString() === selectedDate.value.toDateString() : false
    })
  }
  
  // Next month days
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i)
    days.push({ date, isCurrentMonth: false, isToday: false, isSelected: false })
  }
  
  return days
})

function isDateDisabled(date: Date): boolean {
  if (props.min) {
    const minDate = new Date(props.min)
    if (date < minDate) return true
  }
  if (props.max) {
    const maxDate = new Date(props.max)
    if (date > maxDate) return true
  }
  return false
}

function selectDate(date: Date) {
  if (isDateDisabled(date)) return
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const dateString = `${year}-${month}-${day}`
  emit('update:modelValue', dateString)
  isOpen.value = false
  isFocused.value = false
}

function previousMonth() {
  currentMonth.value = new Date(currentYear.value, currentMonthIndex.value - 1, 1)
}

function nextMonth() {
  currentMonth.value = new Date(currentYear.value, currentMonthIndex.value + 1, 1)
}

function toggleCalendar() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    currentMonth.value = selectedDate.value ? new Date(selectedDate.value) : new Date()
  }
}

function handleFocus(event: FocusEvent) {
  isFocused.value = true
  emit('focus', event)
}

function handleBlur(event: FocusEvent) {
  setTimeout(() => {
    if (!datePickerRef.value?.contains(document.activeElement)) {
      isFocused.value = false
      isOpen.value = false
      emit('blur', event)
    }
  }, 200)
}

function handleClickOutside(event: MouseEvent) {
  if (datePickerRef.value && !datePickerRef.value.contains(event.target as Node)) {
    isOpen.value = false
    isFocused.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const hasError = computed(() => !!props.error)
</script>

<template>
  <div ref="datePickerRef" class="base-datepicker">
    <label v-if="label" :for="id" class="base-datepicker__label">
      {{ label }}
      <span v-if="required" class="base-datepicker__required">*</span>
    </label>
    
    <div
      class="base-datepicker__wrapper"
      :class="{
        'base-datepicker__wrapper--focused': isFocused || isOpen,
        'base-datepicker__wrapper--error': hasError,
        'base-datepicker__wrapper--disabled': disabled
      }"
    >
      <input
        :id="id"
        type="text"
        :value="displayValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        readonly
        class="base-datepicker__field"
        @click="toggleCalendar"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      
      <button
        type="button"
        class="base-datepicker__icon-btn"
        :disabled="disabled"
        @click="toggleCalendar"
        tabindex="-1"
      >
        <svg class="base-datepicker__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>
    </div>
    
    <Transition name="calendar">
      <div v-if="isOpen" class="base-datepicker__calendar">
        <div class="base-datepicker__calendar-header">
          <div class="base-datepicker__calendar-nav-group">
            <button type="button" class="base-datepicker__calendar-nav base-datepicker__calendar-nav--year" @click="currentMonth = new Date(currentYear - 1, currentMonthIndex, 1)" title="السنة السابقة">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m11 17-5-5 5-5" />
                <path d="m18 17-5-5 5-5" />
              </svg>
            </button>
            <button type="button" class="base-datepicker__calendar-nav" @click="previousMonth" title="الشهر السابق">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
          
          <div class="base-datepicker__calendar-title">
            {{ months[currentMonthIndex] }} {{ currentYear }}
          </div>
          
          <div class="base-datepicker__calendar-nav-group">
            <button type="button" class="base-datepicker__calendar-nav" @click="nextMonth" title="الشهر التالي">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button type="button" class="base-datepicker__calendar-nav base-datepicker__calendar-nav--year" @click="currentMonth = new Date(currentYear + 1, currentMonthIndex, 1)" title="السنة التالية">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m13 17 5-5-5-5" />
                <path d="m6 17 5-5-5-5" />
              </svg>
            </button>
          </div>
        </div>
        
        <div class="base-datepicker__calendar-days-header">
          <div v-for="day in weekDays" :key="day" class="base-datepicker__calendar-day-name">
            {{ day }}
          </div>
        </div>
        
        <div class="base-datepicker__calendar-grid">
          <button
            v-for="(day, index) in calendarDays"
            :key="index"
            type="button"
            class="base-datepicker__calendar-day"
            :class="{
              'base-datepicker__calendar-day--other-month': !day.isCurrentMonth,
              'base-datepicker__calendar-day--today': day.isToday,
              'base-datepicker__calendar-day--selected': day.isSelected,
              'base-datepicker__calendar-day--disabled': isDateDisabled(day.date)
            }"
            :disabled="isDateDisabled(day.date) || !day.isCurrentMonth"
            @click="selectDate(day.date)"
          >
            {{ day.date.getDate() }}
          </button>
        </div>
      </div>
    </Transition>
    
    <p v-if="error" class="base-datepicker__error">{{ error }}</p>
  </div>
</template>

<style lang="scss" scoped>
.base-datepicker {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
  position: relative;
  
  &__label {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: var(--color-text-primary);
  }
  
  &__required {
    color: var(--color-error);
    margin-right: $spacing-1;
  }
  
  &__wrapper {
    position: relative;
    display: flex;
    align-items: center;
    background-color: var(--color-background-input);
    border: 1px solid var(--color-border);
    border-radius: $radius-lg;
    transition: all $transition-fast;
    
    &:hover:not(&--disabled) {
      border-color: var(--color-text-muted);
    }
    
    &--focused {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba($color-primary, 0.1);
    }
    
    &--error {
      border-color: var(--color-error);
      
      &.base-datepicker__wrapper--focused {
        box-shadow: 0 0 0 3px rgba($color-error, 0.1);
      }
    }
    
    &--disabled {
      background-color: var(--color-background);
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
  
  &__field {
    flex: 1;
    width: 100%;
    height: $input-height;
    padding: 0 $spacing-4;
    border: none;
    background: transparent;
    font-family: var(--font-family);
    font-size: $font-size-base;
    color: var(--color-text-primary);
    outline: none;
    cursor: pointer;
    
    &::placeholder {
      color: var(--color-text-muted);
    }
    
    &:disabled {
      cursor: not-allowed;
    }
  }
  
  &__icon-btn {
    display: flex;
    align-items: center;
    padding: 0 $spacing-3;
    background: transparent;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    transition: color $transition-fast;
    
    &:hover:not(:disabled) {
      color: var(--color-text-secondary);
    }
    
    &:disabled {
      cursor: not-allowed;
    }
  }
  
  &__icon {
    width: 20px;
    height: 20px;
  }
  
  &__calendar {
    position: absolute;
    top: calc(100% + $spacing-2);
    right: 0;
    z-index: 1000;
    background: #fff;
    border: 1px solid var(--color-border);
    border-radius: $radius-lg;
    box-shadow: $shadow-lg;
    padding: $spacing-4;
    min-width: 300px;
  }
  
  &__calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-4;
  }
  
  &__calendar-nav-group {
    display: flex;
    gap: $spacing-2;
  }
  
  &__calendar-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    color: var(--color-text-secondary);
    cursor: pointer;
    border-radius: $radius-md;
    transition: all $transition-fast;
    
    &:hover {
      background: var(--color-background);
      color: var(--color-primary);
    }
    
    &--year {
      width: 40px;
    }
  }
  
  &__calendar-title {
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
    color: var(--color-text-primary);
  }
  
  &__calendar-days-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: $spacing-1;
    margin-bottom: $spacing-2;
  }
  
  &__calendar-day-name {
    text-align: center;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    color: var(--color-text-secondary);
    padding: $spacing-2;
  }
  
  &__calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: $spacing-2;
  }
  
  &__calendar-day {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    background: transparent;
    color: var(--color-text-primary);
    font-size: $font-size-sm;
    cursor: pointer;
    border-radius: $radius-md;
    transition: all $transition-fast;
    padding: $spacing-2;
    min-height: 36px;
    
    &:hover:not(&--disabled):not(&--other-month) {
      background: var(--color-background);
      border-color: var(--color-primary);
    }
    
    &--today {
      font-weight: $font-weight-bold;
      color: var(--color-primary);
    }
    
    &--selected {
      background: var(--color-primary);
      color: #fff;
      font-weight: $font-weight-bold;
    }
    
    &--other-month {
      opacity: 0.3;
      cursor: not-allowed;
    }
    
    &--disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  }
  
  &__error {
    font-size: $font-size-sm;
    color: var(--color-error);
    margin: 0;
  }
}

.calendar-enter-active,
.calendar-leave-active {
  transition: all $transition-fast;
}

.calendar-enter-from,
.calendar-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
