<script setup lang="ts">
</script>

<template>
  <div class="page-toolbar">
    <div class="page-toolbar__left">
      <slot name="tabs" />
    </div>
    <div class="page-toolbar__right">
      <div class="page-toolbar__filters">
        <slot name="filters" />
      </div>
      <div class="page-toolbar__search">
        <slot name="search" />
      </div>
      <div class="page-toolbar__actions">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: $spacing-4;
  margin-bottom: $spacing-4;

  @include sm-max {
    flex-direction: column;
    align-items: stretch;
    gap: $spacing-3;
  }

  &__left {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: $spacing-3;
    flex-wrap: wrap;
    flex: 1;
    min-width: 0;

    @include sm-max {
      flex-direction: column;
      align-items: stretch;
    }
  }

  &__filters {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    flex-wrap: wrap;
  }

  &__search {
    flex: 1;
    min-width: 200px;

    @include sm-max {
      min-width: 0;
      width: 100%;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }
}
</style>
