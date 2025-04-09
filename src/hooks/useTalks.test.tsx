import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { useTalks } from './useTalks';
import { hasMeaningfulNotes } from '../utils/talks';
import { TestProvider } from '../test/context/TestContext';
import { Talk } from '../types/talks';
import {
  mockTalks,
  mockTalksWithEmptyNotes,
  mockTalksWithMixedLanguages,
  mockTalksWithMixedRatings,
  mockTalksWithMixedResourceTypes,
  mockTalksWithAllFields,
  mockTalksWithMissingFields
} from '../test/mocks/talks';

describe('useTalks', () => {
  let originalFetch: typeof global.fetch;

  beforeAll(() => {
    // Set BASE_URL for testing
    // @ts-ignore
    import.meta.env = import.meta.env || {};
    // @ts-ignore
    import.meta.env.BASE_URL = '/';

    // Store original fetch
    originalFetch = global.fetch;
  });

  afterEach(() => {
    // Restore original fetch after each test
    global.fetch = originalFetch;
  });

  it('loads and filters talks from the real data file', async () => {
    // Use real fetch for this test
    global.fetch = originalFetch;

    const { result } = renderHook(() => useTalks(), {
      wrapper: TestProvider
    });

    // Initially should be loading
    expect(result.current.loading).toBe(true);
    expect(result.current.talks).toHaveLength(0);
    expect(result.current.error).toBeNull();

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 5000 }); // Increase timeout since we're loading real data

    // Verify we have talks and no errors
    expect(result.current.error).toBeNull();
    
    // Verify we have a reasonable number of talks
    const totalTalks = result.current.talks.length;
    console.log(`Total talks loaded: ${totalTalks}`);
    expect(totalTalks).toBeGreaterThan(100);
    expect(totalTalks).toBeLessThan(300);

    // Verify all talks meet the filtering criteria
    const allTalksValid = result.current.talks.every(talk => {
      // Every talk should have required fields
      expect(talk.id).toBeTruthy();
      expect(talk.title).toBeTruthy();
      expect(talk.url).toBeTruthy();

      // Topics and speakers should be arrays (even if empty)
      expect(Array.isArray(talk.topics)).toBe(true);
      expect(Array.isArray(talk.speakers)).toBe(true);

      return true;
    });

    expect(allTalksValid).toBe(true);
  });

  it('correctly handles talks with empty notes', async () => {
    // Mock fetch with talks that have empty notes
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === '/data/talks.json') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTalksWithEmptyNotes)
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    const { result } = renderHook(() => useTalks(), {
      wrapper: TestProvider
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify we have talks and no errors
    expect(result.current.error).toBeNull();
    
    // Check that talks with only whitespace notes are properly handled
    const talksWithEmptyNotes = result.current.talks.filter(talk => 
      talk.notes !== undefined && !hasMeaningfulNotes(talk.notes)
    );

    // Verify we found the talk with empty notes
    expect(talksWithEmptyNotes).toHaveLength(1);
    expect(talksWithEmptyNotes[0].title).toBe('Empty Notes Talk');
    expect(hasMeaningfulNotes(talksWithEmptyNotes[0].notes || '')).toBe(false);
  });

  it('handles mock data correctly', async () => {
    // Mock fetch with our test data
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === '/data/talks.json') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTalksWithEmptyNotes)
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    const { result } = renderHook(() => useTalks(), {
      wrapper: TestProvider
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify the mock talk is in the results
    const foundTalk = result.current.talks.find(talk => talk.id === 'test-2');
    expect(foundTalk).toBeDefined();
    expect(foundTalk?.title).toBe('Empty Notes Talk');
    expect(foundTalk?.speakers).toEqual(['Test Speaker']);
    expect(hasMeaningfulNotes(foundTalk?.notes || '')).toBe(false);
  });

  it('handles fetch errors correctly', async () => {
    // Mock fetch to simulate an error
    global.fetch = vi.fn().mockImplementation(() => {
      return Promise.reject(new Error('Network error'));
    });

    const { result } = renderHook(() => useTalks(), {
      wrapper: TestProvider
    });

    // Initially should be loading
    expect(result.current.loading).toBe(true);
    expect(result.current.talks).toHaveLength(0);
    expect(result.current.error).toBeNull();

    // Wait for error to be set
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify error state
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBe('Network error');
    expect(result.current.talks).toHaveLength(0);
  });

  it('handles invalid JSON response', async () => {
    // Mock fetch to return invalid JSON
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === '/data/talks.json') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.reject(new Error('Invalid JSON'))
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    const { result } = renderHook(() => useTalks(), {
      wrapper: TestProvider
    });

    // Wait for error to be set
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify error state
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBe('Invalid JSON');
    expect(result.current.talks).toHaveLength(0);
  });

  it('filters talks by language', async () => {
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === '/data/talks.json') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTalksWithMixedLanguages)
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    const { result } = renderHook(() => useTalks(), {
      wrapper: TestProvider
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify only English talks are included
    expect(result.current.talks).toHaveLength(1);
    expect(result.current.talks[0].title).toBe('English Talk');
  });

  it('filters talks by rating', async () => {
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === '/data/talks.json') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTalksWithMixedRatings)
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    const { result } = renderHook(() => useTalks(), {
      wrapper: TestProvider
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify only high rating talks are included
    expect(result.current.talks).toHaveLength(1);
    expect(result.current.talks[0].title).toBe('High Rating Talk');
  });

  it('filters talks by resource type', async () => {
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === '/data/talks.json') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTalksWithMixedResourceTypes)
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    const { result } = renderHook(() => useTalks(), {
      wrapper: TestProvider
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify only valid resource types are included
    expect(result.current.talks).toHaveLength(1);
    expect(result.current.talks[0].title).toBe('Valid Talk');
  });

  it('transforms raw data correctly', async () => {
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === '/data/talks.json') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTalksWithAllFields)
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    const { result } = renderHook(() => useTalks(), {
      wrapper: TestProvider
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify the transformed data
    const transformedTalk = result.current.talks[0];
    expect(transformedTalk.id).toBe('test-1');
    expect(transformedTalk.title).toBe('Test Talk');
    expect(transformedTalk.url).toBe('https://example.com');
    expect(transformedTalk.duration).toBe(1800);
    expect(transformedTalk.topics).toEqual(['test', 'example']);
    expect(transformedTalk.speakers).toEqual(['Speaker 1', 'Speaker 2']);
    expect(transformedTalk.description).toBe('A test talk description');
    expect(transformedTalk.core_topic).toBe('test');
    expect(transformedTalk.notes).toBe('Test notes');
    expect(transformedTalk.year).toBe(2024);
    expect(transformedTalk.conference_name).toBe('Test Conference');
  });

  it('handles missing optional fields', async () => {
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === '/data/talks.json') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTalksWithMissingFields)
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    const { result } = renderHook(() => useTalks(), {
      wrapper: TestProvider
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify default values for missing fields
    const transformedTalk = result.current.talks[0];
    expect(transformedTalk.duration).toBe(0);
    expect(transformedTalk.topics).toEqual([]);
    expect(transformedTalk.speakers).toEqual([]);
    expect(transformedTalk.description).toBe('');
    expect(transformedTalk.core_topic).toBe('');
    expect(transformedTalk.notes).toBeUndefined();
    expect(transformedTalk.year).toBeUndefined();
    expect(transformedTalk.conference_name).toBeUndefined();
  });
}); 