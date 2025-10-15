<template>
  <header class="header">
      <nav>
        <ul class="main-menu">
          <li><a href="#section-2">Index</a></li>
          <li><a href="#section-5">Blog</a></li>
          <li><a href="#section-7">Work</a></li>
          <li><a href="#section-9">Blog</a></li>
          <li><a href="#main-footer">Contact</a></li>
        </ul>
      </nav>
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
  top: -60px;
  left: 0;
  width: 100%;
  height: 60px;
  backdrop-filter: blur(5px);
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  display: flex;
  align-items: center;
  font-size: 1rem;
  z-index: 10;
  justify-content: center;
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


.main-menu {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
}

.main-menu li {
  display: inline-block;
  padding: 0.75em 1.875em;
}

.main-menu li a {
  text-transform: uppercase;
  font-size: 0.875em;
  text-decoration: none;
  padding-bottom: 0.75em;
  transition: color 0.2s, border-bottom 0.2s;
}

.main-menu li a:hover {
  color: #fce38a;
  border-bottom: 0.1875em solid #fce38a;
}

.main-menu li a span {
  font-size: 1.2em;
}


</style>
