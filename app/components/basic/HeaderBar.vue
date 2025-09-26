<template>
  <header class="header">
    <h3>我的 Nuxt 项目</h3>
  </header>
</template>

<script setup></script>

<style scoped>
.header {
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  backdrop-filter: blur(5px);
  background-color: rgb(115, 103, 103);
  color: white;
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  font-weight: bold;
  z-index: 10;
  padding: 0 20px;
}
</style>
