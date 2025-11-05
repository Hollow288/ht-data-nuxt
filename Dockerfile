FROM node:24-alpine AS build

WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package.json package-lock.json ./

# 安装依赖
RUN npm ci

# 复制项目文件
COPY . .

# 构建静态站点
RUN npm run generate

FROM nginx:stable-alpine

# 复制构建好的静态文件到 Nginx 默认目录
COPY --from=build /app/.output/public /usr/share/nginx/html

# 暴露 80 端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
