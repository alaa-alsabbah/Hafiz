<script setup lang="ts">
export type KpiStatCardIcon =
  | 'present'
  | 'absent'
  | 'delayed'
  | 'permission'
  | 'total'
  | 'active'
  | 'hefaza'
  | 'fursan'
  | 'golden'
  | 'silver'

interface Props {
  value: number | string
  label: string
  tag: string
  icon: KpiStatCardIcon
  iconBg?: string
  tagColor?: {
    background: string
    text: string
  }
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  iconBg: 'rgba(232, 245, 233, 1)',
  loading: false,
})
</script>

<template>
  <div class="kpi-stat-card">
    <div class="kpi-stat-card__icon" :style="{ backgroundColor: iconBg }">
      <!-- Present / Check -->
      <svg
        v-if="icon === 'present'"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <!-- Absent / X -->
      <svg
        v-else-if="icon === 'absent'"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10"/>
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
        <line x1="19.07" y1="4.93" x2="4.93" y2="19.07"/>
      </svg>
      <!-- Delayed / Clock -->
      <svg
        v-else-if="icon === 'delayed'"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      <!-- Permission / Message bubble -->
      <svg
        v-else-if="icon === 'permission'"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
      <!-- Total / Users -->
      <svg
        v-else-if="icon === 'total'"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
      <!-- Active / Book/Learning -->
      <svg
        v-else-if="icon === 'active'"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
      <!-- Golden / Trophy -->
      <svg
        v-else-if="icon === 'golden'"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M8 21h8M12 17v4M7 4h10l1 7H6l1-7z"/>
        <path d="M7 4V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v1"/>
        <path d="M12 17a5 5 0 0 0 5-5c0-2-1-3-2-4h-6c-1 1-2 2-2 4a5 5 0 0 0 5 5z"/>
      </svg>
      <!-- Silver / Medal -->
      <svg
        v-else-if="icon === 'silver'"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="8" r="6"/>
        <path d="M12 14v6"/>
        <path d="M8 20h8"/>
        <path d="M9 11l2 2 4-4"/>
      </svg>
      <!-- Hefaza / Fursan - graduation cap -->
      <svg
        v-else
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    </div>
    <div class="kpi-stat-card__content">
      <div class="kpi-stat-card__value">
        <span v-if="loading" class="kpi-stat-card__skeleton">---</span>
        <span v-else>{{ value }}</span>
      </div>
      <div class="kpi-stat-card__label">{{ label }}</div>
      <div
        class="kpi-stat-card__tag"
        :style="{
          backgroundColor: tagColor?.background || 'var(--color-stat-green)',
          color: tagColor?.text || 'var(--color-primary)',
        }"
      >
        {{ tag }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.kpi-stat-card {
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

  &__icon {
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
    animation: kpiStatCardFloatIcon 3s ease-in-out infinite;
    transition: transform $transition-fast;

    &:hover {
      transform: scale(1.1) rotate(5deg);
      animation-play-state: paused;
    }

    svg {
      width: 24px;
      height: 24px;
      object-fit: contain;
      animation: kpiStatCardPulseIcon 2s ease-in-out infinite;
    }
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: $spacing-2;
    margin-top: $spacing-7;
  }

  &__value {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: var(--color-text-primary);
  }

  &__skeleton {
    color: var(--color-text-muted);
    animation: kpiStatCardPulse 1.5s ease-in-out infinite;
  }

  &__label {
    font-size: $font-size-sm;
    color: var(--color-text-secondary);
    font-weight: $font-weight-medium;
  }

  &__tag {
    display: inline-block;
    padding: $spacing-1 $spacing-3;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    align-self: flex-start;
  }
}

@keyframes kpiStatCardPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes kpiStatCardFloatIcon {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes kpiStatCardPulseIcon {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.9; }
}
</style>
