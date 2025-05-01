import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // SPA fallback: copy index.html to 404.html for GitHub Pages routing
    {
      name: 'spa-fallback',
      apply: 'build',
      closeBundle() {
        try {
          copyFileSync('dist/index.html', 'dist/404.html');
        } catch (e) {
          console.error('spa-fallback: failed to write 404.html:', e);
        }
      },
    },
  ],
  base: '/eferro-picks-site/',
})
