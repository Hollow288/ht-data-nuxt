<template>
  <div class="page-layout">
    <!-- 左侧栏 -->
    <aside class="left-sidebar">
      <div class="muck-up">
        <div class="overlay"></div>
        <div class="top">
          <div class="nav">
            <span class="ion-android-menu"></span>
            <p>Hotta</p>
            <span class="ion-ios-more-outline"></span>
          </div>
          <div class="user-profile">
            <img src="/favicon.ico">
            <div class="user-details">
              <h4>Tower of Fantasy</h4>
              <p>github.com/Hollow288</p>
            </div>
          </div>
        </div>
        <div class="bottom">
          <div class="title">
            <h3>MENU</h3>
            <small>Updated: 8,2025</small>
          </div>
          <ul class="tasks">
            <li class="one red">
              <span class="task-title">Make New Icon</span>
              <span class="task-cat">Web App</span>

            </li>
            <li class="one red">
              <span class="task-title">Catch up with Brian</span>
              <span class="task-cat">Mobile Project</span>

            </li>
            <li class="two green">
              <span class="task-title">Design Explorations</span>
              <span class="task-cat">Company Web site</span>

            </li>
            <li class="tow green">
              <span class="task-title">Team Meeting</span>
              <span class="task-cat">Hangouts</span>
            </li>


          </ul>
        </div>
      </div>
    </aside>


    <div class="card-container" v-if="loading">
      <div v-if="loading" class="loading">{{'加载中...'}}</div>
    </div>
    <div v-else class="cards-grid">

    </div>

  </div>
</template>

<script setup lang="ts">

const loading = ref(true)




</script>

<style scoped lang="scss">


.page-layout {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 20px;
  flex-direction: row;
}


.card-item {
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(6px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  padding: 12px 15px;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  }

  .title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.25rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;

    &::before {
      content: "";
      display: inline-block;
      width: 5px;
      height: 1.25em;
      background: #6e4040;
    }
  }

  .summary {
    font-size: 1rem;
    color: #666;
    margin: 30px 0;
  }

  .date {
    font-size: 0.9rem;
    color: #999;
    margin: 20px 0 10px;
    display: flex;
    align-items: center;

    i{
      font-size: 1.5rem;
      margin-right: 10px;
    }

  }
}

.left-sidebar {
  flex: 0 0 25%;
  min-height: calc(100vh - 140px);
  min-width: 180px;
  max-width: 300px;
  box-sizing: border-box;
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 140px);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: auto;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
  }

}

.cards-grid {
  width: clamp(300px, 60%, 1000px);
  margin-bottom: -20px;
}

.card-container {
  min-height: calc(100vh - 140px);
  overflow-y: auto;
  // clamp(最小值, 理想值, 最大值)
  width: clamp(300px, 60%, 1000px);

  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
  }


  .loading, .empty {
    text-align: center;
    color: #999;
    margin-top: 50px;
    font-size: 1rem;
  }

}

.muck-up {
  position: relative;
  overflow: hidden;
  height: 100%;
}

.overlay {
  background: url() no-repeat top /contain;
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}

.overlay:after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(71, 32, 84, 0.5);
}

.muck-up > .top {
  position: relative;
  min-height: 240px;
  padding: 15px;
  color: #fff;
}

.top .nav span {
  float: left;
  display: block;
}

.nav p {
  margin-top: 2px;
  display: inline-block;
  vertical-align: bottom;
}

.ion-android-menu {
  font-size: 24px;
  margin-right: 17px;
}

.nav .ion-ios-more-outline {
  font-size: 38px;
  float: right !important;
}

.user-profile {
  margin-left: 10px;
}

.user-profile img {
  height: 45px;
  width: 45px;
  border-radius: 50%;
  float: left;
  margin-right: 24px;
  margin-top: 24px;
}

.user-details p {
  font-size: 11px;
}

.user-details {
  float: left;
  margin-top: 5px;
  vertical-align: bottom;
}

.user-details h4 {
  font-size: 18px;
}


.muck-up .bottom {
  background-color: #fff;
  height: 100%;
  z-index: 1;
  padding: 0 0 35px 0;
  position: relative;
  color: #222;
}

.bottom:after {
  content: '';
  position: absolute;
  top: -46px;
  background: #fff;
  left: -22px;
  right: 0;
  height: 100px;
  transform: rotate(10deg);
  width: 337px;
  z-index: -1;
}


.bottom .title h3 {
  font-size: 22px;
  margin-bottom: 5px;
  margin-left: 35px;
}

.title small {
  font-size: 10px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-left: 35px;
}

ul.tasks .task-title {
  font-size: 13px;
  display: inline-block;
}

ul.tasks .task-time {
  float: right;
  font-size: 10px;
  color: #888;
}

ul.tasks .task-cat {
  font-size: 10px;
  display: block;
  color: #888;
}

ul.tasks li {
  padding: 8px 35px;
  position: relative;
  z-index: 8;
}

.bottom .tasks li {
  cursor: pointer; /* 鼠标变成手型，表示可点击 */
  transition: background 0.3s; /* 平滑过渡 */
}

.bottom .tasks li:hover {
  background-color: rgba(128, 128, 128, 0.1); /* 半透明灰色 */
}

ul.tasks li:after {
  content: '';
  position: absolute;
  left: 17px;
  top: 24px;
  height: 8px;
  width: 8px;
  border-radius: 50%;
}

ul.tasks li.red:after {
  background: #FF3163;
}

ul.tasks li.green:after {
  background: #54D6C7;
}

ul.tasks li.yellow:after {
  background: #EAB429;
}

ul.tasks::after {

  content: '';
  position: absolute;
  height: 100%;
  width: 1px;
  background: #eee;
  left: 20px;
  top: -68px;
}

ul li.hang {
  margin-bottom: 48px;
}

ul li.hang img {
  float: left;
  height: 20ox;
  width: 20px;
  border-radius: 50%;
  margin-right: 8px;
}


.bottom ul, ol {
  list-style: none;
  padding-left: 0;
  margin-left: 0;
}



</style>
