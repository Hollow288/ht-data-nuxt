<template>
  <header class="header">
    <!-- 返回按钮 -->
      <button class="back-btn" @click="goBack" aria-label="返回">
        <i class="ri-arrow-left-line"></i>
      </button>

    <div style="margin-right: 30px">
      <h3>我的 Nuxt 项目</h3>
    </div>

  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
const goBack = () => {
  router.back()
}
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  backdrop-filter: blur(5px);
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  font-weight: bold;
  z-index: 10;
  justify-content: space-between; /* 左对齐返回按钮 */
}


/* 返回按钮 */
.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  background: transparent;
  border: none;
  cursor: pointer;
  margin-right: 1rem;
  transition: color 0.2s;
  margin-left: 30px;
}

.back-btn:hover {
  color: #4da6ff;
}



</style>
