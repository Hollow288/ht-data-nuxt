import { useProgressStore } from '~/stores/progress'

/** Only the first page load blocks the screen; later requests keep the top progress bar. */
export function useInitialLoading() {
  const nuxtApp = useNuxtApp()
  const progress = useProgressStore()
  const active = ref(true)
  const slow = ref(false)
  const mounted = ref(false)
  const assetsReady = ref(false)
  const pagePending = ref(false)
  let settleTimer: ReturnType<typeof setTimeout> | undefined
  let slowTimer: ReturnType<typeof setTimeout> | undefined
  let timeoutTimer: ReturnType<typeof setTimeout> | undefined

  function clearTimers() {
    clearTimeout(settleTimer)
    clearTimeout(slowTimer)
    clearTimeout(timeoutTimer)
  }

  function finish() {
    clearTimers()
    active.value = false
  }

  function checkReady() {
    clearTimeout(settleTimer)
    if (!active.value || !mounted.value || !assetsReady.value || pagePending.value || progress.pendingRequests > 0) return

    // Let chained requests and their DOM updates settle before revealing the page.
    settleTimer = setTimeout(finish, 120)
  }

  const removePageStart = nuxtApp.hook('page:start', () => {
    pagePending.value = true
  })
  const removePageFinish = nuxtApp.hook('page:finish', () => {
    pagePending.value = false
  })
  const removeAppError = nuxtApp.hook('app:error', finish)
  const stopWatching = watch(
    [mounted, assetsReady, pagePending, () => progress.pendingRequests],
    checkReady,
    { flush: 'post' }
  )

  function onWindowLoaded() {
    assetsReady.value = true
  }

  onMounted(() => {
    mounted.value = true
    if (!active.value) return
    assetsReady.value = document.readyState === 'complete'
    if (!assetsReady.value) window.addEventListener('load', onWindowLoaded, { once: true })
    slowTimer = setTimeout(() => { slow.value = true }, 5000)
    // A failed or stalled request must never trap visitors behind the splash.
    timeoutTimer = setTimeout(finish, 12000)
  })

  onBeforeUnmount(() => {
    clearTimers()
    window.removeEventListener('load', onWindowLoaded)
    stopWatching()
    removePageStart()
    removePageFinish()
    removeAppError()
  })

  return { active, slow, finish }
}
