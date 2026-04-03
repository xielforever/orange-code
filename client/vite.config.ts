import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './', // 关键修改：让打包后的资源使用相对路径，适配 file:// 协议
  plugins: [react()],
})
