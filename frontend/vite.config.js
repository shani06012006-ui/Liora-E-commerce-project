// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      fastRefresh: true,
    }),
  ],
  server: {
    port: 5173,
    hmr: {
      overlay: true,
    },
    proxy: {
      '/api': {
        target: 'https://liora-e-commerce-project.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/media': {
        target: 'https://liora-e-commerce-project.onrender.com',
        changeOrigin: true,
      },
    },
  },

  build: {
    sourcemap: true,
  },
});


//Vite Proxy - /api/ requests ஐ backend க்கு redirect பண்ணுது 