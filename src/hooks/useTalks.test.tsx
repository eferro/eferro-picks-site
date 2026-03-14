import { renderHook, waitFor } from '@testing-library/react';
import { useTalks, FetchConfig } from './useTalks';
import { TestProvider } from '../test/context/TestContext';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Fast test configuration - no duplicating production retry logic!
const TEST_FETCH_CONFIG: FetchConfig = {
  maxRetries: 3,
  retryDelayMs: 10 // Fast for tests (10ms vs 1000ms in production)
};

// Store original fetch
const originalFetch = global.fetch;

// No mocking of processTalks - let real transformation run
// This ensures tests verify complete data pipeline

// Helper functions for mocking
const mockFetchResponse = (data: unknown) => {
  global.fetch = vi.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(data),
    })
  );
};

const mockFetchError = (error: Error) => {
  global.fetch = vi.fn().mockImplementation(() =>
    Promise.reject(error)
  );
};

const mockFetchFailure = () => {
  global.fetch = vi.fn().mockImplementation(() =>
    Promise.resolve({
      ok: false,
    })
  );
};

// Helper function for rendering hook and waiting for load
const renderUseTalksHook = async () => {
  const hook = renderHook(() => useTalks(false, TEST_FETCH_CONFIG), {
    wrapper: TestProvider
  });

  // Wait for loading to complete - using fast test config
  await waitFor(() => {
    expect(hook.result.current.loading).toBe(false);
  }, { timeout: 150 }); // Fast because we control timing with TEST_FETCH_CONFIG

  return hook;
};

/**
 * CONTEXT: useTalks Hook - Data Fetching with Resilience
 *
 * WHY: Users need reliable access to talks data even when network is unstable.
 * This hook is the critical data boundary for the entire application.
 *
 * KEY FEATURES:
 * 1. **Fetch & Transform**: Loads talks from Airtable, transforms to app format
 * 2. **Retry with Exponential Backoff**: Handles transient network failures
 * 3. **Error Handling**: Provides clear error messages to users
 * 4. **Real Transformation**: Tests use real processTalks/filterTalks functions
 *
 * RETRY STRATEGY:
 * - Production: 3 retries with 1000ms base delay (exponential backoff)
 * - Tests: 3 retries with 10ms base delay (fast, deterministic)
 * - Why: Network failures are often transient (DNS, CDN, temporary outage)
 *
 * TEST APPROACH:
 * - Mock only at boundary (global.fetch)
 * - Let real transformation pipeline run
 * - Use TEST_FETCH_CONFIG for fast, deterministic tests
 * - Verify end-to-end behavior (fetch → transform → filter → render)
 *
 * EDGE CASES TESTED:
 * - Network errors (transient failures)
 * - HTTP errors (404, 500)
 * - Invalid data (bad JSON, wrong format)
 * - Partial data (missing fields)
 * - Empty responses
 */
