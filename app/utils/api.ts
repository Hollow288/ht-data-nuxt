import { useProgressStore } from '~/stores/progress'

export type ApiRequestOptions = NonNullable<Parameters<typeof $fetch>[1]> & {
    /** 后台轮询等已有局部加载提示的请求可关闭顶部进度条。 */
    showProgress?: boolean
}

export class BaseAPI {
    private static API_PREFIX = `/hotta-api/`


    static async apiFetch<T>(url: string, options: ApiRequestOptions = {}): Promise<T> {
        const { showProgress = true, ...fetchOptions } = options
        const progress = showProgress ? useProgressStore() : undefined
        progress?.requestStart()
        try {
            return await $fetch<T>(url, fetchOptions) as T
        } finally {
            progress?.requestEnd()
        }
    }


    static async apiGet<T>(url: string, params?: Record<string, any>, options: ApiRequestOptions = {}): Promise<T> {
        const headers = new Headers({
            'Content-Type': 'application/json',
        })
        new Headers(options.headers).forEach((value, name) => headers.set(name, value))

        return this.apiFetch<T>(`${this.API_PREFIX}${url}`, {
            ...options,
            method: 'GET',
            params: params ?? options.params,
            headers,
        })
    }


    static async apiPost<T>(url: string, body?: any, options: ApiRequestOptions = {}): Promise<T> {
        return this.apiFetch<T>(`${this.API_PREFIX}${url}`, {
            ...options,
            method: 'POST',
            body,
        })
    }


    static async apiPut<T>(url: string, body?: any, options: ApiRequestOptions = {}): Promise<T> {
        return this.apiFetch<T>(`${this.API_PREFIX}${url}`, {
            ...options,
            method: 'PUT',
            body,
        })
    }


    static async apiDelete<T>(url: string, options: ApiRequestOptions = {}): Promise<T> {
        return this.apiFetch<T>(`${this.API_PREFIX}${url}`, {
            ...options,
            method: 'DELETE',
        })
    }
}











