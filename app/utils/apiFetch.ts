import { useProgressStore } from '~/stores/progress'

export async function apiFetch<T>(url: string, options?: any): Promise<T> {
    const progress = useProgressStore()
    progress.requestStart()
    try {
        return await $fetch<T>(url, options)
    } finally {
        progress.requestEnd()
    }
}
