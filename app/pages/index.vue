<template>
  <div class="card">内容 A</div>
</template>

<script setup></script>

<style scoped>
.card {
  position: relative;
  width: 100%;

  height: 4000px;
  max-width: 600px;

  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28px;
  font-weight: bold;
  color: #2c3e50;
  background: transparent;
}

/* 四角直角标记 */
.card::before,
.card::after {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background:
      linear-gradient(to right, #2c3e50 4px, transparent 0) top left no-repeat,
      linear-gradient(to bottom, #2c3e50 4px, transparent 0) top left no-repeat,
      linear-gradient(to left, #2c3e50 4px, transparent 0) top right no-repeat,
      linear-gradient(to bottom, #2c3e50 4px, transparent 0) top right no-repeat,
      linear-gradient(to right, #2c3e50 4px, transparent 0) bottom left no-repeat,
      linear-gradient(to top, #2c3e50 4px, transparent 0) bottom left no-repeat,
      linear-gradient(to left, #2c3e50 4px, transparent 0) bottom right no-repeat,
      linear-gradient(to top, #2c3e50 4px, transparent 0) bottom right no-repeat;
  background-size: 20px 4px, 4px 20px;
}
</style>
