<template>
  <div class="card">这是卡片页面1</div>
</template>

<script setup></script>

<style scoped>
.card {
  position: relative;
  width: 100%;
  max-width: 600px;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28px;
  font-weight: bold;
  color: #3b5998;
  background: transparent;
}

/* 四角 L 形虚线 */
.card::before,
.card::after {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background:
    /* 左上角 L 形 */
      linear-gradient(to right, #3b5998 2px, transparent 0) top left no-repeat,
      linear-gradient(to bottom, #3b5998 2px, transparent 0) top left no-repeat,
        /* 右上角 L 形 */
      linear-gradient(to left, #3b5998 2px, transparent 0) top right no-repeat,
      linear-gradient(to bottom, #3b5998 2px, transparent 0) top right no-repeat,
        /* 左下角 L 形 */
      linear-gradient(to right, #3b5998 2px, transparent 0) bottom left no-repeat,
      linear-gradient(to top, #3b5998 2px, transparent 0) bottom left no-repeat,
        /* 右下角 L 形 */
      linear-gradient(to left, #3b5998 2px, transparent 0) bottom right no-repeat,
      linear-gradient(to top, #3b5998 2px, transparent 0) bottom right no-repeat;
  /* 横线长度 30px，竖线长度 30px */
  background-size: 30px 2px, 2px 30px;
}
</style>
