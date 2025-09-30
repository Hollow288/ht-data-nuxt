import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useProgressStore = defineStore('progress', () => {
    const width = ref(0)
    const active = ref(false)
    let timer: number | null = null
    let requestCount = 0

    const start = () => {
        if (active.value) return
        active.value = true
        width.value = 0
        if (timer) clearInterval(timer)
        timer = window.setInterval(() => {
            // 模拟进度条缓慢增加
            if (width.value < 90) {
                width.value += Math.random() * 3
            }
        }, 100)
    }

    const finish = () => {
        if (timer) clearInterval(timer)
        width.value = 100
        setTimeout(() => {
            active.value = false
            width.value = 0
        }, 300) // 保证最少显示时间
    }

    // 对外统一方法：增加/减少请求计数
    const requestStart = () => {
        requestCount++
        if (requestCount === 1) start()
    }

    const requestEnd = () => {
        requestCount--
        if (requestCount <= 0) {
            requestCount = 0
            finish()
        }
    }

    return { width, active, requestStart, requestEnd}
})
