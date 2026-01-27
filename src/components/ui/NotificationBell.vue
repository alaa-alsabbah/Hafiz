<script setup lang="ts">
interface Props {
  count?: number
  hasNotification?: boolean
}

withDefaults(defineProps<Props>(), {
  count: 0,
  hasNotification: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick(event: MouseEvent) {
  emit('click', event)
}
</script>

<template>
  <button class="notification-bell" @click="handleClick" aria-label="الإشعارات">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 8A6 6 0 0 0 6 8C6 5.31371 8.68629 3 12 3C15.3137 3 18 5.31371 18 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10.5 21H13.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M15 18H9C7.89543 18 7 17.1046 7 16V13C7 12.4477 7.44772 12 8 12H16C16.5523 12 17 12.4477 17 13V16C17 17.1046 16.1046 18 15 18Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span v-if="hasNotification && count > 0" class="notification-bell__badge">{{ count > 99 ? '99+' : count }}</span>
  </button>
</template>

<style lang="scss" scoped>
.notification-bell {
  position: relative;
  background: none;
  border: none;
  padding: var(--spacing-2);
  cursor: pointer;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-fast);

  &:hover {
    color: var(--color-primary);
  }

  svg {
    width: 24px;
    height: 24px;
  }

  &__badge {
    position: absolute;
    top: 0;
    right: 0;
    background-color: var(--color-error);
    color: var(--color-text-inverse);
    font-size: 10px;
    font-weight: var(--font-weight-bold);
    padding: 2px 6px;
    border-radius: var(--radius-full);
    min-width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translate(25%, -25%);
  }
}
</style>
