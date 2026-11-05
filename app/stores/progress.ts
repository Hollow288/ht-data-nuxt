import { defineStore } from 'pinia'
import { onScopeDispose, ref } from 'vue'

const SHOW_DELAY = 150
const FINISH_DELAY = 300

export const useProgressStore = defineStore('progress', () => {
    const width = ref(0)
    const active = ref(false)
    let timer: ReturnType<typeof setInterval> | undefined
    let showTimer: ReturnType<typeof setTimeout> | undefined
    let finishTimer: ReturnType<typeof setTimeout> | undefined
    const pendingRequests = ref(0)

    const start = () => {
        active.value = true
        width.value = 0
        clearInterval(timer)
        timer = setInterval(() => {
            // 模拟进度条缓慢增加
            if (width.value < 90) {
                width.value = Math.min(90, width.value + Math.random() * 3)
            }
        }, 100)
    }

    const finish = () => {
        clearInterval(timer)
        timer = undefined
        width.value = 100
        finishTimer = setTimeout(() => {
            finishTimer = undefined
            active.value = false
            width.value = 0
        }, FINISH_DELAY) // 等待完成动画后隐藏
    }

    // 对外统一方法：增加/减少请求计数
    const requestStart = () => {
        pendingRequests.value++
        if (pendingRequests.value !== 1 || import.meta.server) return

        // 新请求开始时取消上一次完成动画，避免旧定时器误关进度条。
        clearTimeout(finishTimer)
        finishTimer = undefined
        if (active.value) {
            start()
        } else {
            // 快速完成的请求不显示进度条，减少闪烁。
            showTimer = setTimeout(() => {
                showTimer = undefined
                start()
            }, SHOW_DELAY)
        }
    }

    const requestEnd = () => {
        if (pendingRequests.value === 0) return
        pendingRequests.value--
        if (pendingRequests.value === 0) {
            clearTimeout(showTimer)
            showTimer = undefined
            if (active.value) finish()
        }
    }

    onScopeDispose(() => {
        clearInterval(timer)
        clearTimeout(showTimer)
        clearTimeout(finishTimer)
    })

    return { width, active, pendingRequests, requestStart, requestEnd}
})
