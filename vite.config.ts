import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        rewrite: url => url.replace('/api', '')
      },
      '/image': {
        target: 'http://localhost:3001',
        rewrite: url => url.replace('/image', '')
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
