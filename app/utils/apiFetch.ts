import { useProgressStore } from '~/stores/progress'

export async function apiFetch(url: string, options?: any): Promise<any> {
    const progress = useProgressStore()
    progress.requestStart()
    try {
        return await $fetch(url, options)
    } finally {
        progress.requestEnd()
    }
}
