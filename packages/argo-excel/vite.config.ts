import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'manifest.xml',
          dest: '.'
        },
        {
          src: '../../assets/icons/*',
          dest: 'assets/icons'
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@argo/core': path.resolve(__dirname, '../argo-core/src')
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        taskpane: path.resolve(__dirname, 'index.html'),
        functions: path.resolve(__dirname, 'functions.html')
      }
    }
  },
  server: {
    port: 3000,
    https: {
      // Office Add-ins require HTTPS
      key: './certs/localhost-key.pem',
      cert: './certs/localhost.pem'
    }
  }
});
