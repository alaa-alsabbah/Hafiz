<script setup lang="ts">
export interface TabItem {
  id: string
  label: string
  value?: string | number | null
}

interface Props {
  modelValue: string | number | null
  tabs: TabItem[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
}>()

function getTabValue(tab: TabItem): string | number | null {
  return tab.value !== undefined ? tab.value : tab.id
}

function isActive(tab: TabItem): boolean {
  const tabVal = getTabValue(tab)
  return props.modelValue === tabVal || (props.modelValue == null && tabVal == null)
}

function selectTab(tab: TabItem) {
  emit('update:modelValue', getTabValue(tab))
}
</script>

<template>
  <div class="base-tabs">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      class="base-tabs__tab"
      :class="{ 'base-tabs__tab--active': isActive(tab) }"
      @click="selectTab(tab)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.base-tabs {
  display: inline-flex;
  background:rgba(244, 244, 244, 1);
  border-radius: $radius-lg;
  padding: 4px;
  box-shadow: $shadow-sm;
  gap: 0;
  min-width: 400px;
  width: 100%;
  max-width: 100%;

  @include sm-max {
    min-width: 0;
    width: 100%;
  }

  &__tab {
    padding: $spacing-2 $spacing-4;
    border: none;

    @include sm-max {
      padding: $spacing-2 $spacing-3;
      font-size: $font-size-xs;
    }
    background: transparent;
    color: var(--color-text-secondary);
    font-weight: $font-weight-medium;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: all $transition-fast;
    border-radius: $radius-md;
    flex: 1;

    &:first-child {
      border-top-right-radius: $radius-lg;
      border-bottom-right-radius: $radius-lg;
    }

    &:last-child {
      border-top-left-radius: $radius-lg;
      border-bottom-left-radius: $radius-lg;
    }

    &--active {
      background: linear-gradient(90deg, #009968 0%, #136047 100%);
      color: #fff;
    }

    &:not(&--active):hover {
      background: var(--color-background);
    }
  }
}
</style>
