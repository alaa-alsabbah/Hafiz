<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

interface Country {
  code: string
  dialCode: string
  name: string
  flag: string
}

interface Props {
  modelValue?: string
  countryCode?: string
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  countryCode: '+962',
  label: '',
  placeholder: '',
  error: '',
  disabled: false,
  required: false,
  id: () => `phone-input-${Math.random().toString(36).substr(2, 9)}`
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:countryCode': [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

// Common countries with flags (using emoji flags)
const countries: Country[] = [
  { code: 'JO', dialCode: '+962', name: 'الأردن', flag: '🇯🇴' },
  { code: 'SA', dialCode: '+966', name: 'السعودية', flag: '🇸🇦' },
  { code: 'AE', dialCode: '+971', name: 'الإمارات', flag: '🇦🇪' },
  { code: 'KW', dialCode: '+965', name: 'الكويت', flag: '🇰🇼' },
  { code: 'QA', dialCode: '+974', name: 'قطر', flag: '🇶🇦' },
  { code: 'BH', dialCode: '+973', name: 'البحرين', flag: '🇧🇭' },
  { code: 'OM', dialCode: '+968', name: 'عمان', flag: '🇴🇲' },
  { code: 'IQ', dialCode: '+964', name: 'العراق', flag: '🇮🇶' },
  { code: 'SY', dialCode: '+963', name: 'سوريا', flag: '🇸🇾' },
  { code: 'LB', dialCode: '+961', name: 'لبنان', flag: '🇱🇧' },
  { code: 'EG', dialCode: '+20', name: 'مصر', flag: '🇪🇬' },
  { code: 'PS', dialCode: '+970', name: 'فلسطين', flag: '🇵🇸' },
  { code: 'YE', dialCode: '+967', name: 'اليمن', flag: '🇾🇪' },
  { code: 'MA', dialCode: '+212', name: 'المغرب', flag: '🇲🇦' },
  { code: 'DZ', dialCode: '+213', name: 'الجزائر', flag: '🇩🇿' },
  { code: 'TN', dialCode: '+216', name: 'تونس', flag: '🇹🇳' },
  { code: 'LY', dialCode: '+218', name: 'ليبيا', flag: '🇱🇾' },
  { code: 'SD', dialCode: '+249', name: 'السودان', flag: '🇸🇩' },
  { code: 'TR', dialCode: '+90', name: 'تركيا', flag: '🇹🇷' },
  { code: 'US', dialCode: '+1', name: 'الولايات المتحدة', flag: '🇺🇸' },
  { code: 'GB', dialCode: '+44', name: 'المملكة المتحدة', flag: '🇬🇧' },
  { code: 'FR', dialCode: '+33', name: 'فرنسا', flag: '🇫🇷' },
  { code: 'DE', dialCode: '+49', name: 'ألمانيا', flag: '🇩🇪' },
  { code: 'CA', dialCode: '+1', name: 'كندا', flag: '🇨🇦' },
  { code: 'AU', dialCode: '+61', name: 'أستراليا', flag: '🇦🇺' }
]

const isDropdownOpen = ref(false)
const isFocused = ref(false)
const countrySelectorRef = ref<HTMLElement | null>(null)
const dropdownPanelRef = ref<HTMLElement | null>(null)
const dropdownStyle = ref<{ top: string; left: string; width: string }>({
  top: '0',
  left: '0',
  width: '300px',
})
const searchQuery = ref('')

function findCountriesByDial(dial: string | undefined): Country[] {
  if (!dial) return []
  return countries.filter((c) => c.dialCode === dial)
}

function resolveCountryFromDial(dial: string | undefined): Country {
  if (!dial) return countries[0]
  const matches = findCountriesByDial(dial)
  if (matches.length === 1) return matches[0]
  if (matches.length > 1) {
    const jordan = matches.find((c) => c.code === 'JO')
    if (dial === '+962' && jordan) return jordan
    return matches[0]
  }
  return countries[0]
}

/** ISO code (e.g. JO, US) — required so +1 can distinguish US vs CA */
const selectedCountryIso = ref(resolveCountryFromDial(props.countryCode).code)

const selectedCountry = computed(() => {
  return countries.find((c) => c.code === selectedCountryIso.value) || countries[0]
})

const filteredCountries = computed(() => {
  if (!searchQuery.value) return countries
  const query = searchQuery.value.toLowerCase()
  return countries.filter(c => 
    c.name.toLowerCase().includes(query) ||
    c.dialCode.includes(query) ||
    c.code.toLowerCase().includes(query)
  )
})

const hasError = computed(() => !!props.error)

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function handleFocus(event: FocusEvent) {
  isFocused.value = true
  emit('focus', event)
}

function handleBlur(event: FocusEvent) {
  isFocused.value = false
  emit('blur', event)
  setTimeout(() => {
    const active = document.activeElement
    const inSelector = countrySelectorRef.value?.contains(active)
    const inDropdown = dropdownPanelRef.value?.contains(active)
    if (!inSelector && !inDropdown) {
      closeDropdown()
    }
  }, 250)
}

function updateDropdownPosition() {
  if (!countrySelectorRef.value) return
  const rect = countrySelectorRef.value.getBoundingClientRect()
  const width = Math.max(rect.width, 300)
  dropdownStyle.value = {
    top: `${rect.bottom + 8}px`,
    left: `${rect.left}px`,
    width: `${width}px`,
  }
}

function focusSearchInput() {
  nextTick(() => {
    const searchInput = dropdownPanelRef.value?.querySelector(
      '.base-phone-input__search-input'
    ) as HTMLInputElement | null
    searchInput?.focus()
  })
}

function openDropdown() {
  isDropdownOpen.value = true
  searchQuery.value = ''
  updateDropdownPosition()
  focusSearchInput()
}

function closeDropdown() {
  isDropdownOpen.value = false
}

function toggleDropdown(event?: Event) {
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  if (props.disabled) return
  if (isDropdownOpen.value) {
    closeDropdown()
    return
  }
  openDropdown()
}

function selectCountry(country: Country) {
  selectedCountryIso.value = country.code
  emit('update:countryCode', country.dialCode)
  closeDropdown()
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node
  const inSelector = countrySelectorRef.value?.contains(target)
  const inDropdown = dropdownPanelRef.value?.contains(target)
  if (!inSelector && !inDropdown) {
    closeDropdown()
  }
}

function handleScrollOrResize() {
  if (isDropdownOpen.value) {
    updateDropdownPosition()
  }
}

function handleDropdownClick(event: MouseEvent) {
  event.stopPropagation()
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true)
  window.addEventListener('scroll', handleScrollOrResize, true)
  window.addEventListener('resize', handleScrollOrResize)
  emit('update:countryCode', selectedCountry.value.dialCode)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true)
  window.removeEventListener('scroll', handleScrollOrResize, true)
  window.removeEventListener('resize', handleScrollOrResize)
})

