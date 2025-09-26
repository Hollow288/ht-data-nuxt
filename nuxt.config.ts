// nuxt.config.ts
import tsconfigPaths from 'vite-tsconfig-paths'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  vite: {
    plugins: [tsconfigPaths()]
  },
  css: ['~/assets/css/global.css',
    'remixicon/fonts/remixicon.css'],
})
