import { vi } from 'vitest';
import { AirtableItem } from '../../hooks/useTalks';

/**
 * Helper function to mock fetch responses
 * @param data The data to return in the response
 * @returns A mock fetch implementation
 */
export function mockFetch(data: AirtableItem[]) {
  return vi.fn().mockImplementation((url: string) => {
    if (url === '/data/talks.json') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(data)
      });
    }
    return Promise.reject(new Error('Not found'));
  });
}

/**
 * Helper function to mock fetch errors
 * @param error The error to throw
 * @returns A mock fetch implementation that throws the error
 */
export function mockFetchError(error: Error) {
  return vi.fn().mockImplementation(() => {
    return Promise.reject(error);
  });
}

/**
 * Helper function to mock fetch with invalid JSON
 * @returns A mock fetch implementation that returns invalid JSON
 */
export function mockFetchInvalidJson() {
  return vi.fn().mockImplementation((url: string) => {
    if (url === '/data/talks.json') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });
    }
    return Promise.reject(new Error('Not found'));
  });
} 