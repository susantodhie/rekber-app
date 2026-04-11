import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  },

  preview: {
    host: true,
    allowedHosts: true,
  },

  build: {
    // Ensure assets use relative paths for Railway
    assetsDir: 'assets',
  },
})
