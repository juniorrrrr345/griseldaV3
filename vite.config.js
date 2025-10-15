import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Port par défaut de Vite
    proxy: {
      '/api': {
        target: 'https://griselda-v3.calitek-junior.workers.dev', // Worker Cloudflare en développement
        changeOrigin: true
      }
    }
  }
})
