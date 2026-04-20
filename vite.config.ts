import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5180,
    host: true,
    allowedHosts: ['srv1348263.tailefd799.ts.net'],
    proxy: {
      // Forward API calls to the SMA PHP backend (Apache on port 80).
      // The PHP API module lives under /bistro/api/v1/* in the SMA codebase.
      // From the React app's perspective, everything is at /api/v1/*.
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/bistro/api'),
      },
      // Also forward /assets/uploads/ so product images resolve from SMA's upload dir.
      '/uploads': {
        target: 'http://localhost',
        changeOrigin: true,
        rewrite: (path) => '/bistro/assets' + path,
      },
    },
  },
})
