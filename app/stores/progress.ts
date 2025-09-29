import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useProgressStore = defineStore('progress', () => {
    const width = ref(0)
    const active = ref(false)
    let timer: number | null = null

    const start = () => {
        active.value = true
        width.value = 0
        if (timer) clearInterval(timer)
        timer = setInterval(() => {
            if (width.value < 90) {
                width.value += Math.random() * 5
            }
        }, 100)
    }

    const finish = () => {
        if (timer) clearInterval(timer)
        width.value = 100
        setTimeout(() => {
            active.value = false
            width.value = 0
        }, 300)
    }

    return { width, active, start, finish }
})
