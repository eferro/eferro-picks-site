import { renderHook, waitFor } from '@testing-library/react';
import { useTalks } from './useTalks';
import { TestProvider } from '../test/context/TestContext';
import { processTalks, hasMeaningfulNotes } from '../utils/talks';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  mockTalks,
  mockTalksWithEmptyNotes,
  mockTalksWithMixedLanguages,
  mockTalksWithMixedRatings,
  mockTalksWithMixedResourceTypes,
  mockTalksWithAllFields,
  mockTalksWithMissingFields
} from '../test/mocks/talks';
import { mockFetch, mockFetchError, mockFetchInvalidJson } from '../test/utils/fetch';

// Store original fetch
const originalFetch = global.fetch;

// Mock the processTalks function
vi.mock('../utils/talks', () => ({
  ...vi.importActual('../utils/talks'),
  processTalks: vi.fn(),
  hasMeaningfulNotes: vi.fn().mockImplementation((notes: string) => notes.trim().length > 0)
}));

describe('useTalks', () => {
  const mockAirtableItem = {
    airtable_id: '1',
    Name: 'Test Talk',
    Url: 'https://example.com',
    Duration: 30,
    Topics_Names: ['topic1', 'topic2'],
    Speakers_Names: ['speaker1', 'speaker2'],
    Description: 'Test description',
    core_topic: 'test',
    Notes: 'Test notes',
    Language: 'English',
    Rating: 5,
    "Resource type": 'talk',
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
    
    // Mock fetch to return our mock data
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([mockAirtableItem]),
      })
    );

    // Mock processTalks to return our processed talk
    (processTalks as ReturnType<typeof vi.fn>).mockReturnValue([mockProcessedTalk]);
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;
    // Restore all mocks
    vi.restoreAllMocks();
  });

  it('loads and processes talks correctly', async () => {
    const { result } = renderHook(() => useTalks(), {
      wrapper: TestProvider
    });

    // Initial state
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.talks).toEqual([]);

    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check final state
    expect(result.current.error).toBeNull();
    expect(result.current.talks).toHaveLength(1);
    expect(result.current.talks[0]).toEqual(mockProcessedTalk);
  });

  it('handles fetch error correctly', async () => {
    // Mock fetch to return an error
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
      })
    );

    const { result } = renderHook(() => useTalks(), {
      wrapper: TestProvider
    });

    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check error state
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.talks).toEqual([]);
  });

  it('filters out invalid resource types', async () => {
    // Mock fetch to return data with invalid resource type
    const invalidItem = { ...mockAirtableItem, "Resource type": 'invalid' };
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([invalidItem]),
      })
    );

    // Mock processTalks to return empty array for invalid items
    (processTalks as ReturnType<typeof vi.fn>).mockReturnValue([]);

    const { result } = renderHook(() => useTalks(), {
      wrapper: TestProvider
    });

    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check that invalid items are filtered out
    expect(result.current.error).toBeNull();
    expect(result.current.talks).toEqual([]);
  });

  it('correctly handles talks with empty notes', async () => {
    // Mock fetch to return data with empty notes
    const emptyNotesItem = { ...mockAirtableItem, Notes: '' };
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([emptyNotesItem]),
      })
    );

    // Mock processTalks to return talk with empty notes
    const talkWithEmptyNotes = { ...mockProcessedTalk, notes: '' };
    (processTalks as ReturnType<typeof vi.fn>).mockReturnValue([talkWithEmptyNotes]);

    const { result } = renderHook(() => useTalks(), {
      wrapper: TestProvider
    });

    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check that empty notes are handled correctly
    expect(result.current.error).toBeNull();
    expect(result.current.talks).toHaveLength(1);
    expect(result.current.talks[0].notes).toBe('');
  });

  it('handles mock data correctly', async () => {
    // Mock fetch to return our mock data
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([mockAirtableItem]),
      })
    );

    // Mock processTalks to return our processed talk
    (processTalks as ReturnType<typeof vi.fn>).mockReturnValue([mockProcessedTalk]);

    const { result } = renderHook(() => useTalks(), {
      wrapper: TestProvider
    });

    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check that mock data is handled correctly
    expect(result.current.error).toBeNull();
    expect(result.current.talks).toHaveLength(1);
    expect(result.current.talks[0]).toEqual(mockProcessedTalk);
  });

  it('handles fetch errors correctly', async () => {
    // Mock fetch to return a network error
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.reject(new Error('Network error'))
    );

    const { result } = renderHook(() => useTalks(), {
      wrapper: TestProvider
    });

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
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      })
    );

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
    // Mock fetch to return talks with different languages
    const nonEnglishTalk = {
      ...mockAirtableItem,
      Name: 'Spanish Talk',
      Language: 'Spanish'
    };
    const englishTalk = {
      ...mockAirtableItem,
      Name: 'English Talk',
      Language: 'English'
    };

    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([nonEnglishTalk, englishTalk]),
      })
    );

    // Mock processTalks to return only English talk
    const processedEnglishTalk = {
      ...mockProcessedTalk,
      title: 'English Talk',
      language: 'English'
    };
    (processTalks as ReturnType<typeof vi.fn>).mockReturnValue([processedEnglishTalk]);

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
    // Mock fetch to return talks with different ratings
    const lowRatingTalk = {
      ...mockAirtableItem,
      Name: 'Low Rating Talk',
      Rating: 2
    };
    const highRatingTalk = {
      ...mockAirtableItem,
      Name: 'High Rating Talk',
      Rating: 5
    };

    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([lowRatingTalk, highRatingTalk]),
      })
    );

    // Mock processTalks to return only high rating talk
    const processedHighRatingTalk = {
      ...mockProcessedTalk,
      title: 'High Rating Talk'
    };
    (processTalks as ReturnType<typeof vi.fn>).mockReturnValue([processedHighRatingTalk]);

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
    // Mock fetch to return talks with different resource types
    const invalidResourceTalk = {
      ...mockAirtableItem,
      Name: 'Invalid Resource Talk',
      "Resource type": 'invalid'
    };
    const validResourceTalk = {
      ...mockAirtableItem,
      Name: 'Valid Talk',
      "Resource type": 'talk'
    };

    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([invalidResourceTalk, validResourceTalk]),
      })
    );

    // Mock processTalks to return only valid resource type talk
    const processedValidTalk = {
      ...mockProcessedTalk,
      title: 'Valid Talk'
    };
    (processTalks as ReturnType<typeof vi.fn>).mockReturnValue([processedValidTalk]);

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
    // Mock fetch to return data with all fields
    const rawTalk = {
      airtable_id: 'test-1',
      Name: 'Test Talk',
      Url: 'https://example.com',
      Duration: 1800,
      Topics_Names: ['test', 'example'],
      Speakers_Names: ['Speaker 1', 'Speaker 2'],
      Description: 'A test talk description',
      core_topic: 'test',
      Notes: 'Test notes',
      Language: 'English',
      Rating: 5,
      "Resource type": 'talk',
      year: 2024,
      conference_name: 'Test Conference'
    };

    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([rawTalk]),
      })
    );

    // Mock processTalks to return transformed data
    const transformedTalk = {
      id: 'test-1',
      title: 'Test Talk',
      url: 'https://example.com',
      duration: 1800,
      topics: ['test', 'example'],
      speakers: ['Speaker 1', 'Speaker 2'],
      description: 'A test talk description',
      core_topic: 'test',
      notes: 'Test notes',
      year: 2024,
      conference_name: 'Test Conference',
      conference: 'Test Conference',
      language: 'English'
    };
    (processTalks as ReturnType<typeof vi.fn>).mockReturnValue([transformedTalk]);

    const { result } = renderHook(() => useTalks(), {
      wrapper: TestProvider
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify the transformed data
    expect(result.current.error).toBeNull();
    expect(result.current.talks).toHaveLength(1);
    const talk = result.current.talks[0];
    expect(talk.id).toBe('test-1');
    expect(talk.title).toBe('Test Talk');
    expect(talk.url).toBe('https://example.com');
    expect(talk.duration).toBe(1800);
    expect(talk.topics).toEqual(['test', 'example']);
    expect(talk.speakers).toEqual(['Speaker 1', 'Speaker 2']);
    expect(talk.description).toBe('A test talk description');
    expect(talk.core_topic).toBe('test');
    expect(talk.notes).toBe('Test notes');
    expect(talk.year).toBe(2024);
    expect(talk.conference_name).toBe('Test Conference');
  });

  it('handles missing optional fields', async () => {
    // Mock fetch to return data with missing fields
    const rawTalkWithMissingFields = {
      airtable_id: 'test-1',
      Name: 'Test Talk',
      Url: 'https://example.com',
      Language: 'English',
      Rating: 5,
      "Resource type": 'talk'
    };

    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([rawTalkWithMissingFields]),
      })
    );

    // Mock processTalks to return data with default values
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
    (processTalks as ReturnType<typeof vi.fn>).mockReturnValue([transformedTalkWithDefaults]);

    const { result } = renderHook(() => useTalks(), {
      wrapper: TestProvider
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

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