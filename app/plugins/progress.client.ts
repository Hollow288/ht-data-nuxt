import { defineNuxtPlugin } from '#app'
import { useRouter } from 'vue-router'
import { useProgressStore } from '~/stores/progress'

export default defineNuxtPlugin((nuxtApp) => {
    const router = useRouter()
    const progress = useProgressStore()


    router.beforeEach((to, from, next) => {
        progress.start()
        next()
    })
    router.afterEach(() => {
        progress.finish()
    })
})
