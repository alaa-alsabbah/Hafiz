<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

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

const selectedCountryCode = ref(props.countryCode || '+962')
const isDropdownOpen = ref(false)
const isFocused = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const searchQuery = ref('')

const selectedCountry = computed(() => {
  return countries.find(c => c.dialCode === selectedCountryCode.value) || countries[0]
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
  // Close dropdown after a delay to allow click events
  setTimeout(() => {
    if (!dropdownRef.value?.contains(document.activeElement)) {
      isDropdownOpen.value = false
    }
  }, 250)
}

function toggleDropdown(event?: Event) {
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  if (props.disabled) return
  isDropdownOpen.value = !isDropdownOpen.value
  if (isDropdownOpen.value) {
    searchQuery.value = ''
    // Focus search input when dropdown opens
    setTimeout(() => {
      const searchInput = dropdownRef.value?.querySelector('.base-phone-input__search-input') as HTMLInputElement
      if (searchInput) {
        searchInput.focus()
      }
    }, 100)
  }
}

function selectCountry(country: Country) {
  selectedCountryCode.value = country.dialCode
  emit('update:countryCode', country.dialCode)
  isDropdownOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node
  if (dropdownRef.value && !dropdownRef.value.contains(target)) {
    isDropdownOpen.value = false
  }
}

function handleDropdownClick(event: MouseEvent) {
  event.stopPropagation()
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  emit('update:countryCode', selectedCountryCode.value)
})

// Watch for prop changes
watch(() => props.countryCode, (newCode) => {
  if (newCode && newCode !== selectedCountryCode.value) {
    selectedCountryCode.value = newCode
  }
})
</script>

<template>
  <div class="base-phone-input">
    <label v-if="label" :for="id" class="base-phone-input__label">
      {{ label }}
      <span v-if="required" class="base-phone-input__required">*</span>
    </label>
    
    <div 
      class="base-phone-input__wrapper"
      :class="{ 
        'base-phone-input__wrapper--focused': isFocused,
        'base-phone-input__wrapper--error': hasError,
        'base-phone-input__wrapper--disabled': disabled
      }"
    >
      <!-- Country Code Dropdown -->
      <div class="base-phone-input__country-selector" ref="dropdownRef">
        <button
          type="button"
          class="base-phone-input__country-btn"
          :disabled="disabled"
          @click.stop="toggleDropdown"
          @mousedown.prevent.stop
        >
          <span class="base-phone-input__flag">{{ selectedCountry.flag }}</span>
          <span class="base-phone-input__dial-code">{{ selectedCountry.dialCode }}</span>
          <svg 
            class="base-phone-input__chevron"
            :class="{ 'base-phone-input__chevron--open': isDropdownOpen }"
            width="14" 
            height="14" 
            viewBox="0 0 12 12" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2"
          >
            <path d="m3 4.5 3 3 3-3" />
          </svg>
        </button>
        
        <!-- Dropdown Menu -->
        <Transition name="dropdown">
          <div v-if="isDropdownOpen" class="base-phone-input__dropdown" @click.stop="handleDropdownClick">
            <div class="base-phone-input__dropdown-search">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="ابحث عن دولة..."
                class="base-phone-input__search-input"
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
                :class="{ 'base-phone-input__dropdown-item--selected': country.dialCode === selectedCountryCode }"
                @click.stop="selectCountry(country)"
                @mousedown.prevent
              >
                <span class="base-phone-input__flag-item" :title="country.name">{{ country.flag }}</span>
                <span class="base-phone-input__country-dial">{{ country.dialCode }}</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
      
      <!-- Phone Number Input -->
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
  }
  
  &__country-btn {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    padding: 0 $spacing-3;
    height: $input-height;
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--color-text-muted);
    transition: color $transition-fast;
    
    &:hover:not(:disabled) {
      color: var(--color-text-secondary);
    }
    
    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }
  
  &__flag {
    font-size: 20px;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    user-select: none;
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
  
  &__dial-code {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: var(--color-text-primary);
  }
  
  &__chevron {
    transition: transform $transition-fast;
    color: var(--color-text-muted);
    flex-shrink: 0;
    width: 14px;
    height: 14px;
    
    &--open {
      transform: rotate(180deg);
    }
  }
  
  &__dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: $radius-lg;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    max-height: 300px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  &__dropdown-search {
    padding: $spacing-2;
    border-bottom: 1px solid var(--color-border);
  }
  
  &__search-input {
    width: 100%;
    height: $input-height;
    padding: 0 $spacing-4;
    border: 1px solid var(--color-border);
    border-radius: $radius-md;
    font-size: $font-size-base;
    background: var(--color-background-input);
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
    max-height: 240px;
    padding: $spacing-1;
  }
  
  &__dropdown-item {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: $spacing-2;
    width: 100%;
    padding: $spacing-2 $spacing-3;
    border: none;
    background: transparent;
    cursor: pointer;
    text-align: right;
    transition: background $transition-fast;
    border-radius: $radius-md;
    direction: rtl;
    
    &:hover {
      background: var(--color-background-hover);
    }
    
    &--selected {
      background: var(--color-background-hover);
      font-weight: $font-weight-medium;
    }
  }
  
  &__country-dial {
    font-size: $font-size-sm;
    color: var(--color-text-secondary);
    font-weight: $font-weight-medium;
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
