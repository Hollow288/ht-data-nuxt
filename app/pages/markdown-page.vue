<template>
   <MarkdownContent :content="markdown" />
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import MarkdownContent from '~/components/MarkdownContent.vue'
import { useSidebarStore, useSidebar } from '~/stores/sidebar'
import MarkdownIt from 'markdown-it'
import {useRoute} from "#vue-router";
const route = useRoute()
debugger
const articleId = computed(() => route.query.articleId || '')

// 1️⃣ 模拟 Markdown 内容
const markdown = `
# 我的 Markdown 示例

这是一个演示用的 **Markdown 文本**，包含各种常用元素。${articleId.value}

---

## 1. 列表示例

### 无序列表
- 苹果
- 香蕉
- 草莓

### 无序列表
- 苹果
- 香蕉
- 草莓

### 无序列表
- 苹果
- 香蕉
- 草莓

### 无序列表
- 苹果
- 香蕉
- 草莓

### 无序列表
- 苹果
- 香蕉
- 草莓

### 无序列表
- 苹果
- 香蕉
- 草莓

### 无序列表
- 苹果
- 香蕉
- 草莓

### 无序列表
- 苹果
- 香蕉
- 草莓

### 无序列表
- 苹果
- 香蕉
- 草莓

### 无序列表
- 苹果
- 香蕉
- 草莓

### 无序列表
- 苹果
- 香蕉
- 草莓

### 无序列表
- 苹果
- 香蕉
- 草莓

### 无序列表
- 苹果
- 香蕉
- 草莓

### 有序列表
1. 安排任务
2. 完成项目
3. 提交报告

---

## 2. 链接与图片

[访问 Vue 官方网站](https://vuejs.org)

![示例图片](https://via.placeholder.com/150)

---

## 3. 代码块

### JavaScript 示例
\`\`\`javascript
let name = '';
function greet(name) {
  console.log(\`Hello, Hello,Hello,Hello,Hello,Hello,Hello,Hello,Hello,Hello,Hello,Hello,Hello,Hello,Hello,Hello,Hello,Hello,Hello,\${name}!\`);
}
greet('Alice');


`

const md = new MarkdownIt()
const tokens: any[] = md.parse(markdown, {})


// slugify 一个标题
function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, '-')
}

const toc = tokens
    .filter(t => t.type === 'heading_open')
    .map(t => {
      const level = Number(t.tag.slice(1))
      const content = tokens[tokens.indexOf(t) + 1].content
      const id = slugify(content)
      return { level, content, id }
    })


useSidebar('SidebarMarkdownMenu', { menuItems: toc })
</script>

<style scoped>

.card-container {
  width: 100%;
  background: rgba(255, 255, 255, 0.9); /* 半透明白色 */
  /*border-radius: 16px;  圆角 */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); /* 阴影 */
  padding: 15px 20px;
  box-sizing: border-box;
  backdrop-filter: blur(8px); /* 毛玻璃效果，可选 */
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}


.card-container:hover {
  transform: translateY(-4px); /* 稍微浮起来 */
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
}
</style>
