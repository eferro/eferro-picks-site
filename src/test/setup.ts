import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { Talk } from '../types/talks';

// Unmount rendered components after each test
afterEach(() => {
  cleanup();
});

// The real public/data/talks.json is served for the talks data URL, read
// once per test file. Any other request fails loudly so tests never hit
// the network by accident.
let cachedTalksData: Talk[] | null = null;

global.fetch = vi.fn(async (url: string | URL | Request) => {
  const urlStr = url.toString();
  if (urlStr.endsWith('talks.json')) {
    if (!cachedTalksData) {
      const filePath = join(process.cwd(), 'public', 'data', 'talks.json');
      cachedTalksData = JSON.parse(readFileSync(filePath, 'utf-8')) as Talk[];
    }
    return {
      ok: true,
      json: async () => cachedTalksData as Talk[]
    } as Response;
  }
  throw new Error(`Unhandled fetch request: ${urlStr}`);
});
