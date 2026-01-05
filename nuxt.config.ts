// nuxt.config.ts
import tsconfigPaths from 'vite-tsconfig-paths'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@bg-dev/nuxt-naiveui', '@nuxtjs/color-mode'],
  vite: {
    plugins: [tsconfigPaths()],
  },
  css: ['~/assets/css/global.css',
    'remixicon/fonts/remixicon.css'],
  colorMode: {
    preference: 'light', // 默认设为亮色，不自动跟随系统
    fallback: 'light',
    classSuffix: '',     // 这样 html 上的类名是 .dark 而不是 .dark-mode
    storageKey: 'nuxt-color-mode'
  },
  app: {
    head: {
      title: 'Hollow’s Space',
      htmlAttrs: {
        lang: 'zh-CN'
      },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: 'favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Sour+Gummy:ital,wght@0,100..900;1,100..900&display=swap'
        }

      ]
    }
  }
})
