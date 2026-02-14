<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

export interface ActionMenuItem {
  id: string
  label: string
  icon?: 'eye' | 'user-plus' | 'email' | 'whatsapp' | 'custom'
  onClick: () => void
}

interface Props {
  items: ActionMenuItem[]
}

defineProps<Props>()

const isOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

function toggle() {
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

function handleItemClick(item: ActionMenuItem) {
  item.onClick()
  close()
}

function handleClickOutside(event: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="menuRef" class="action-menu">
    <button
      type="button"
      class="action-menu__trigger"
      aria-label="إجراءات"
      @click.stop="toggle"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="6" r="1.5" fill="currentColor" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        <circle cx="12" cy="18" r="1.5" fill="currentColor" />
      </svg>
    </button>

    <Transition name="dropdown">
      <div v-if="isOpen" class="action-menu__dropdown">
        <button
          v-for="item in items"
          :key="item.id"
          type="button"
          class="action-menu__item"
          @click.stop="handleItemClick(item)"
        >
          <span v-if="item.icon === 'eye'" class="action-menu__icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </span>
          <span v-else-if="item.icon === 'user-plus'" class="action-menu__icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </span>
          <span v-else-if="item.icon === 'email'" class="action-menu__icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </span>
          <span v-else-if="item.icon === 'whatsapp'" class="action-menu__icon action-menu__icon--whatsapp">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </span>
          <span class="action-menu__label">{{ item.label }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.action-menu {
  position: relative;
  display: inline-flex;

  &__trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    border-radius: $radius-md;
    cursor: pointer;
    color: var(--color-text-secondary);
    transition: all $transition-fast;

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
      color: var(--color-text-primary);
    }
  }

  &__dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: $spacing-1;
    min-width: 180px;
    background: #fff;
    border-radius: $radius-lg;
    box-shadow: $shadow-lg;
    border: 1px solid var(--color-border);
    padding: $spacing-2;
    z-index: 100;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    width: 100%;
    padding: $spacing-2 $spacing-3;
    border: none;
    background: transparent;
    border-radius: $radius-md;
    cursor: pointer;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: var(--color-text-primary);
    text-align: right;
    transition: all $transition-fast;

    &:hover {
      background-color: var(--color-primary-lighter);
      color: var(--color-primary);
    }
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--color-text-secondary);

    &--whatsapp {
      color: #25D366;
    }
  }

  &__label {
    flex: 1;
  }
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity $transition-fast, transform $transition-fast;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
