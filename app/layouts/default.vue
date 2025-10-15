<template>
  <div class="layout">
    <HeaderBar/>
    <div class="body-wrapper">
      <Transition name="fade-scale" mode="out-in">
        <NuxtPage/>
      </Transition>
    </div>
    <FooterBar/>
    <FanMenu/>
    <PaintClickEffect />
    <ProgressBar />

    <!-- Loading 层始终在最上层 -->
    <div
        v-if="showLoading"
        class="loading-screen"
        :class="{ 'loading-hide': ready }"
        @transitionend="onTransitionEnd"
    >
      <div class="preloader">
        <!-- 太阳 -->
        <svg id="sun" viewBox="0 0 10 10">
          <g>
            <path fill="none" d="M6.942,3.876c-0.4-0.692-1.146-1.123-1.946-1.123c-0.392,0-0.779,0.104-1.121,0.301c-1.072,0.619-1.44,1.994-0.821,3.067C3.454,6.815,4.2,7.245,5,7.245c0.392,0,0.779-0.104,1.121-0.301C6.64,6.644,7.013,6.159,7.167,5.581C7.321,5,7.243,4.396,6.942,3.876z M6.88,5.505C6.745,6.007,6.423,6.427,5.973,6.688C5.676,6.858,5.34,6.948,5,6.948c-0.695,0-1.343-0.373-1.69-0.975C2.774,5.043,3.093,3.849,4.024,3.312C4.32,3.14,4.656,3.05,4.996,3.05c0.695,0,1.342,0.374,1.69,0.975C6.946,4.476,7.015,5,6.88,5.505z"></path>
            <path fill="none" d="M8.759,2.828C8.718,2.757,8.626,2.732,8.556,2.774L7.345,3.473c-0.07,0.041-0.094,0.132-0.053,0.202C7.319,3.723,7.368,3.75,7.419,3.75c0.025,0,0.053-0.007,0.074-0.02l1.211-0.699C8.774,2.989,8.8,2.899,8.759,2.828z"></path>
            <path fill="none" d="M1.238,7.171c0.027,0.047,0.077,0.074,0.128,0.074c0.025,0,0.051-0.008,0.074-0.02l1.211-0.699c0.071-0.041,0.095-0.133,0.054-0.203S2.574,6.228,2.503,6.269l-1.21,0.699C1.221,7.009,1.197,7.101,1.238,7.171z"></path>
            <path fill="none" d="M6.396,2.726c0.052,0,0.102-0.026,0.13-0.075l0.349-0.605C6.915,1.976,6.89,1.885,6.819,1.844c-0.07-0.042-0.162-0.017-0.202,0.054L6.269,2.503C6.228,2.574,6.251,2.666,6.322,2.706C6.346,2.719,6.371,2.726,6.396,2.726z"></path>
            <path fill="none" d="M3.472,7.347L3.123,7.952c-0.041,0.07-0.017,0.162,0.054,0.203C3.2,8.169,3.226,8.175,3.25,8.175c0.052,0,0.102-0.027,0.129-0.074l0.349-0.605c0.041-0.07,0.017-0.16-0.054-0.203C3.603,7.251,3.513,7.276,3.472,7.347z"></path>
            <path fill="none" d="M3.601,2.726c0.025,0,0.051-0.007,0.074-0.02C3.746,2.666,3.77,2.574,3.729,2.503l-0.35-0.604C3.338,1.828,3.248,1.804,3.177,1.844C3.106,1.886,3.082,1.976,3.123,2.047l0.35,0.604C3.5,2.7,3.549,2.726,3.601,2.726z"></path>
            <path fill="none" d="M6.321,7.292c-0.07,0.043-0.094,0.133-0.054,0.203l0.351,0.605c0.026,0.047,0.076,0.074,0.127,0.074c0.025,0,0.051-0.006,0.074-0.02c0.072-0.041,0.096-0.133,0.055-0.203l-0.35-0.605C6.483,7.276,6.393,7.253,6.321,7.292z"></path>
            <path fill="none" d="M2.202,5.146c0.082,0,0.149-0.065,0.149-0.147S2.284,4.851,2.202,4.851H1.503c-0.082,0-0.148,0.066-0.148,0.148s0.066,0.147,0.148,0.147H2.202z"></path>
            <path fill="none" d="M8.493,4.851H7.794c-0.082,0-0.148,0.066-0.148,0.148s0.066,0.147,0.148,0.147l0,0h0.699c0.082,0,0.148-0.065,0.148-0.147S8.575,4.851,8.493,4.851L8.493,4.851z"></path>
            <path fill="none" d="M5.146,2.203V0.805c0-0.082-0.066-0.148-0.148-0.148c-0.082,0-0.148,0.066-0.148,0.148v1.398c0,0.082,0.066,0.149,0.148,0.149C5.08,2.352,5.146,2.285,5.146,2.203z"></path>
            <path fill="none" d="M4.85,7.796v1.396c0,0.082,0.066,0.15,0.148,0.15c0.082,0,0.148-0.068,0.148-0.15V7.796c0-0.082-0.066-0.148-0.148-0.148C4.917,7.647,4.85,7.714,4.85,7.796z"></path>
            <path fill="none" d="M2.651,3.473L1.44,2.774C1.369,2.732,1.279,2.757,1.238,2.828C1.197,2.899,1.221,2.989,1.292,3.031l1.21,0.699c0.023,0.013,0.049,0.02,0.074,0.02c0.051,0,0.101-0.026,0.129-0.075C2.747,3.604,2.722,3.514,2.651,3.473z"></path>
            <path fill="none" d="M8.704,6.968L7.493,6.269c-0.07-0.041-0.162-0.016-0.201,0.055c-0.041,0.07-0.018,0.162,0.053,0.203l1.211,0.699c0.023,0.012,0.049,0.02,0.074,0.02c0.051,0,0.102-0.027,0.129-0.074C8.8,7.101,8.776,7.009,8.704,6.968z"></path>
          </g>
        </svg>

        <!-- 云 -->
        <svg id="cloud" viewBox="0 0 10 10">
          <path fill="none" d="M8.528,5.624H8.247c-0.085,0-0.156-0.068-0.156-0.154c0-0.694-0.563-1.257-1.257-1.257c-0.098,0-0.197,0.013-0.3,0.038C6.493,4.259,6.45,4.252,6.415,4.229C6.38,4.208,6.356,4.172,6.348,4.131C6.117,3.032,5.135,2.235,4.01,2.235c-1.252,0-2.297,0.979-2.379,2.23c-0.004,0.056-0.039,0.108-0.093,0.13C1.076,4.793,0.776,5.249,0.776,5.752c0,0.693,0.564,1.257,1.257,1.257h6.495c0.383,0,0.695-0.31,0.695-0.692S8.911,5.624,8.528,5.624z"></path>
        </svg>

        <!-- 雨 -->
        <div class="rain">
          <span class="drop" v-for="n in 10" :key="n"></span>
        </div>

        <!-- 文字提示 -->
        <div class="text">
          窗外细雨静待晴，只盼晴光破云来~
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import HeaderBar from '~/components/basic/HeaderBar.vue'
import FooterBar from '~/components/basic/FooterBar.vue'
import FanMenu from '~/components/basic/FanMenu.vue'
import { ref, onMounted, nextTick } from "vue"

