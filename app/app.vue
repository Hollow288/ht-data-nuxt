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
import { darkTheme } from 'naive-ui'
import type { GlobalThemeOverrides } from 'naive-ui'

// 获取 color-mode 实例
const colorMode = useColorMode()
const themeOverrides = computed<GlobalThemeOverrides>(() => ({
  common: {
    primaryColor: colorMode.value === 'dark' ? '#a5bbd4' : '#526f91',
    primaryColorHover: colorMode.value === 'dark' ? '#c3d2e3' : '#3f5c7d',
    primaryColorPressed: colorMode.value === 'dark' ? '#a5bbd4' : '#3f5c7d',
    primaryColorSuppl: colorMode.value === 'dark' ? '#a5bbd4' : '#526f91',
    bodyColor: colorMode.value === 'dark' ? '#1d1e21' : '#ffffff',
    cardColor: colorMode.value === 'dark' ? '#26282c' : '#ffffff',
    popoverColor: colorMode.value === 'dark' ? '#26282c' : '#ffffff',
    modalColor: colorMode.value === 'dark' ? '#26282c' : '#ffffff',
    inputColor: colorMode.value === 'dark' ? '#26282c' : '#f7f7f8',
    borderColor: colorMode.value === 'dark' ? '#393c42' : '#dfe3e9',
    dividerColor: colorMode.value === 'dark' ? '#393c42' : '#dfe3e9',
    borderRadius: '8px',
    fontSize: '16px',
    fontSizeSmall: '14px',
    fontSizeMini: '13px',
    textColorBase: colorMode.value === 'dark' ? '#e5e7eb' : '#252a32',
    textColor1: colorMode.value === 'dark' ? '#e5e7eb' : '#252a32',
    textColor2: colorMode.value === 'dark' ? '#aeb2b9' : '#535b66',
    textColor3: colorMode.value === 'dark' ? '#949aa3' : '#6b7078',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif'
  }
}))

// 3. 计算属性：根据 colorMode 的值决定是否传递 darkTheme
const naiveTheme = computed(() => {
  return colorMode.value === 'dark' ? darkTheme : null
})

</script>
