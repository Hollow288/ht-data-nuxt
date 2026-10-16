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
