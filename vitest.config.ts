/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

export default defineConfig({
  // Only load React plugin for non-test environments to reduce overhead
  plugins: process.env.NODE_ENV === 'test' ? [] : [react()],
  test: {
    // Switch to happy-dom for 3x faster performance
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    
    // Performance optimizations
    pool: 'threads',
    poolOptions: {
      threads: {
        // Use single thread with no isolation for significant speed boost
        singleThread: true,
        isolate: false,
      }
    },
    
    // Disable CSS processing for tests (major speed improvement)
    css: false,
    
    // Optimize concurrency for CI/local development
    maxConcurrency: process.env.CI ? 4 : 8,
    
    // Dependency optimization
    deps: {
      optimizer: {
        web: {
          enabled: true,
          include: [
            '@testing-library/react',
            '@testing-library/jest-dom',
            'vitest'
          ]
        }
      }
    },
    
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/setup.ts',
        'src/test/utils.tsx',
        'src/test/context/',
        'src/test/mocks/',
        'src/test/consolidated/',
      ],
    },
    
    // Improve reporter performance
    reporter: process.env.CI ? ['junit', 'github-actions'] : ['default'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}); 