const ready = ref(false)
const showLoading = ref(true)

onMounted(async () => {
  await nextTick()
  // 模拟关键数据加载
  // await $fetch('/api/initial-data')
  ready.value = true
})

function onTransitionEnd(e) {
  if (ready.value && e.target.classList.contains('loading-screen')) {
    showLoading.value = false // 动画结束后彻底移除 DOM
  }
}
</script>

<style scoped>
/* 原有 layout 样式保持不变 */
.layout { display:flex; flex-direction:column; min-height:100vh; }
.body-wrapper { box-sizing:border-box; background-color:transparent; width:100%; min-height:calc(100vh - 120px); }

/* fade-scale */
.fade-scale-enter-active, .fade-scale-leave-active { transition: all 0.3s ease; }
.fade-scale-enter-from, .fade-scale-leave-to { opacity:0; transform:scale(0.7); }
.fade-scale-enter-to, .fade-scale-leave-from { opacity:1; transform:scale(1); }

/* Loading 层样式 */
.loading-screen {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #9eb4ed;
  z-index: 9999;
  transition: opacity 0.5s ease;
  pointer-events: all;
  opacity: 1;
}
.loading-screen.loading-hide { opacity:0; pointer-events:none; }

/* Preloader */
.preloader {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

svg { width: 220px; height: 220px; }
#sun {
  width: 100px;
  height: 100px;
  position: absolute;
  left: 60px; /* 原来 45px */
  top: 20px;  /* 原来 15px */
  z-index: 1;
  animation: rotate 16s linear infinite;
  opacity: 1;
}

#cloud {
  width: 160px;
  height: 160px;
  position: relative;
  z-index: 2;
}
#cloud path { fill: #efefef; }
#sun path { fill: #e4a524; stroke-width: 0.18; }

@keyframes rotate { 0%{transform:rotate(0deg);} 100%{transform:rotate(360deg);} }

/* Rain */
.rain {
  position: absolute;
  width: 140px;  /* 原来 70px */
  height: 140px; /* 原来 70px */
  margin-top: -32px;  /* 原来 -32px */
  margin-left: 10px;  /* 原来 19px */
}
.drop {
  opacity: 1;
  background: #89accd;
  display: block;
  float: left;
  width: 4px;    /* 原来 3px */
  height: 15px;  /* 原来 10px */
  margin-left: 8px; /* 原来 4px */
  border-radius: 0 0 12px 12px; /* 原来 6px */
  animation-name: drop;
  animation-duration: 350ms;
  animation-iteration-count: infinite;
}
.drop:nth-child(1){ animation-delay:-130ms; }
.drop:nth-child(2){ animation-delay:-240ms; }
.drop:nth-child(3){ animation-delay:-390ms; }
.drop:nth-child(4){ animation-delay:-525ms; }
.drop:nth-child(5){ animation-delay:-640ms; }
.drop:nth-child(6){ animation-delay:-790ms; }
.drop:nth-child(7){ animation-delay:-900ms; }
.drop:nth-child(8){ animation-delay:-1050ms; }
.drop:nth-child(9){ animation-delay:-1130ms; }
.drop:nth-child(10){ animation-delay:-1300ms; }

@keyframes drop {
  50%{height:45px; opacity:0;}
  51%{opacity:0;}
  100%{height:1px; opacity:0;}
}

.text {
  letter-spacing: 1px;
  text-align: center;
  font-size: 18px;
  color: #ffffff;
  margin-top: 10px;
  margin-left: -60px;
  font-family: 'Noto Sans SC', serif;

  /* 改善字体清晰度 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;

  /* 不换行 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

</style>
