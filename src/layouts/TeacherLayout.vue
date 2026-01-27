<script setup lang="ts">
</script>

<template>
  <div class="teacher-layout">
    <main class="teacher-layout__content">
      <slot />
    </main>
  </div>
</template>

<style lang="scss" scoped>
.teacher-layout {
  min-height: 100vh;
  width: 100%;
  max-width: 100vw;
  background-color: var(--color-background);
  display: flex;
  flex-direction: column;
}

.teacher-layout__content {
  flex: 1;
  width: 100%;
  max-width: 100%;
  padding: $spacing-6;
  overflow-x: hidden;
}
</style>

