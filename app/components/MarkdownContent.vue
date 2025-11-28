<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import Prism from 'prismjs'

// GitHub Markdown 样式
import 'github-markdown-css/github-markdown.css'
// Prism 高亮主题
import 'prismjs/themes/prism-tomorrow.css'

// 需要的语言
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-nginx'
import 'prismjs/components/prism-java'

// Props 类型
interface Props {
  content: string
}

const props = defineProps<Props>()


// 初始化 MarkdownIt
const md: MarkdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str: string, lang: string) => {
    if (lang && Prism.languages[lang]) {
      return `<pre class="language-${lang}"><code>${Prism.highlight(str, Prism.languages[lang], lang)}</code></pre>`
    }
    return `<pre class="language-text"><code>${md.utils.escapeHtml(str)}</code></pre>`
  },
})

// 自动给标题添加 id
md.renderer.rules.heading_open = (tokens:any, idx, options, env, self) => {
  const token = tokens[idx]
  const title = tokens[idx + 1].content
  const id = title.toLowerCase().replace(/\s+/g, '-')
  token.attrSet('id', id)
  return self.renderToken(tokens, idx, options)
}

const rendered = computed(() => md.render(props.content))

// Prism 高亮生效
onMounted(() => Prism.highlightAll())
watch(() => props.content, () => Prism.highlightAll())
</script>

<template>
    <div class="markdown-body" v-html="rendered"></div>
</template>

<style>
/* 保留原 card-container 样式 */

/* Markdown 样式 */
.markdown-body {
  background: transparent;
  width: 100%;
  min-height: calc(100vh - 180px);
}

pre[class*="language-"],
code[class*="language-"] {
  background: #3a3939 !important;  /* 浅灰背景 */
  color: #ffffff !important;       /* 字体颜色 */
  font-family: Consolas, Monaco, "Courier New", monospace;
  font-size: 14px;
  line-height: 1.6;
  max-height: 300px;

  /* 边框方正，无圆角 */
  border-radius: 8px;
  border: 1px solid #e0e0e0;       /* 浅边框增加层次 */

  /* 内边距 */
  padding: 14px 16px 13px 16px;

  /* 凸起感 */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);

  /* 滚动条 */
  overflow-x: auto;

  /* 去掉字体阴影 */
  text-shadow: none;
}

/* 内联 code 标签 */
code[class*="language-"] {
  color: #2d2d2d !important;
  border-radius: 0;
  padding: 2px 6px;
  text-shadow: none;
  box-shadow: none;
}


/* 滚动条整体部分，可以设置宽度等 */
pre[class*="language-"]::-webkit-scrollbar {
  width: 0;       /* 纵向滚动条的宽度 */
  height: 6px;      /* 横向滚动条的高度 */
}

/* 滚动条轨道 */
pre[class*="language-"]::-webkit-scrollbar-track {
  background: #3a3939;
  border-radius: 8px;;
  border: 1px solid #3a3939;
}

/* 滚动条滑块 (可以拖动的那个小方块) */
pre[class*="language-"]::-webkit-scrollbar-thumb {
  background: #6a6969;
  border-radius: 8px;; /*  保持与代码块一致的方正风格 */
}

/* 鼠标悬停在滑块上时 */
pre[class*="language-"]::-webkit-scrollbar-thumb:hover {
  background: #9e9c9c;
}




</style>
