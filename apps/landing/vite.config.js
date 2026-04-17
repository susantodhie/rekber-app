import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        tentangKami: resolve(__dirname, 'tentang-kami.html'),
        kebijakanPrivasi: resolve(__dirname, 'kebijakan-privasi.html'),
        syaratKetentuan: resolve(__dirname, 'syarat-ketentuan.html'),
        faq: resolve(__dirname, 'faq.html'),
      },
    },
  },
  server: {
    port: 5175,
    strictPort: false,
    open: true,
  },
  preview: {
    port: 5175,
  }
})
