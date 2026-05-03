import { http, HttpResponse, delay } from 'msw'
import type { OcrTask } from '~/types/ocr'

const API_BASE = 'http://127.0.0.1:5777/api/v1'

const taskStore = new Map<string, { task: OcrTask; pollCount: number }>()

function makeSuccessTask(taskId: string, base: OcrTask): OcrTask {
  return {
    ...base,
    status: 'SUCCESS',
    elapseSeconds: 1.23,
    pages: 1,
    results: [
      { text: '这是 mock 出来的第一行文字', confidence: 0.98, bbox: [[10, 10], [200, 10], [200, 40], [10, 40]], page: 1 },
      { text: 'Hello MSW Mock World', confidence: 0.95, bbox: [[10, 50], [240, 50], [240, 80], [10, 80]], page: 1 },
      { text: '识别置信度示例 87.3%', confidence: 0.873, bbox: [[10, 90], [220, 90], [220, 120], [10, 120]], page: 1 }
    ],
    textList: ['这是 mock 出来的第一行文字', 'Hello MSW Mock World', '识别置信度示例 87.3%'],
    fullText: '这是 mock 出来的第一行文字\nHello MSW Mock World\n识别置信度示例 87.3%',
    updatedAt: Date.now()
  }
}

export const handlers = [
  http.post(`${API_BASE}/ocr/submit`, async ({ request }) => {
    const url = new URL(request.url)
    const mode = (url.searchParams.get('mode') ?? 'detail') as OcrTask['mode']
    const taskId = `mock-${Date.now()}`
    const now = Date.now()
    const task: OcrTask = {
      taskId,
      status: 'PENDING',
      retryCount: 0,
      mode,
      createdAt: now,
      updatedAt: now
    }
    taskStore.set(taskId, { task, pollCount: 0 })
    await delay(300)
    return HttpResponse.json({ code: 200, msg: 'ok', data: task })
  }),

  http.get(`${API_BASE}/ocr/result/:taskId`, async ({ params }) => {
    const taskId = params.taskId as string
    const entry = taskStore.get(taskId)
    if (!entry) {
      return HttpResponse.json({ code: 404, msg: 'task not found', data: null }, { status: 404 })
    }
    entry.pollCount++
    if (entry.pollCount === 1) {
      entry.task = { ...entry.task, status: 'PROCESSING', updatedAt: Date.now() }
    } else if (entry.pollCount >= 2) {
      entry.task = makeSuccessTask(taskId, entry.task)
    }
    await delay(200)
    return HttpResponse.json({ code: 200, msg: 'ok', data: entry.task })
  })
]
