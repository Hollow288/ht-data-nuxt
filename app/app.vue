<template>
  <n-config-provider
      :theme="naiveTheme"
      inline-theme-disabled
  >
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  </n-config-provider>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { darkTheme, useOsTheme } from 'naive-ui' // 引入 Naive UI 的深色主题
import type { GlobalThemeOverrides } from 'naive-ui'

// 获取 color-mode 实例
const colorMode = useColorMode()

// 3. 计算属性：根据 colorMode 的值决定是否传递 darkTheme
const naiveTheme = computed(() => {
  return colorMode.value === 'dark' ? darkTheme : null
})

</script>