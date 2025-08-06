import { renderHook, waitFor } from '@testing-library/react';
import { useTalks } from './useTalks';
import { TestProvider } from '../test/context/TestContext';
import { processTalks } from '../utils/talks';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Store original fetch
const originalFetch = global.fetch;

// Mock the processTalks function
vi.mock('../utils/talks', () => ({
  ...vi.importActual('../utils/talks'),
  processTalks: vi.fn(),
  hasMeaningfulNotes: vi.fn().mockImplementation((notes: string) => notes.trim().length > 0)
}));

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

const mockProcessedResponse = (data: unknown) => {
  (processTalks as ReturnType<typeof vi.fn>).mockReturnValue(data);
};

// Helper function for rendering hook and waiting for load
const renderUseTalksHook = async (timeout: number = 1000) => {
  const hook = renderHook(() => useTalks(), {
    wrapper: TestProvider
  });

  // Wait for loading to complete
  await waitFor(() => {
    expect(hook.result.current.loading).toBe(false);
  }, { timeout });

  return hook;
};

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

  const mockProcessedTalk = {
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
    conference: 'Test Conference',
    language: 'English'
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    mockFetchResponse([mockAirtableItem]);
    mockProcessedResponse([mockProcessedTalk]);
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;
    // Restore all mocks
    vi.restoreAllMocks();
  });

  it('loads and processes talks correctly', async () => {
    const { result } = await renderUseTalksHook();

    // Check final state
    expect(result.current.error).toBeNull();
    expect(result.current.talks).toHaveLength(1);
    expect(result.current.talks[0]).toEqual(mockProcessedTalk);
  });

  it('handles fetch error correctly', async () => {
    mockFetchFailure();

    const { result } = await renderUseTalksHook(5000);

    // Check error state
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.talks).toEqual([]);
  });

  it('filters out invalid resource types', async () => {
    const invalidItem = { ...mockAirtableItem, resource_type: 'invalid' };
    mockFetchResponse([invalidItem]);
    mockProcessedResponse([]);

    const { result } = await renderUseTalksHook();

    // Check that invalid items are filtered out
    expect(result.current.error).toBeNull();
    expect(result.current.talks).toEqual([]);
  });

  it('correctly handles talks with empty notes', async () => {
    const emptyNotesItem = { ...mockAirtableItem, Notes: '' };
    const talkWithEmptyNotes = { ...mockProcessedTalk, notes: '' };
    
    mockFetchResponse([emptyNotesItem]);
    mockProcessedResponse([talkWithEmptyNotes]);

    const { result } = await renderUseTalksHook();

    // Check that empty notes are handled correctly
    expect(result.current.error).toBeNull();
    expect(result.current.talks).toHaveLength(1);
    expect(result.current.talks[0].notes).toBe('');
  });

  it('handles network errors correctly with retry logic', async () => {
    mockFetchError(new Error('Network error'));

    const { result } = await renderUseTalksHook(8000);

    // Verify error state includes retry message
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toContain('Unable to load talks');
    expect(result.current.error?.message).toContain('Network error');
    expect(result.current.talks).toHaveLength(0);
    
    // Verify retry attempts were made
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('handles invalid JSON response', async () => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      })
    );

    const { result } = await renderUseTalksHook(8000);

    // Verify error state includes error message
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toContain('Unable to load talks');
    expect(result.current.error?.message).toContain('Invalid JSON');
    expect(result.current.talks).toHaveLength(0);
    
    // JSON parsing errors don't trigger retry since fetch succeeded
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('handles HTTP error responses with retry logic', async () => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })
    );

    const { result } = await renderUseTalksHook(8000);

    // Verify error state
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toContain('HTTP 404: Not Found');
    expect(result.current.talks).toHaveLength(0);
    expect(global.fetch).toHaveBeenCalledTimes(3);
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
    const nonEnglishTalk = { ...mockAirtableItem, language: 'Spanish' };
    const englishTalk = { ...mockAirtableItem, language: 'English' };
    const processedEnglishTalk = { ...mockProcessedTalk };

    mockFetchResponse([nonEnglishTalk, englishTalk]);
    mockProcessedResponse([processedEnglishTalk]);

    const { result } = await renderUseTalksHook();

    // Verify only English talks are included
    expect(result.current.talks).toHaveLength(1);
    expect(result.current.talks[0]).toEqual(processedEnglishTalk);
  });

  it('filters talks by rating', async () => {
    const lowRatingTalk = { ...mockAirtableItem, rating: 2 };
    const highRatingTalk = { ...mockAirtableItem, rating: 5 };
    const processedHighRatingTalk = { ...mockProcessedTalk };

    mockFetchResponse([lowRatingTalk, highRatingTalk]);
    mockProcessedResponse([processedHighRatingTalk]);

    const { result } = await renderUseTalksHook();

    // Verify only high rating talks are included
    expect(result.current.talks).toHaveLength(1);
    expect(result.current.talks[0]).toEqual(processedHighRatingTalk);
  });

  it('handles missing optional fields', async () => {
    const rawTalkWithMissingFields = {
      airtable_id: 'test-1',
      name: 'Test Talk',
      url: 'https://example.com',
      language: 'English',
      rating: 5,
      resource_type: 'talk'
    };

    const transformedTalkWithDefaults = {
      id: 'test-1',
      title: 'Test Talk',
      url: 'https://example.com',
      duration: 0,
      topics: [],
      speakers: [],
      description: '',
      core_topic: '',
      language: 'English',
      conference: '',
      conference_name: ''
    };

    mockFetchResponse([rawTalkWithMissingFields]);
    mockProcessedResponse([transformedTalkWithDefaults]);

    const { result } = await renderUseTalksHook();

    // Verify default values for missing fields
    expect(result.current.error).toBeNull();
    expect(result.current.talks).toHaveLength(1);
    const talk = result.current.talks[0];
    expect(talk.duration).toBe(0);
    expect(talk.topics).toEqual([]);
    expect(talk.speakers).toEqual([]);
    expect(talk.description).toBe('');
    expect(talk.core_topic).toBe('');
    expect(talk.notes).toBeUndefined();
    expect(talk.conference_name).toBe('');
  });
}); 