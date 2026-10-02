import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5176,
    strictPort: true,
    // Tailscale hostnames, so the dev server can be opened from another device.
    allowedHosts: ['.ts.net'],
    proxy: { '/api': 'http://127.0.0.1:4323' },
  },
  build: { outDir: 'dist/client' },
})
