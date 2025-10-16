<template>
  <footer class="footer">
    <div>
      <a href="https://beian.miit.gov.cn" target="_blank">京ICP备2025142794号</a>
      <span>|</span>
      <a href="https://github.com/hollow288" target="_blank">
        <svg height="16" width="16" viewBox="0 0 16 16">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.01.08-2.11 0 0 .67-.21 2.2.82a7.62 7.62 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.91.08 2.11.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        GitHub
      </a>
    </div>
  </footer>
</template>

<script setup></script>

<style scoped>

/* Footer 固定 */
.footer {
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  backdrop-filter: blur(5px);
  background-color: rgba(255, 255, 255, 0.1);
  text-align: center;
  font-size: 0.8rem;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  flex-shrink: 0;
}

.footer div {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #272222;
}

.footer a {
  color: inherit;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: color 0.3s;
}

.footer a:hover {
  color: #4da6ff;
}

.footer span {
  color: #514848;
}

.footer svg {
  fill: currentColor;
}
</style>