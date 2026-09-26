import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { configDefaults, defineConfig } from 'vitest/config'

const apiProxyTarget = process.env.VITE_API_PROXY_TARGET ?? 'http://127.0.0.1:5062'

// Build-time flags Phaser's source expects (mirrors its webpack DefinePlugin).
const phaserFlags = {
  // phaser-no-physics.js assigns `global.Phaser` (webpack provides `global`; Vite does not).
  global: 'globalThis',
  'typeof CANVAS_RENDERER': JSON.stringify(true),
  'typeof WEBGL_RENDERER': JSON.stringify(true),
  'typeof WEBGL_DEBUG': JSON.stringify(false),
  'typeof EXPERIMENTAL': JSON.stringify(false),
  'typeof FEATURE_SOUND': JSON.stringify(false),
  'typeof PLUGIN_CAMERA': JSON.stringify(false),
  'typeof PLUGIN_FBINSTANT': JSON.stringify(false),
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // BUFFER: build Phaser from its no-physics source entry. The game uses its own collision
  // (src/game/movement.ts) and runs with noAudio. Game audio uses the app's native Web Audio layer,
  // not Phaser's sound subsystem, so the no-audio Phaser build remains intentionally lean.
  resolve: {
    alias: {
      phaser: fileURLToPath(new URL('./node_modules/phaser/src/phaser-no-physics.js', import.meta.url)),
    },
  },
  define: phaserFlags,
  // CommonJS Phaser source is pre-bundled in dev; the same flags must apply there too,
  // otherwise `typeof FLAG` is the truthy string "undefined" and debug/sound code runs.
  optimizeDeps: { rolldownOptions: { transform: { define: phaserFlags } } },
  build: {
    // The phaser vendor chunk is ~1.17 MB; keep the warning just above it so growth still warns.
    chunkSizeWarningLimit: 1250,
    // Phaser gets its own long-cached vendor chunk, separate from game code.
    rolldownOptions: {
      output: {
        advancedChunks: { groups: [{ name: 'phaser', test: /node_modules[\\/]phaser[\\/]/ }] },
      },
    },
  },
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
