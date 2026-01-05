<template>
  <div class="container">
    <aside class="sidebar">
      <div class="avatar-wrap">
        <img src="https://avatars.githubusercontent.com/u/87030922?v=4" alt="头像" class="avatar"/>
      </div>

      <div class="info-card">
        <span class="username with-line">Hollow</span>
        <span class="briefly">我本微末凡尘，但也心向天空</span>
        <div class="icons">
          <div class="icon-button">
            <i class="ri-github-fill"></i>
          </div>
          <div class="icon-button">
            <i class="ri-bilibili-fill"></i>
          </div>
        </div>
      </div>
    </aside>

    <main class="main-content">
      <div class="right-card">
        <span class="me-title"><img style="max-width: 100%; height: auto;"
                                    src="https://readme-typing-svg.demolab.com?font=Fira+Code&duration=4000&pause=200&vCenter=true&width=435&height=25&lines=Hi+there+%F0%9F%91%8B;and+welcome+to+this+website."
            alt="Typing SVG"/></span>
        <div style="display: flex;flex-direction: column;">
          <div>
            <ul>
              <li>🌱 Okooo</li>
              <li>☀️ Okooo</li>
              <li>🍂 OkoooOkoooOkooo</li>
              <li>⛄ OkoooOkoooOkoooOkoooOkooo</li>
            </ul>
          </div>

          <div>
            <span style="font-family: 'Noto-Sans-SC',sans-serif">&nbsp;&nbsp;在遥远的明天，月亮不再只是月亮，它开始学会呼吸。每当星辰低语，河水便想起自己曾经是一颗漂浮的沙粒，沙粒又记得自己其实是夜空里一片懒惰的云。于是风走到了屋顶，却发现屋顶早已经离开了地面，去和一群失眠的影子下棋。城市的路灯慢慢长出了翅膀，它们在夜里追赶自己的影子，影子却总是跑到昨天去睡觉。
              人们穿着时间做成的外套，却忘了扣扣子，因为扣子本身早已经逃到了平行世界的冰箱里。每一次呼吸都是一次穿越，每一次眨眼都是一次哲学讲座。猫会说笑话，笑话会写小说，小说又会跑去告诉鱼，鱼则开始思考人生是不是该换一个水池。当你试图理解这一切的时候，一片透明的雨落在书页上，书页却悄悄溶解成气体，飘向遥远的星球，告诉那里的居民：“你们的逻辑太过整齐了，我们不接受整齐。”于是，世界继续旋转，旋转的同时开始学习数学，但数学发现自己其实不懂自己，于是决定放假，去海边和时间玩扑克。这只是用来测试的一段话。</span>
          </div>
        </div>
      </div>
      <div class="right-card">
        <span class="con-title" v-if="imgLoaded">Github Contributions:</span>
        <n-skeleton round v-if="!imgLoaded" :style="{ height: '20px', width: '160px', borderRadius : '10px' }"/>
        <div style="margin-top: 15px;">
          <n-skeleton round v-if="!imgLoaded" :style="{ height: '140px', width: '100%', borderRadius : '10px' }"/>

          <!-- 图片加载完后显示 -->
          <div style="overflow-x: auto; width: 100%;">
            <div style="display: flex; justify-content: center; min-width: max-content;">
              <img v-show="imgLoaded" :src="imgSrc" alt="GitHub Contributions" @load="onLoad"/>
            </div>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import {NSkeleton} from "naive-ui";

const imgSrc = 'https://ghchart.rshah.org/Hollow288'
const imgLoaded = ref(false)

function onLoad() {
  imgLoaded.value = true
}


</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
}


/* 左侧栏 */
.sidebar {
  width: 300px;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  margin-right: 25px;
  border-radius: 10px;
  padding: 0;
  box-sizing: border-box;
  background: var(--bg-card);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4); /* 阴影效果 */
  overflow: auto;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

}

.username.with-line::after {
  content: "";
  display: block;
  width: 60px;
  height: 3px;
  margin: 2px auto 0;
  border-radius: 3px;
  font-weight: 900;
  background: linear-gradient(
      90deg,
      #9eb4ed 0%,
      #9eb4ed 30%,
      #e19eba 30%,
      #e19eba 100%
  );
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 8px;
}

.username {
  font-size: 24px;
  line-height: 1.25;
  font-family: "Sour Gummy", sans-serif;
}

.info {
  color: #666;
  margin-bottom: 5px;
  text-align: center;
}


.main-content {
  flex: 1;
  max-width: 800px;
  min-width: 0;
}


.info-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 10px;
}

.avatar-wrap {
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  display: block;
  border-radius: 10px;
}

.icons {
  font-size: 30px;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}


.briefly {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  justify-content: center;
  padding: 20px;
  color: var(--text-main);
  font-size: 14px;
}


.icon-button {
  display: inline-block;
  background-color: #f0f0f0;
  border-radius: 8px;
  transition: transform 0.3s ease, background-color 0.3s ease;
  cursor: pointer;
  line-height: 1;
}

.icon-button:hover {
  background-color: #dcdcdc;
  transform: translateY(-4px);
}

.icon-button i {
  font-size: 30px;
  color: #333;
  transition: color 0.3s ease;
}

.icon-button:hover i {
  color: #9eb4ed;
}

.right-card {
  background: var(--bg-card);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  border-radius: 10px;
  padding: 20px 20px 30px 20px;
  margin-bottom: 25px;

  .con-title {
    font-weight: bold;
    position: relative;
    padding-left: 12px;
  }

  .con-title::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 4px;
    height: 100%;
    background-color: #9eb4ed;
    border-radius: 2px;
  }

  .me-title {
    font-weight: bold;
    position: relative;
    padding-left: 12px;
  }

  .me-title::before {
    content: "";
    position: absolute;
    left: 0;
    top: -9px;
    width: 4px;
    height: 100%;
    background-color: #9eb4ed;
    border-radius: 2px;
  }

}

.main-content ::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 6px;
}

.main-content ::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 6px;
}


.main-content ::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}


.main-content ::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

@media screen and (max-width: 768px) {
  /* 1. 容器改为纵向排列，减少内边距 */
  .container {
    flex-direction: column;
    padding: 20px 15px;
  }

  /* 2. 侧边栏调整 */
  .sidebar {
    width: 100%; /* 宽度撑满 */
    margin-right: 0; /* 去除右侧间距 */
    margin-bottom: 20px; /* 改为底部间距 */
    height: auto; /* 高度自动，取消可能的内部滚动 */
    overflow: visible; /* 允许内容撑开 */
  }

  /* 如果觉得手机上头像太大，可以限制一下侧边栏内部图片的最大高度/宽度，或者保持原样 */
  /* 可选：让侧边栏在手机上看起来更紧凑
  .avatar-wrap {
    padding: 15px;
  }
  */

  /* 3.主要内容区域调整 */
  .main-content {
    width: 100%;
    max-width: 100%;
  }

  /* 4. 右侧卡片调整 */
  .right-card {
    padding: 15px; /* 稍微减小内边距 */
  }

  /* 5. 调整字体大小（可选，防止标题在小手机换行太丑） */
  .username {
    font-size: 20px;
  }

  /* 修复 Skeleton 骨架屏在移动端的宽度 */
  .n-skeleton {
    max-width: 100% !important;
  }
}
</style>
