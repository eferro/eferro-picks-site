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
    exclude: ['node_modules'],
    
    // Performance optimizations
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
        // Each test file gets a fresh module registry so per-file vi.mock
        // factories cannot leak into other files
        isolate: true,
      }
    },

    // Random order surfaces hidden dependencies between tests and files.
    // Reproduce a failing run with: npx vitest run --sequence.seed=<seed>
    sequence: {
      shuffle: true,
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