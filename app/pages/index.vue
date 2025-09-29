<template>
</template>

<script setup lang="ts">

</script>

<style scoped>

.card-container {
  width: 100%;
  background: rgba(255, 255, 255, 0.9); /* 半透明白色 */
  /*border-radius: 16px;  圆角 */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); /* 阴影 */
  padding: 15px 20px;
  box-sizing: border-box;
  backdrop-filter: blur(8px); /* 毛玻璃效果，可选 */
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}


.card-container:hover {
  transform: translateY(-4px); /* 稍微浮起来 */
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
}
</style>
