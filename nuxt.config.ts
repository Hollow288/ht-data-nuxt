// nuxt.config.ts
import tsconfigPaths from 'vite-tsconfig-paths'

const isDev = process.env.NODE_ENV !== 'production'
const devConnectSrc = isDev
  ? ['http://127.0.0.1:5777', 'http://localhost:5777', 'ws://127.0.0.1:*', 'ws://localhost:*']
  : []

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@bg-dev/nuxt-naiveui', '@nuxtjs/color-mode', 'nuxt-security'],
  runtimeConfig: {
    public: {
      enableMock: process.env.NUXT_PUBLIC_ENABLE_MOCK === 'true'
    }
  },
  security: {
    headers: {
      strictTransportSecurity: {
        maxAge: 63072000,
        includeSubdomains: true,
        preload: true
      },
      xFrameOptions: 'SAMEORIGIN',
      xContentTypeOptions: 'nosniff',
      referrerPolicy: 'strict-origin-when-cross-origin',
      permissionsPolicy: {
        camera: [],
        microphone: [],
        geolocation: [],
        fullscreen: ['self']
      },
      crossOriginOpenerPolicy: 'same-origin',
      crossOriginResourcePolicy: 'same-site',
      crossOriginEmbedderPolicy: 'unsafe-none',
      contentSecurityPolicy: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
        'img-src': ["'self'", 'data:', 'blob:', 'https:'],
        'connect-src': ["'self'", 'https:', ...devConnectSrc],
        'frame-ancestors': ["'self'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'object-src': ["'none'"],
        'upgrade-insecure-requests': true
      }
    }
  },
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
