/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy Unifold API calls through Vite to avoid CORS in the browser
      '/api/unifold': {
        target: 'https://api.unifold.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/unifold/, ''),
        secure: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
  },
})
