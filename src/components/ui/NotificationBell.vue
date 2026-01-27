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
    <img src="@/assets/img/icons/Bell.svg" alt="Bell" class="notification-bell__icon" />
    <span v-if="hasNotification && count > 0" class="notification-bell__badge">{{ count > 99 ? '99+' : count }}</span>
  </button>
</template>

<style lang="scss" scoped>
.notification-bell {
  position: relative;
  background-color: var(--color-background-sidebar);
  border: none;
  padding: var(--spacing-2);
  border-radius: var(--radius-full);
  cursor: pointer;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  min-width: 40px;
  height: 40px;

  &:hover {
    opacity: 0.8;
  }

  &__icon {
    width: 18px;
    height: 18px;
    display: block;
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
