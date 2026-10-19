import { setup } from '@css-render/vue3-ssr'

export default defineNuxtPlugin((nuxtApp) => {
  // Each SSR request gets its own collector; retain cssr-id for client hydration.
  const { collect } = setup(nuxtApp.vueApp)

  nuxtApp.hook('app:rendered', () => {
    const styles = Array.from(
      collect().matchAll(/<style cssr-id="([^"]+)">([\s\S]*?)<\/style>/g),
      ([, id, css]) => ({ key: id, 'cssr-id': id, innerHTML: css })
    )
    nuxtApp.ssrContext?.head.push({ style: styles })
  })
})
