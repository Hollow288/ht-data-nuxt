# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## 本地后端连接

前端统一请求当前网站下的 `/hotta-api/`。开发服务器将该路径转发到
`http://127.0.0.1:5777/api/v1/`，因此用 `http://localhost:3000` 或
`http://127.0.0.1:3000` 打开前端都不会产生浏览器跨域请求。

先启动 `hotta-data-admin` 后端，确认后端监听 `5777` 端口，再运行 `npm run dev`。
如果后端地址不同，可以在本地 `.env` 中设置：

```dotenv
NUXT_DEV_API_TARGET=http://127.0.0.1:5777/api/v1/
```

更改代理配置或环境变量后，需要重启前端开发服务器。
开发代理仅在 `npm run dev` 中生效；生产环境仍需由反向代理将 `/hotta-api/`
转发到后端的 `/api/v1/`。

## 小工具

`/tools` 是统一工具目录，包含 OCR、JSON 格式化和从 `fish-tools` 移植的 8 个工具。
目录定义位于 `app/data/tools.ts`，同时用于工具列表、分类和站内搜索。

| 路由 | 工具 |
| --- | --- |
| `/tools/ocr` | OCR 图片与 PDF 文字识别（保留 `/ocr-page` 原地址） |
| `/tools/twofa` | TOTP / HOTP 动态码，支持 SHA1 / SHA256 / SHA512 |
| `/tools/one-line` | 多行文本压一行 |
| `/tools/json` | JSON 格式化与压缩，支持递归展开嵌套、多层转义的 JSON 字符串 |
| `/tools/caesar` | 凯撒密码 25 种位移枚举 |
| `/tools/base64-image` | Base64、图片与 UTF-8 文字互转 |
| `/tools/encode` | URL 与 Unicode 编码解码 |
| `/tools/color` | HEX / RGB / HSL 颜色转换 |
| `/tools/sub-email` | 顺序或随机生成子邮箱，单次最多 1000 个 |
| `/tools/js-runner` | JavaScript 编辑和沙箱运行 |

2FA 支持 `/tools/twofa?input=...`，也兼容原项目的
`/tools/twofa/<URL 编码后的密钥或 otpauth 链接>` 预填方式。
除 OCR 使用现有后端外，其他工具均在浏览器中处理，无需启动 `fish-tools`。
JS 运行器使用 CodeMirror 编辑器及沙箱内的 Web Worker，支持停止和 5 秒超时，
请求强制省略凭据并遵守 CORS。

JSON 工具默认将 `context` 等字符串字段中的合法 JSON 对象或数组递归展开，
也支持整段被多次序列化的 JSON；普通文本、数字字符串和数字精度保持不变。
展开会改变字段类型，处理需要原样发送的接口报文时应关闭「递归展开 JSON 字符串」。
支持 2 / 4 空格或 Tab 缩进、压缩、复制及格式错误定位，内容仅在浏览器本地处理。
当前结果可导出为 JSON 文件，文件名可选，留空时使用 `formatted.json`，自动补全 `.json` 后缀。
运行 `npm run test:json` 检查 JSON 格式化与转义处理。

运行 `npm run test:tools` 检查 OTP 标准向量及转换逻辑，
运行 `npm run typecheck` 检查 Nuxt 应用类型。

## Naive UI

直接依赖官方 `naive-ui`，组件在使用的 Vue 文件中按需导入，不再使用社区 Nuxt 适配模块。
`app/plugins/naive-ui.server.ts` 使用官方依赖 `@css-render/vue3-ssr` 收集首屏样式；
`nuxt.config.ts` 的 `vite.ssr.noExternal` 处理服务端 ESM 依赖，
`vite.optimizeDeps.include` 为浏览器预打包组件库，避免开发刷新时产生数千个模块请求。
`app/app.vue` 统一管理明暗主题。

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
