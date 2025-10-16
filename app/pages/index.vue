<template>
  <aside class="left-sidebar">
    <div class="right-main">
      <div class="container">
        <header class="header">
          <h4 class="title">Search</h4>
          <small class="subtitle">Search by name and/or type</small>
          <div class="input-wrapper">

            <n-popover
                trigger="click"
                placement="bottom"
                :arrow-style="{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }"
                style="max-width: 200px; background-color: rgba(255, 255, 255, 0.5); padding: 10px; box-sizing: border-box;padding:0"
            >
              <template #trigger>
                <i class="ri-filter-3-line"></i>
              </template>

              <template #header >
                <n-text strong depth="1">Type filter</n-text>
              </template>

              <!-- Rarity 组 -->
              <div class="filter-group">
                <p>Rarity:</p>
                <div class="button-group">
                  <NButton type="primary" size="tiny">SSR</NButton>
                  <NButton dashed size="tiny">SR</NButton>
                </div>
              </div>

              <!-- Type 组 -->
              <div class="filter-group">
                <p>Type:</p>
                <div class="button-group">
                  <NButton type="primary" size="tiny">A</NButton>
                  <NButton dashed size="tiny">B</NButton>
                  <NButton dashed size="tiny">C</NButton>
                </div>
              </div>
            </n-popover>
            <input type="text" name="filter" id="filter" placeholder="Search" />
          </div>
        </header>
        <ul id="result" class="user-list">
          <li><h3>Loading...</h3></li>
        </ul>
      </div>
    </div>



  </aside>
</template>

<script setup lang="ts">
import { NPopover,NText,NButton } from 'naive-ui'
</script>

<style scoped>

.left-sidebar {
  flex: 0 0 25%;
  min-height: calc(100vh - 160px);
  min-width: 180px;
  max-width: 300px;
  box-sizing: border-box;
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 160px);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  user-select: none;
  cursor: default;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
  }
}



.right-main{
  display: flex;
  flex-direction: column;
  height: 100%;
}





.title {
  margin: 0;
}

.subtitle {
  display: inline-block;
  margin: 5px 0 20px;
  opacity: 0.8;
}

.header {
  background-color: #9E8BA8;
  color: #fff;
  padding: 30px 20px;
}

.header input {
  background-color: rgba(0, 0, 0, 0.3);
  border: 0;
  border-radius: 50px;
  color: #fff;
  font-size: 14px;
  padding: 10px 15px;
  width: 100%;
}

.header input:focus {
  outline: none;
}

.user-list {
  background-color: #fff;
  list-style-type: none;
  margin: 0;
  padding: 0;
  max-height: 400px;
  overflow-y: auto;
}

.user-list li {
  display: flex;
  padding: 20px;
}

.user-list img {
  border-radius: 50%;
  object-fit: cover;
  height: 50px;
  width: 50px;
}

.user-list .user-info {
  margin-left: 10px;
}

.user-list .user-info h4 {
  margin: 0 0 10px;
}

.user-list .user-info p {
  font-size: 12px;
}

.user-list li:not(:last-of-type) {
  border-bottom: 1px solid #eee;
}

.user-list li.hide {
  display: none;
}

.input-wrapper {
  position: relative;
  width: 100%;
}

.input-wrapper i {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.7);
  font-size: 18px;
}

.input-wrapper i :hover {
  color: white;
}


.filter-group {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
  gap: 8px;
}


.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  flex: 1;
}


.filter-group p {
  width: 60px;
  margin: 0;
  line-height: 24px;
  font-weight: 500;
}

</style>
