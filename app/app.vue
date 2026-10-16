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
    primaryColor: colorMode.value === 'dark' ? '#afc493' : '#667c51',
    primaryColorHover: colorMode.value === 'dark' ? '#cedeb7' : '#455e35',
    primaryColorPressed: colorMode.value === 'dark' ? '#afc493' : '#455e35',
    primaryColorSuppl: '#667c51',
    borderRadius: '5px',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif'
  }
}))

// 3. 计算属性：根据 colorMode 的值决定是否传递 darkTheme
const naiveTheme = computed(() => {
  return colorMode.value === 'dark' ? darkTheme : null
})

</script>
