<template>
  <header class="header">
      <button class="back-btn" @click="goBack" aria-label="返回">
        <i class="ri-arrow-left-line"></i>
      </button>
      <nav>
        <ul class="main-menu">
          <li>
            <NuxtLink to="/" active-class="active-link">Index</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/blog-page" active-class="active-link">Blog</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/hotta-page" active-class="active-link">Hotta</NuxtLink>
          </li>
        </ul>

      </nav>
    <div class="title">
      1234
    </div>
    <ProgressBar />
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
  justify-content: space-between;
  user-select: none;
  cursor: default;
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
  transition: color 0.2s;
  position: relative;
  color: white;
  cursor: pointer;
}


.main-menu li a::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 0.1875em;
  background-color: #4da6ff;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.3s ease;
}


.main-menu li a:hover {
  color: #4da6ff;
}

.main-menu li a:hover::after {
  transform: scaleX(1);
}

.main-menu li a span {
  font-size: 1.2em;
}

.title{
  font-size: 25px;
  font-weight: bold;
  margin-right: 15px;
}


.main-menu li a.active-link {
  color: #4da6ff;
}


</style>
