/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.integration.test.{ts,tsx}'],

    // Integration tests need isolation to avoid mock pollution
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false,
        isolate: true,
      }
    },

    css: false,

    reporter: process.env.CI ? ['junit', 'github-actions'] : ['default'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
