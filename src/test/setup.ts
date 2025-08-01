import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

// Automatically cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock fetch for tests
global.fetch = async (url: string | URL | Request) => {
  const urlStr = url.toString();
  if (urlStr.endsWith('talks.json')) {
    const filePath = join(process.cwd(), 'public', 'data', 'talks.json');
    const data = readFileSync(filePath, 'utf-8');
    return {
      ok: true,
      json: async () => JSON.parse(data)
    } as Response;
  }
  throw new Error(`Unhandled fetch request: ${urlStr}`);
}; 