watch(isDropdownOpen, (open) => {
  if (open) {
    updateDropdownPosition()
  }
})

watch(
  () => props.countryCode,
  (newCode) => {
    if (!newCode || newCode === selectedCountry.value.dialCode) return
    const next = resolveCountryFromDial(newCode)
    if (next.code !== selectedCountryIso.value) {
      selectedCountryIso.value = next.code
    }
  }
)
</script>

<template>
  <div class="base-phone-input">
    <label v-if="label" :for="id" class="base-phone-input__label">
      {{ label }}
      <span v-if="required" class="base-phone-input__required">*</span>
    </label>
    
    <div 
      class="base-phone-input__wrapper"
      dir="ltr"
      :class="{ 
        'base-phone-input__wrapper--focused': isFocused,
        'base-phone-input__wrapper--error': hasError,
        'base-phone-input__wrapper--disabled': disabled
      }"
    >
      <!-- Country Code Dropdown (left) -->
      <div class="base-phone-input__country-selector" ref="countrySelectorRef">
        <button
          type="button"
          class="base-phone-input__country-btn"
          :class="{ 'base-phone-input__country-btn--open': isDropdownOpen }"
          :disabled="disabled"
          @click.stop="toggleDropdown"
          @mousedown.prevent.stop
        >
          <span class="base-phone-input__flag">{{ selectedCountry.flag }}</span>
          <span class="base-phone-input__country-meta">
            <span class="base-phone-input__dial-code">{{ selectedCountry.dialCode }}</span>
            <span class="base-phone-input__iso-code">{{ selectedCountry.code }}</span>
          </span>
          <svg 
            class="base-phone-input__chevron"
            :class="{ 'base-phone-input__chevron--open': isDropdownOpen }"
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
      
      <!-- Phone Number Input (right) -->
      <input
        :id="id"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        type="tel"
        autocomplete="tel"
        class="base-phone-input__field"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />
    </div>

    <Teleport to="body">
      <Transition name="dropdown">
        <div
          v-if="isDropdownOpen"
          ref="dropdownPanelRef"
          class="base-phone-input__dropdown base-phone-input__dropdown--fixed"
          :style="dropdownStyle"
          @click.stop="handleDropdownClick"
        >
          <div class="base-phone-input__dropdown-search">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="ابحث عن دولة..."
              class="base-phone-input__search-input"
              dir="rtl"
              @input.stop
              @click.stop
              @focus.stop
            />
          </div>
          <div class="base-phone-input__dropdown-list">
            <button
              v-for="country in filteredCountries"
              :key="country.code"
              type="button"
              class="base-phone-input__dropdown-item"
              :class="{ 'base-phone-input__dropdown-item--selected': country.code === selectedCountryIso }"
              @click.stop="selectCountry(country)"
              @mousedown.prevent
            >
              <span class="base-phone-input__flag-item" :title="country.name">{{ country.flag }}</span>
              <span class="base-phone-input__dropdown-item-text">
                <span class="base-phone-input__country-name">{{ country.name }}</span>
                <span class="base-phone-input__country-dial">{{ country.dialCode }}</span>
              </span>
              <span
                v-if="country.code === selectedCountryIso"
                class="base-phone-input__dropdown-check"
                aria-hidden="true"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
    
    <p v-if="error" class="base-phone-input__error">{{ error }}</p>
  </div>
