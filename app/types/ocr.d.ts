import type { BaseRes } from "~/types/api"

export type OcrMode = 'detail' | 'list' | 'text'
export type OcrStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED'

export interface OcrResultItem {
    text: string
    confidence: number
    bbox: number[][]
    page: number | null
}

export interface OcrTask {
    taskId: string
    status: OcrStatus
    retryCount: number
    mode: OcrMode
    results?: OcrResultItem[]
    textList?: string[]
    fullText?: string
    pages?: number | null
    elapseSeconds?: number
    errorMsg?: string
    createdAt: number
    updatedAt: number
}

export type OcrSubmitRes = BaseRes<OcrTask>
export type OcrResultRes = BaseRes<OcrTask>
