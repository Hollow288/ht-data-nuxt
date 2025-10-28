import { useProgressStore } from '~/stores/progress'


export class BaseAPI {
    private static API_PREFIX = `http://127.0.0.1:5777/api/v1/`


    static async apiFetch<T>(url: string, options?: any): Promise<T> {
        const progress = useProgressStore()
        progress.requestStart()
        try {
            return await $fetch<T>(url, options) as T
        } finally {
            progress.requestEnd()
        }
    }


    static async apiGet<T>(url: string, params?: Record<string, any>): Promise<T> {
        return this.apiFetch<T>(`${this.API_PREFIX}${url}`, {
            method: 'GET',
            params: params,
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': 'AIzaSyBWlLk7GqJ-6sNOjFY2ZKWy2IJd7evlhAY'
            }
        })
    }


    static async apiPost<T>(url: string, body?: any): Promise<T> {
        return this.apiFetch<T>(`${this.API_PREFIX}${url}`, {
            method: 'POST',
            body,
        })
    }


    static async apiPut<T>(url: string, body?: any): Promise<T> {
        return this.apiFetch<T>(`${this.API_PREFIX}${url}`, {
            method: 'PUT',
            body,
        })
    }


    static async apiDelete<T>(url: string): Promise<T> {
        return this.apiFetch<T>(`${this.API_PREFIX}${url}`, {
            method: 'DELETE',
        })
    }
}











