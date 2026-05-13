import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',   // binds all interfaces — allows both localhost and LAN access
    port: 5173,
    strictPort: true,   // ensures HMR port never silently shifts
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
    headers: {
      'Cache-Control': 'no-store', // use no-store in dev to prevent stale asset issues
    },
  },
  preview: {
    port: 4173,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    cssMinify: true,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('framer-motion') || id.includes('lucide-react')) {
              return 'vendor';
            }
            return 'libs';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1500
  }
})