</template>

<style lang="scss" scoped>
.base-phone-input {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
  
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
    align-items: stretch;
    direction: ltr;
    unicode-bidi: isolate;
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
      
      &.base-phone-input__wrapper--focused {
        box-shadow: 0 0 0 3px rgba($color-error, 0.1);
      }
    }
    
    &--disabled {
      background-color: var(--color-background);
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
  
  &__country-selector {
    position: relative;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    border-right: 1px solid var(--color-border);
    background: linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%);
    border-radius: $radius-lg 0 0 $radius-lg;
  }
  
  &__country-btn {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    min-width: 118px;
    padding: 0 $spacing-3;
    height: $input-height;
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--color-text-primary);
    transition: background-color $transition-fast, color $transition-fast;
    border-radius: $radius-lg 0 0 $radius-lg;
    
    &:hover:not(:disabled) {
      background-color: rgba(0, 0, 0, 0.03);
    }

    &--open {
      background-color: rgba(0, 0, 0, 0.04);
    }
    
    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }
  
  &__flag {
    font-size: 22px;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    user-select: none;
  }

  &__country-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1px;
    min-width: 0;
  }
  
  &__dial-code {
    font-size: $font-size-sm;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
    line-height: 1.2;
  }

  &__iso-code {
    font-size: 0.65rem;
    font-weight: $font-weight-medium;
    color: var(--color-text-muted);
    letter-spacing: 0.04em;
    line-height: 1;
  }
  
  &__flag-item {
    font-size: 20px;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    user-select: none;
  }
  
  &__chevron {
    margin-left: auto;
    transition: transform $transition-fast, color $transition-fast;
    color: var(--color-text-muted);
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    
    &--open {
      transform: rotate(180deg);
      color: var(--color-primary);
    }
  }
  
  &__dropdown {
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: $radius-xl;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.08),
      0 10px 24px -4px rgba(0, 0, 0, 0.12);
    z-index: 1100;
    max-height: 320px;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    &--fixed {
      position: fixed;
      transform-origin: top left;
    }
  }
  
  &__dropdown-search {
    padding: $spacing-3;
    border-bottom: 1px solid var(--color-border);
    background: #fafafa;
  }
  
  &__search-input {
    width: 100%;
    height: 42px;
    padding: 0 $spacing-4;
    border: 1px solid var(--color-border);
    border-radius: $radius-lg;
    font-size: $font-size-base;
    background: #fff;
    font-family: var(--font-family);
    color: var(--color-text-primary);
    transition: all $transition-fast;
    
    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba($color-primary, 0.1);
    }
    
    &::placeholder {
      color: var(--color-text-muted);
    }
  }
  
  &__dropdown-list {
    overflow-y: auto;
    max-height: 260px;
    padding: $spacing-2;
    display: flex;
    flex-direction: column;
    gap: $spacing-1;
  }
  
  &__dropdown-item {
    display: flex;
    align-items: center;
    gap: $spacing-3;
    width: 100%;
    padding: $spacing-2 $spacing-3;
    border: none;
    background: transparent;
    cursor: pointer;
    text-align: left;
    transition: background-color $transition-fast;
    border-radius: $radius-lg;
    direction: ltr;
    
    &:hover {
      background: var(--color-primary-lighter, rgba(16, 185, 129, 0.08));
    }
    
    &--selected {
      background: var(--color-primary-lighter, rgba(16, 185, 129, 0.12));
    }
  }

  &__dropdown-item-text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }

  &__country-name {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: var(--color-text-primary);
  }
  
  &__country-dial {
    font-size: $font-size-xs;
    color: var(--color-text-muted);
    font-weight: $font-weight-medium;
  }

  &__dropdown-check {
    display: flex;
    align-items: center;
    color: var(--color-primary);
    flex-shrink: 0;
  }
  
  &__field {
    flex: 1;
    width: 100%;
    min-width: 0;
    height: $input-height;
    padding: 0 $spacing-4;
    border: none;
    background: transparent;
    font-family: var(--font-family);
    font-size: $font-size-base;
    color: var(--color-text-primary);
    outline: none;
    text-align: left;
    direction: ltr;
    
    &::placeholder {
      color: var(--color-text-muted);
    }
    
    &:disabled {
      cursor: not-allowed;
    }
  }
  
  &__error {
    font-size: $font-size-sm;
    color: var(--color-error);
    margin: 0;
  }
}

// Dropdown transition
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all $transition-fast;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
