import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 5173,
    // 当后端 API 可用时，取消下面的注释来配置代理
    // 这样前端请求 /api/* 会被代理到后端服务器
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:8080', // 后端服务地址
    //     changeOrigin: true,
    //     rewrite: (path) => path.replace(/^\/api/, ''), // 如果后端不需要 /api 前缀，取消此行注释
    //   },
    // },
  },
})
