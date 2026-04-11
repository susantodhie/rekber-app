import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  appType: 'spa',

  server: {
    host: true,
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },

  preview: {
    host: true,
    allowedHosts: true
  }
})