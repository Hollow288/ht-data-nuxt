<template>
  <n-config-provider
      :theme="naiveTheme"
      :theme-overrides="themeOverrides"
      inline-theme-disabled
  >
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  </n-config-provider>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { NConfigProvider, darkTheme } from 'naive-ui'
import type { GlobalThemeOverrides } from 'naive-ui'

// 获取 color-mode 实例
const colorMode = useColorMode()
const themeReady = ref(false)
onMounted(() => { themeReady.value = true })
// Apply the browser's stored theme after the server markup has hydrated.
const isDark = computed(() => themeReady.value && colorMode.value === 'dark')
const themeOverrides = computed<GlobalThemeOverrides>(() => ({
  common: {
    primaryColor: isDark.value ? '#a5bbd4' : '#526f91',
    primaryColorHover: isDark.value ? '#c3d2e3' : '#3f5c7d',
    primaryColorPressed: isDark.value ? '#a5bbd4' : '#3f5c7d',
    primaryColorSuppl: isDark.value ? '#a5bbd4' : '#526f91',
    bodyColor: isDark.value ? '#1d1e21' : '#ffffff',
    cardColor: isDark.value ? '#26282c' : '#ffffff',
    popoverColor: isDark.value ? '#26282c' : '#ffffff',
    modalColor: isDark.value ? '#26282c' : '#ffffff',
    inputColor: isDark.value ? '#26282c' : '#f7f7f8',
    borderColor: isDark.value ? '#393c42' : '#dfe3e9',
    dividerColor: isDark.value ? '#393c42' : '#dfe3e9',
    borderRadius: '8px',
    fontSize: '16px',
    fontSizeSmall: '14px',
    fontSizeMini: '13px',
    textColorBase: isDark.value ? '#e5e7eb' : '#252a32',
    textColor1: isDark.value ? '#e5e7eb' : '#252a32',
    textColor2: isDark.value ? '#aeb2b9' : '#535b66',
    textColor3: isDark.value ? '#949aa3' : '#6b7078',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif'
  }
}))

// 3. 计算属性：根据 colorMode 的值决定是否传递 darkTheme
const naiveTheme = computed(() => {
  return isDark.value ? darkTheme : null
})

</script>
