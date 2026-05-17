import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://indianlocalstore-api-cjiq.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/media': {
        target: 'https://indianlocalstore-api-cjiq.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
