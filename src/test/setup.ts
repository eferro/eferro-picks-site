import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { Talk } from '../types/talks';

// Configure window.location for happy-dom compatibility with react-router
// BrowserRouter needs window.location.origin and window.location.href
// Note: happy-dom with about:blank sets origin to string "null", not null value
// We unconditionally set this to ensure consistent behavior across CI and local
const TEST_ORIGIN = 'http://localhost:3000';
Object.defineProperty(window, 'location', {
  value: {
    origin: TEST_ORIGIN,
    href: `${TEST_ORIGIN}/`,
    pathname: '/',
    search: '',
    hash: '',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    protocol: 'http:',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
    toString: () => `${TEST_ORIGIN}/`,
  },
  writable: true,
  configurable: true,
});

// Cache parsed JSON to avoid repeated I/O
let cachedTalksData: Talk[] | null = null;

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
      cachedTalksData = JSON.parse(data) as Talk[];
    }
    return {
      ok: true,
      json: async () => cachedTalksData as Talk[]
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