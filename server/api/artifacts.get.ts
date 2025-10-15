// server/api/artifacts.get.ts
import { promises as fs } from 'fs'
import { join } from 'path'
import { defineEventHandler } from 'h3'

export default defineEventHandler(async () => {
    try {
        const uploadsDir = join(process.cwd(), 'public', 'artifact')
        const files = await fs.readdir(uploadsDir).catch(() => [])
        const imgs = files.filter(f => /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(f))
        debugger
        return imgs.map(name => ({
            name,
            url: `/artifact/${encodeURIComponent(name)}` // public 下的直接访问路径
        }))
    } catch (e) {
        // 返回空数组而非抛出（前端更好处理）
        return []
    }
})
