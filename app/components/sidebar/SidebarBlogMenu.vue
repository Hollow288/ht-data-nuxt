<script setup lang="ts">
defineProps<{

}>()

import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 模拟 API 数据
const dateList = [
  { date: '2025-09-12', count: 5 },
  { date: '2025-09-05', count: 2 },
  { date: '2024-12-30', count: 1 },
  { date: '2024-08-01', count: 4 },
  { date: '2024-08-01', count: 4 },
  { date: '2024-08-01', count: 4 },
  { date: '2024-08-01', count: 4 },
  { date: '2024-08-01', count: 4 },
  { date: '2024-08-01', count: 4 },
  { date: '2024-08-01', count: 4 },
  { date: '2024-08-01', count: 4 },
  { date: '2024-08-01', count: 4 },
  { date: '2024-08-01', count: 4 },
  { date: '2024-08-01', count: 4 },
  { date: '2024-08-01', count: 4 },
  { date: '2024-08-01', count: 4 },
  { date: '2024-08-01', count: 4 },
  { date: '2024-08-01', count: 4 },
  { date: '2024-08-01', count: 4 },
  { date: '2024-08-01', count: 4 },
  { date: '2024-08-01', count: 4 },
  { date: '2024-08-01', count: 4 },
  { date: '2024-08-01', count: 4 },
  { date: '2024-08-01', count: 4 },
  { date: '2024-08-01', count: 4 }
]

// 把日期按年份分组
const groupedDates = dateList.reduce((acc, item) => {
  const year = item.date.split('-')[0]
  if (!acc[year]) acc[year] = []
  acc[year].push(item)
  return acc
}, {} as Record<string, { date: string, count: number }[]>)

const activeDate = ref('')
const expandedYears = ref<string[]>([]) // 记录展开的年份

// 点击某一天
const selectDate = (date: string) => {
  activeDate.value = date
  router.push({ path: '/blog-page', query: { date } })
}

// 切换展开年份
const toggleYear = (year: string) => {
  if (expandedYears.value.includes(year)) {
    expandedYears.value = expandedYears.value.filter(y => y !== year)
  } else {
    expandedYears.value.push(year)
  }
}
</script>

<template>
  <div class="card-container-side">
    <div class="menu-wrapper">
      <ul>
        <li v-for="(items, year) in groupedDates" :key="year" class="year-group">
          <div class="year-header" @click="toggleYear(year)">
            <span>{{ year }}</span>
            <span class="arrow" :class="{ expanded: expandedYears.includes(year) }">▶</span>
          </div>

          <ul v-show="expandedYears.includes(year)" class="date-list">
            <li v-for="item in items" :key="item.date"
                :class="{ active: activeDate === item.date }"
                @click="selectDate(item.date)">
              {{ item.date }} <span class="count">({{ item.count }})</span>
            </li>
          </ul>
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


.menu-wrapper ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.year-group {
  margin-bottom: 12px;
}

/* 年份头 */
.year-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  font-weight: 600;
  color: #333;
  background: #f7f7f7;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.25s;
}
.year-header:hover {
  background: #eaeaea;
}

.arrow {
  font-size: 0.9em;
  transition: transform 0.3s;
}
.arrow.expanded {
  transform: rotate(90deg);
}

/* 日期列表 */
.date-list {
  margin-top: 6px;
  padding-left: 8px;
  border-left: 2px solid #eaeaea;
}

.date-list li {
  display: flex;
  justify-content: space-between;
  padding: 6px 8px;
  font-size: 0.9em;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  color: #555;
}
.date-list li:hover {
  background: rgba(0, 123, 255, 0.05);
  color: #007bff;
}
.date-list li.active {
  background: rgba(0, 123, 255, 0.1);
  font-weight: 600;
  color: #007bff;
  position: relative;
}
.date-list li.active::before {
  content: "";
  position: absolute;
  left: -8px;
  top: 4px;
  bottom: 4px;
  width: 3px;
  background: #007bff;
  border-radius: 2px;
}

/* 文章数量 */
.count {
  font-size: 0.8em;
  color: #888;
}

</style>