import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],

  server: {
    port: 5173,
    proxy: {
      // Proxy REST API calls to the middleware
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // Proxy WebSocket connections to the middleware
      '/ws': {
        target: 'ws://localhost:3001',
        ws: true,
      },
    },
  },

  optimizeDeps: {
    include: ['socket.io-client'],
  },
})
