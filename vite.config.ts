import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    /** Evita no Windows `localhost` resolver para ::1 enquanto o Vite escuta só em IPv4. */
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/produtos': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/health': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/pedidos': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/upload': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
  },
})
