import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

// Cache parsed JSON to avoid repeated I/O
let cachedTalksData: any = null;

// Automatically cleanup after each test
afterEach(() => {
  cleanup();
  // Clear all mocks but preserve the structure for reuse
  vi.clearAllMocks();
});

// Optimized fetch mock - cache file reads
global.fetch = vi.fn(async (url: string | URL | Request) => {
  const urlStr = url.toString();
  if (urlStr.endsWith('talks.json')) {
    if (!cachedTalksData) {
      const filePath = join(process.cwd(), 'public', 'data', 'talks.json');
      const data = readFileSync(filePath, 'utf-8');
      cachedTalksData = JSON.parse(data);
    }
    return {
      ok: true,
      json: async () => cachedTalksData
    } as Response;
  }
  throw new Error(`Unhandled fetch request: ${urlStr}`);
});

// Global test configuration for happy-dom compatibility
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver for happy-dom
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver for happy-dom
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})); 