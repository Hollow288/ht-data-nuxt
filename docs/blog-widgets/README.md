# 博客交互图：公共代码在项目，HTML 在远程

## 文件放置

- `public/blog-embed/embed.css`：公共配色与嵌入布局，随 Nuxt 项目部署。
- `public/blog-embed/embed.js`：公共主题同步与自动高度，随 Nuxt 项目部署。
- `app/components/MarkdownContent.vue`：文章页通过 `/blog-embed/` 相对路径读取两个公共文件，并发送给 iframe。
- 本目录的 `template.html` 和 `生成规则.md`：生成新图时使用的创作模板和约定。
- 具体图解 HTML 仍上传至 `https://media.ovovk.com/blog/`，不放进前端项目的 public 目录。

原有三个文件名和文章里的 iframe 地址保持不变：

- hashmap-structure.html
- rbt-insert-walkthrough.html
- tree-explorer.html

## 加载方式

1. 远程 HTML 保留模板 head 中的 `data-blog-embed-loader` 小段脚本。
2. 文章页通过同源相对路径读取公共 CSS、JS，成功的结果会缓存在当前组件内。
3. 文章页通过 `blog-embed:assets` 消息下发 CSS、JS 和当前主题。远程加载器只接受父窗口的消息，并且只安装一次公共资源。
4. 安装后继续使用 `blog-embed:measure` / `blog-embed:resize` 同步主题和高度。

HTML 不需要知道博客前端域名，也不需要请求同目录的 embed.css、embed.js。本地开发、预览环境和线上都从当前前端项目读取公共资源。

单独打开图解时使用 CSS var() 默认值提供基础浅色预览；完整的主题与高度适配由文章页下发。使用完整适配时，iframe 可继续保留 sandbox="allow-scripts"。

## 发布顺序

先部署包含公共资源及文章页下发逻辑的前端项目，再替换远程同名 HTML。旧版 HTML 可以继续使用已有的 measure/resize 消息；新版 HTML 需要新版文章页提供公共资源。

## 后续生成

让 AI 阅读 `生成规则.md`，以 `template.html` 为骨架，替换标题、图形、说明和专属交互。只上传新生成的 HTML，公共 CSS、JS 始终在当前项目维护。
