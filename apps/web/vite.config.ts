import react from '@vitejs/plugin-react'
import { configDefaults, defineConfig } from 'vitest/config'

const apiProxyTarget = process.env.VITE_API_PROXY_TARGET ?? 'http://127.0.0.1:5062'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // The lazily loaded Phaser chunk (GameCanvas) is ~1.40 MB and accepted in BUFFER;
  // the limit stays just above it so unexpected growth still warns.
  build: { chunkSizeWarningLimit: 1600 },
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: { '/api': apiProxyTarget },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
})
