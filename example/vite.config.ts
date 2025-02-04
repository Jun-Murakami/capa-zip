import { defineConfig } from 'vite';

export default defineConfig({
  root: './src',
  build: {
    outDir: '../dist',
    minify: false,
    emptyOutDir: true,
    rollupOptions: {
      external: ['capa-zip']
    }
  },
  resolve: {
    alias: {
      'capa-zip': '/node_modules/capa-zip/dist/esm/index.js'
    }
  }
});
