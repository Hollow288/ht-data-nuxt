<template>
  <div v-if="store.active" class="progress-bar" :style="{ width: store.width + '%' }"></div>
</template>

<script setup lang="ts">
import { useProgressStore } from '~/stores/progress'
const store = useProgressStore()
</script>

<style scoped>
.progress-bar {
  height: 4px;
  position: fixed;
  top: 60px; /* Header 高度 */
  left: 0;
  z-index: 9999;
  width: 0;
  border-radius: 2px;
  background: linear-gradient(90deg, #a6c1ff, #4da6ff, #7db9ff);
  transition: width 0.2s ease;
  background-size: 200% 100%;
  animation: gradientMove 2s linear infinite;
}

@keyframes gradientMove {
  0% { background-position: 0% 0%; }
  100% { background-position: 100% 0%; }
}
</style>
