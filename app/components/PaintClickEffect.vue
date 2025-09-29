<template>
  <canvas ref="canvas" class="paint-canvas"></canvas>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

const canvas = ref<HTMLCanvasElement>()

let particles: Particle[] = []
let animationId: number

function random(min: number, max: number) {
  return Math.random() * (max - min) + min
}

class Particle {
  x: number
  y: number
  size: number
  color: string
  vx: number
  vy: number
  alpha: number
  constructor(x: number, y: number) {
    this.x = x
    this.y = y
    this.size = random(2, 6)
    this.color = `hsl(${random(0,360)}, 80%, 60%)`
    this.vx = random(-2.5, 2.5)
    this.vy = random(-2.5, 2.5)
    this.alpha = 1
  }
  update() {
    this.x += this.vx
    this.y += this.vy
    this.alpha -= 0.02
    this.size *= 0.97
  }
  draw(ctx: CanvasRenderingContext2D) {
    if (this.alpha <= 0) return
    ctx.globalAlpha = this.alpha
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }
}

onMounted(() => {
  if (!canvas.value) return
  const ctx = canvas.value.getContext('2d')!

  // 设置 canvas 尺寸
  const resizeCanvas = () => {
    canvas.value!.width = window.innerWidth
    canvas.value!.height = window.innerHeight
  }
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  // 点击生成粒子
  const clickHandler = (e: MouseEvent) => {
    for (let i = 0; i < 30; i++) {
      particles.push(new Particle(e.clientX, e.clientY))
    }
  }
  document.addEventListener('click', clickHandler)

  // 动画循环
  const animate = () => {
    ctx.clearRect(0, 0, canvas.value!.width, canvas.value!.height)
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.update()
      p.draw(ctx)
      if (p.alpha <= 0) particles.splice(i, 1)
    }
    animationId = requestAnimationFrame(animate)
  }
  animate()

  // 清理
  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeCanvas)
    document.removeEventListener('click', clickHandler)
    cancelAnimationFrame(animationId)
  })
})
</script>

<style scoped>
.paint-canvas {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  pointer-events: none; /* 不阻止鼠标事件 */
}
</style>
