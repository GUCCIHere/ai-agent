import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
  base: '/',  // 确保是 '/'
  build: {
    outDir: 'dist',
    assetsDir: 'assets', sourcemap: true,
  },
});
