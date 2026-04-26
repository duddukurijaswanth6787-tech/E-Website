import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
  },
  build: {
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
    chunkSizeWarningLimit: 1000
  }
})
