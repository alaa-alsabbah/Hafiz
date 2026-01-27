<script setup lang="ts">
interface Props {
  value: number | string
  label: string
  tag: string
  tagColor?: {
    background: string
    text: string
  }
  loading?: boolean
  index?: number
}

withDefaults(defineProps<Props>(), {
  loading: false,
  index: 0
})
</script>

<template>
  <div class="stat-card" :class="`stat-card--${index}`">
    <div class="stat-card__content">
      <div class="stat-card__value">
        <span v-if="loading" class="stat-card__skeleton">---</span>
        <span v-else>{{ value }}</span>
      </div>
      <div class="stat-card__label">{{ label }}</div>
    </div>
    <div 
      class="stat-card__tag"
      :style="{
        backgroundColor: tagColor?.background || 'var(--color-stat-green)',
        color: tagColor?.text || 'var(--color-primary)'
      }"
    >
      {{ tag }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.stat-card {
  background-color: var(--color-background-card);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: visible;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 140px;

  &__content {
    flex: 1;
  }

  &__value {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-2);
    line-height: 1.2;
  }

  &__skeleton {
    color: var(--color-text-muted);
    animation: pulse 1.5s ease-in-out infinite;
  }

  &__label {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium);
  }

  &__tag {
    display: inline-block;
    padding: var(--spacing-1) var(--spacing-3);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    margin-top: var(--spacing-3);
    align-self: flex-start;
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
</style>
