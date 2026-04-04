import { renderHook, waitFor, act } from '@testing-library/react';
import { useTalks } from './useTalks';
import { TestProvider } from '../test/context/TestContext';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Helper functions for mocking fetch using vi.spyOn (better isolation than global mutation)
const mockFetchResponse = (data: unknown) => {
  vi.spyOn(global, 'fetch').mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(data),
    } as Response)
  );
};

const mockFetchError = (error: Error) => {
  vi.spyOn(global, 'fetch').mockImplementation(() =>
    Promise.reject(error)
  );
};

const mockFetchFailure = (status = 404, statusText = 'Not Found') => {
  vi.spyOn(global, 'fetch').mockImplementation(() =>
    Promise.resolve({
      ok: false,
      status,
      statusText,
    } as Response)
  );
};

// Helper function for rendering hook and waiting for load
const renderUseTalksHook = async (timeout: number = 1000) => {
  const hook = renderHook(() => useTalks(), {
    wrapper: TestProvider
  });

  await waitFor(() => {
    expect(hook.result.current.loading).toBe(false);
  }, { timeout });

  return hook;
};

// Run all pending timers and flush microtasks for retry tests,
// then restore real timers so waitFor can proceed normally.
const runRetryTimersAndRestore = async () => {
  await act(async () => {
    await vi.runAllTimersAsync();
  });
  vi.useRealTimers();
};

describe('useTalks', () => {
  const mockTalk = {
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
    format: 'talk',
    rating: 5
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    mockFetchResponse([mockTalk]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('loads talks correctly from normalized JSON', async () => {
    const { result } = await renderUseTalksHook();

    expect(result.current.error).toBeNull();
    expect(result.current.talks).toHaveLength(1);
    expect(result.current.talks[0]).toEqual(mockTalk);
  });

  it('handles fetch error correctly', async () => {
    vi.useFakeTimers();
    vi.restoreAllMocks();
    mockFetchFailure();

    const hook = renderHook(() => useTalks(), { wrapper: TestProvider });

    await runRetryTimersAndRestore();

    await waitFor(() => {
      expect(hook.result.current.loading).toBe(false);
    });

    expect(hook.result.current.error).toBeInstanceOf(Error);
    expect(hook.result.current.talks).toEqual([]);
  });

  it('correctly handles talks with empty notes', async () => {
    const talkWithEmptyNotes = { ...mockTalk, notes: undefined };
    vi.restoreAllMocks();
    mockFetchResponse([talkWithEmptyNotes]);

    const { result } = await renderUseTalksHook();

    expect(result.current.error).toBeNull();
    expect(result.current.talks).toHaveLength(1);
    expect(result.current.talks[0].notes).toBeUndefined();
  });

  it('handles network errors correctly with retry logic', async () => {
    vi.useFakeTimers();
    vi.restoreAllMocks();
    mockFetchError(new Error('Network error'));

    const hook = renderHook(() => useTalks(), { wrapper: TestProvider });

    await runRetryTimersAndRestore();

    await waitFor(() => {
      expect(hook.result.current.loading).toBe(false);
    });

    expect(hook.result.current.error).toBeDefined();
    expect(hook.result.current.error?.message).toContain('Unable to load talks');
    expect(hook.result.current.error?.message).toContain('Network error');
    expect(hook.result.current.talks).toHaveLength(0);

    // Verify retry attempts were made (3 attempts total)
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('handles invalid JSON response', async () => {
    vi.restoreAllMocks();
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response)
    );

    const { result } = await renderUseTalksHook(3000);

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toContain('Unable to load talks');
    expect(result.current.error?.message).toContain('Invalid JSON');
    expect(result.current.talks).toHaveLength(0);

    // JSON parsing errors don't trigger retry since fetch succeeded
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('handles HTTP error responses with retry logic', async () => {
    vi.useFakeTimers();
    vi.restoreAllMocks();
    mockFetchFailure(404, 'Not Found');

    const hook = renderHook(() => useTalks(), { wrapper: TestProvider });

    await runRetryTimersAndRestore();

    await waitFor(() => {
      expect(hook.result.current.loading).toBe(false);
    });

    expect(hook.result.current.error).toBeDefined();
    expect(hook.result.current.error?.message).toContain('HTTP 404: Not Found');
    expect(hook.result.current.talks).toHaveLength(0);
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('handles invalid data format', async () => {
    vi.restoreAllMocks();
    mockFetchResponse({ invalid: 'data', not: 'array' });

    const { result } = await renderUseTalksHook();

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toContain('Invalid data format');
    expect(result.current.talks).toHaveLength(0);
  });

  it('filters talks by rating when requested', async () => {
    const lowRatingTalk = { ...mockTalk, rating: 2 };
    const highRatingTalk = { ...mockTalk, rating: 5 };

    vi.restoreAllMocks();
    mockFetchResponse([lowRatingTalk, highRatingTalk]);

    const { result } = renderHook(() => useTalks(true), { wrapper: TestProvider });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.talks).toHaveLength(1);
    expect(result.current.talks[0].rating).toBe(5);
  });

  it('handles talks with minimal fields', async () => {
    const minimalTalk = {
      id: 'test-1',
      title: 'Test Talk',
      url: 'https://example.com',
      duration: 0,
      topics: [],
      speakers: [],
      description: '',
      core_topic: '',
      rating: 5,
      format: 'talk',
      conference_name: ''
    };

    vi.restoreAllMocks();
    mockFetchResponse([minimalTalk]);

    const { result } = await renderUseTalksHook();

    expect(result.current.error).toBeNull();
    expect(result.current.talks).toHaveLength(1);
    const talk = result.current.talks[0];
    expect(talk.duration).toBe(0);
    expect(talk.topics).toEqual([]);
    expect(talk.speakers).toEqual([]);
    expect(talk.description).toBe('');
    expect(talk.core_topic).toBe('');
    expect(talk.notes).toBeUndefined();
  });
});
