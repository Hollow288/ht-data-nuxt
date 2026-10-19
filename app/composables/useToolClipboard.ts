export function useToolClipboard() {
  const labels = ref<Record<string, string>>({})
  const timers = new Map<string, ReturnType<typeof setTimeout>>()
  async function copy(value: string, key = 'default') {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      labels.value[key] = '已复制'
    } catch {
      labels.value[key] = '复制失败，请手动复制'
    }
    clearTimeout(timers.get(key))
    timers.set(key, setTimeout(() => { delete labels.value[key]; timers.delete(key) }, 1500))
  }
  onUnmounted(() => timers.forEach(timer => clearTimeout(timer)))
  return { labels, copy }
}
