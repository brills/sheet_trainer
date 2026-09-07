import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative base path ensures assets load cleanly on GitHub Pages subpaths (e.g. username.github.io/repo-name/)
  base: './',
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  }
});
