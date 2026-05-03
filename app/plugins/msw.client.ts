export default defineNuxtPlugin(async () => {
  if (!import.meta.dev) return
  const enabled = useRuntimeConfig().public.enableMock
  if (!enabled) return

  const { worker } = await import('~/mocks/browser')
  await worker.start({
    onUnhandledRequest: 'bypass'
  })
})
