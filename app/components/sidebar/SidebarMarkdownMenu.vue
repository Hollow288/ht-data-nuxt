<script setup lang="ts">
defineProps<{
  menuItems: { level: number; content: string; id: string }[]
}>()

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <div class="card-container-side">
    <div class="menu-wrapper">
      <ul>
        <li
            v-for="item in menuItems"
            :key="item.id"
            :style="{ marginLeft: (item.level - 1) * 12 + 'px' }"
            @click="scrollTo(item.id)"
        >
          {{ item.content }}
        </li>
      </ul>
    </div>

  </div>

</template>


<style scoped>


.menu-wrapper ul {
  background: transparent; /* 让 ul 背景透明 */
  margin: 0;
  padding: 0;
  list-style: none;
  max-height: 100%;

}

.menu-wrapper li {
  padding: 6px 8px;
  cursor: pointer;
  transition: background 0.2s;
  word-wrap: break-word;   /* 长单词/长字符串换行 */
  white-space: normal;     /* 允许换行 */
}

.menu-wrapper li:hover {
  background: rgba(0, 0, 0, 0.05); /* hover 时给点浅色背景 */
}


.menu-wrapper {
  overflow: auto; /* 保留滚动能力 */
  scrollbar-width: none; /* Firefox 隐藏滚动条 */
  -ms-overflow-style: none; /* IE 10+ 隐藏滚动条 */
  max-height: calc(100vh - 160px);
}

/* Chrome、Safari、Edge */
.menu-wrapper::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.card-container-side{
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.card-container-side:hover{
  transform: translateY(-4px); /* 稍微浮起来 */
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
}


.card-container-side{
  width: 100%;
  max-height: calc(100vh - 130px);  /* 给个基础高度 */
  min-height: calc(100vh - 130px);  /* 给个基础高度 */
  background: rgba(255, 255, 255, 0.9); /* 半透明白色 */
  /*border-radius: 16px;  圆角 */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); /* 阴影 */
  padding: 15px 20px;
  box-sizing: border-box;
  backdrop-filter: blur(8px); /* 毛玻璃效果，可选 */
}

</style>