describe('useTalks', () => {
  const mockAirtableItem = {
    airtable_id: '1',
    name: 'Test Talk',
    url: 'https://example.com',
    duration: 30,
    topics_names: ['topic1', 'topic2'],
    speakers_names: ['speaker1', 'speaker2'],
    description: 'Test description',
    core_topic: 'test',
    notes: 'Test notes',
    language: 'English',
    rating: 5,
    resource_type: 'talk',
    year: 2024,
    conference_name: 'Test Conference'
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    mockFetchResponse([mockAirtableItem]);
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;
    // Restore all mocks
    vi.restoreAllMocks();
  });

  it('loads and processes talks correctly', async () => {
    const { result } = await renderUseTalksHook();

    // Check final state - real processTalks transformation happened
    expect(result.current.error).toBeNull();
    expect(result.current.talks).toHaveLength(1);
    expect(result.current.talks[0]).toMatchObject({
      id: '1',
      title: 'Test Talk',
      url: 'https://example.com',
      duration: 30,
      topics: ['topic1', 'topic2'],
      speakers: ['speaker1', 'speaker2'],
      description: 'Test description',
      core_topic: 'test',
      notes: 'Test notes',
      year: 2024,
      conference_name: 'Test Conference',
      format: 'talk'
    });
  });

  it('handles fetch error correctly', async () => {
    mockFetchFailure();

    const hook = renderHook(() => useTalks(false, TEST_FETCH_CONFIG), {
      wrapper: TestProvider
    });

    // Wait for retry logic to complete - using fast test config (10ms * 3 retries = 30ms)
    await waitFor(() => {
      expect(hook.result.current.loading).toBe(false);
    }, { timeout: 150 }); // Reduced from 8000ms

    // Check error state
    expect(hook.result.current.error).toBeInstanceOf(Error);
    expect(hook.result.current.talks).toEqual([]);
  });

  it('filters out invalid resource types', async () => {
    const invalidItem = { ...mockAirtableItem, resource_type: 'invalid' };
    mockFetchResponse([invalidItem]);

    const { result } = await renderUseTalksHook();

    // Check that invalid items are filtered out by real filterTalks function
    expect(result.current.error).toBeNull();
    expect(result.current.talks).toEqual([]);
  });

  it('correctly handles talks with empty notes', async () => {
    const emptyNotesItem = { ...mockAirtableItem, notes: '' };
    mockFetchResponse([emptyNotesItem]);

    const { result } = await renderUseTalksHook();

    // Check that empty notes are handled correctly by real hasMeaningfulNotes
    expect(result.current.error).toBeNull();
    expect(result.current.talks).toHaveLength(1);
    expect(result.current.talks[0].notes).toBeUndefined(); // Empty notes become undefined
  });

  /**
   * CONTEXT: Error Handling and Retry Strategy
   *
   * WHY: Network failures happen in production (CDN issues, DNS timeouts,
   * mobile connectivity). Immediate failure frustrates users when a simple
   * retry would succeed.
   *
   * RETRY LOGIC:
   * - Retries on: Network errors, HTTP errors (404, 500, etc.)
   * - NO retry on: Invalid JSON (fetch succeeded, data is broken)
   * - Exponential backoff: 10ms → 20ms → 40ms (test) / 1s → 2s → 4s (prod)
   * - User sees error only after all retries exhausted
   *
   * USER EXPERIENCE:
   * - Transient failures: Automatic recovery, seamless
   * - Persistent failures: Clear error message after reasonable attempts
   * - No hanging: Timeout ensures eventual completion
   */
  it('handles network errors correctly with retry logic', async () => {
    mockFetchError(new Error('Network error'));

    const hook = renderHook(() => useTalks(false, TEST_FETCH_CONFIG), {
      wrapper: TestProvider
    });

    // Wait for retry logic with fast test config (exponential: 10ms, 20ms, 40ms = 70ms total)
    await waitFor(() => {
      expect(hook.result.current.loading).toBe(false);
    }, { timeout: 150 }); // Reduced from 8000ms

    // Verify error state includes retry message
    expect(hook.result.current.error).toBeDefined();
    expect(hook.result.current.error?.message).toContain('Unable to load talks');
    expect(hook.result.current.error?.message).toContain('Network error');
    expect(hook.result.current.talks).toHaveLength(0);

    // Verify retry attempts were made
    expect(global.fetch).toHaveBeenCalledTimes(TEST_FETCH_CONFIG.maxRetries);
  });

  it('handles invalid JSON response', async () => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      })
    );

    const { result } = await renderUseTalksHook();

    // Verify error state includes error message
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toContain('Unable to load talks');
    expect(result.current.error?.message).toContain('Invalid JSON');
    expect(result.current.talks).toHaveLength(0);

    // JSON parsing errors don't trigger retry since fetch succeeded
    expect(global.fetch).toHaveBeenCalled();
  });

  it('handles HTTP error responses with retry logic', async () => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })
    );

    const hook = renderHook(() => useTalks(false, TEST_FETCH_CONFIG), {
      wrapper: TestProvider
    });

    // Wait for retry logic with fast test config
    await waitFor(() => {
      expect(hook.result.current.loading).toBe(false);
    }, { timeout: 150 }); // Reduced from 8000ms

    // Verify error state
    expect(hook.result.current.error).toBeDefined();
    expect(hook.result.current.error?.message).toContain('HTTP 404: Not Found');
    expect(hook.result.current.talks).toHaveLength(0);
    expect(global.fetch).toHaveBeenCalledTimes(TEST_FETCH_CONFIG.maxRetries);
  });

  it('handles invalid data format', async () => {
    mockFetchResponse({ invalid: 'data', not: 'array' });

    const { result } = await renderUseTalksHook();

    // Verify error state
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toContain('Invalid data format');
    expect(result.current.talks).toHaveLength(0);
  });

  it('filters talks by language', async () => {
    const nonEnglishTalk = { ...mockAirtableItem, airtable_id: '2', language: 'Spanish', name: 'Spanish Talk' };
    const englishTalk = { ...mockAirtableItem, airtable_id: '1', language: 'English', name: 'English Talk' };

    mockFetchResponse([nonEnglishTalk, englishTalk]);

    const { result } = await renderUseTalksHook();

    // Verify only English talks are included by real filterTalks
    expect(result.current.talks).toHaveLength(1);
    expect(result.current.talks[0].title).toBe('English Talk');
    expect(result.current.talks[0].id).toBe('1');
  });

  it('does not filter by rating by default', async () => {
    const lowRatingTalk = { ...mockAirtableItem, airtable_id: '2', rating: 2, name: 'Low Rating' };
    const highRatingTalk = { ...mockAirtableItem, airtable_id: '1', rating: 5, name: 'High Rating' };

    mockFetchResponse([lowRatingTalk, highRatingTalk]);

    const { result } = await renderUseTalksHook();

    // Verify both talks are included when filterByRating is false (default)
    expect(result.current.talks).toHaveLength(2);
    expect(result.current.talks.find(t => t.rating === 2)).toBeDefined();
    expect(result.current.talks.find(t => t.rating === 5)).toBeDefined();
  });

  it('handles missing optional fields with real transformation', async () => {
    const rawTalkWithMissingFields = {
      airtable_id: 'test-1',
      name: 'Test Talk',
      url: 'https://example.com',
      language: 'English',
      rating: 5,
      resource_type: 'talk'
    };

    mockFetchResponse([rawTalkWithMissingFields]);

    const { result } = await renderUseTalksHook();

    // Verify real transformAirtableItemToTalk applies default values
    expect(result.current.error).toBeNull();
    expect(result.current.talks).toHaveLength(1);
    const talk = result.current.talks[0];
    expect(talk.duration).toBe(0);
    expect(talk.topics).toEqual([]);
    expect(talk.speakers).toEqual([]);
    expect(talk.description).toBe('');
    expect(talk.core_topic).toBe('');
    expect(talk.notes).toBeUndefined();
    expect(talk.conference_name).toBeUndefined();
  });

  describe('End-to-End Data Transformation', () => {
    it('transforms complete Airtable items with all fields', async () => {
      const completeAirtableItem = {
        airtable_id: 'rec123',
        name: 'Advanced TypeScript Patterns',
        url: 'https://youtube.com/watch?v=abc',
        duration: 2700, // 45 minutes
        topics_names: ['typescript', 'patterns', 'advanced'],
        speakers_names: ['Jane Smith', 'John Doe'],
        description: 'Deep dive into advanced TypeScript patterns',
        core_topic: 'TypeScript',
        notes: 'Excellent coverage of generics and conditional types',
        language: 'English',
        rating: 5,
        resource_type: 'talk',
        year: 2024,
        conference_name: 'TSConf EU'
      };

      mockFetchResponse([completeAirtableItem]);
      const { result } = await renderUseTalksHook();

      // Verify complete end-to-end transformation
      expect(result.current.talks).toHaveLength(1);
      const talk = result.current.talks[0];
      expect(talk.id).toBe('rec123');
      expect(talk.title).toBe('Advanced TypeScript Patterns');
      expect(talk.url).toBe('https://youtube.com/watch?v=abc');
      expect(talk.duration).toBe(2700);
      expect(talk.topics).toEqual(['typescript', 'patterns', 'advanced']);
      expect(talk.speakers).toEqual(['Jane Smith', 'John Doe']);
      expect(talk.description).toBe('Deep dive into advanced TypeScript patterns');
      expect(talk.core_topic).toBe('TypeScript');
      expect(talk.notes).toBe('Excellent coverage of generics and conditional types');
      expect(talk.year).toBe(2024);
      expect(talk.conference_name).toBe('TSConf EU');
      expect(talk.rating).toBe(5);
      expect(talk.format).toBe('talk');
    });

    it('correctly transforms podcast format', async () => {
      const podcastItem = {
        airtable_id: 'rec456',
        name: 'Software Engineering Radio',
        url: 'https://example.com/podcast',
        resource_type: 'podcast',
        language: 'English',
        rating: 4
      };

      mockFetchResponse([podcastItem]);
      const { result } = await renderUseTalksHook();

      expect(result.current.talks).toHaveLength(1);
      expect(result.current.talks[0].format).toBe('podcast');
    });

    it('correctly transforms videopodcast format to podcast', async () => {
      const videoPodcastItem = {
        airtable_id: 'rec789',
        name: 'Video Podcast Episode',
        url: 'https://example.com/videopodcast',
        resource_type: 'videopodcast',
        language: 'English',
        rating: 4
      };

      mockFetchResponse([videoPodcastItem]);
      const { result } = await renderUseTalksHook();

      expect(result.current.talks).toHaveLength(1);
      expect(result.current.talks[0].format).toBe('podcast');
    });

    it('filters out non-English talks during processing', async () => {
      const items = [
        { ...mockAirtableItem, airtable_id: '1', language: 'English', name: 'English Talk' },
        { ...mockAirtableItem, airtable_id: '2', language: 'Spanish', name: 'Spanish Talk' },
        { ...mockAirtableItem, airtable_id: '3', language: 'French', name: 'French Talk' },
        { ...mockAirtableItem, airtable_id: '4', language: 'English', name: 'Another English Talk' }
      ];

      mockFetchResponse(items);
      const { result } = await renderUseTalksHook();

      // Only English talks should be processed
      expect(result.current.talks).toHaveLength(2);
      expect(result.current.talks[0].title).toBe('English Talk');
      expect(result.current.talks[1].title).toBe('Another English Talk');
    });

    it('treats missing language as English', async () => {
      const itemWithoutLanguage = {
        ...mockAirtableItem,
        language: undefined
      };

      mockFetchResponse([itemWithoutLanguage]);
      const { result } = await renderUseTalksHook();

      // Should be processed as English
      expect(result.current.talks).toHaveLength(1);
    });

    it('applies hasMeaningfulNotes logic during transformation', async () => {
      const items = [
        { ...mockAirtableItem, airtable_id: '1', notes: 'Real notes', name: 'Talk 1' },
        { ...mockAirtableItem, airtable_id: '2', notes: '   \n\t  ', name: 'Talk 2' },
        { ...mockAirtableItem, airtable_id: '3', notes: undefined, name: 'Talk 3' },
        { ...mockAirtableItem, airtable_id: '4', notes: '', name: 'Talk 4' }
      ];

      mockFetchResponse(items);
      const { result } = await renderUseTalksHook();

      expect(result.current.talks).toHaveLength(4);
      expect(result.current.talks[0].notes).toBe('Real notes');
      expect(result.current.talks[1].notes).toBeUndefined(); // Whitespace only
      expect(result.current.talks[2].notes).toBeUndefined(); // Undefined
      expect(result.current.talks[3].notes).toBeUndefined(); // Empty string
    });

    it('filters by valid resource types during processing', async () => {
      const items = [
        { ...mockAirtableItem, airtable_id: '1', resource_type: 'talk', name: 'Valid Talk' },
        { ...mockAirtableItem, airtable_id: '2', resource_type: 'podcast', name: 'Valid Podcast' },
        { ...mockAirtableItem, airtable_id: '3', resource_type: 'invalid', name: 'Invalid Type' },
        { ...mockAirtableItem, airtable_id: '4', resource_type: 'video', name: 'Valid Video' },
        { ...mockAirtableItem, airtable_id: '5', resource_type: 'book', name: 'Invalid Book' }
      ];

      mockFetchResponse(items);
      const { result } = await renderUseTalksHook();

      // Only valid resource types should be processed
      expect(result.current.talks).toHaveLength(3);
      expect(result.current.talks.map(t => t.title)).toEqual([
        'Valid Talk',
        'Valid Podcast',
        'Valid Video'
      ]);
    });
  });
});
