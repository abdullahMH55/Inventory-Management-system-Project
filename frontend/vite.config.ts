import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    // Proxying keeps the API same-origin in dev, so cookies need no CORS round trip.
    // The API's CORS allowlist still has to be correct for any deploy that skips this.
    proxy: {
      '/api': { target: 'http://localhost:5166', changeOrigin: true },
    },
  },
});
