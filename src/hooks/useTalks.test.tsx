import { renderHook, waitFor, act } from '@testing-library/react';
import { useTalks } from './useTalks';
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
  const hook = renderHook(() => useTalks());

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
    mockFetchFailure();

    const hook = renderHook(() => useTalks());

    await runRetryTimersAndRestore();

    await waitFor(() => {
      expect(hook.result.current.loading).toBe(false);
    });

    expect(hook.result.current.error).toBeInstanceOf(Error);
    expect(hook.result.current.talks).toEqual([]);
  });

  it('handles network errors correctly with retry logic', async () => {
    vi.useFakeTimers();
    mockFetchError(new Error('Network error'));

    const hook = renderHook(() => useTalks());

    await runRetryTimersAndRestore();

    await waitFor(() => {
      expect(hook.result.current.loading).toBe(false);
    });

    expect(hook.result.current.error).toBeInstanceOf(Error);
    expect(hook.result.current.error?.message).toContain('Unable to load talks');
    expect(hook.result.current.error?.message).toContain('Network error');
    expect(hook.result.current.talks).toHaveLength(0);

    // Verify retry attempts were made (3 attempts total)
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('handles invalid JSON response', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response)
    );

    const { result } = await renderUseTalksHook(3000);

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain('Unable to load talks');
    expect(result.current.error?.message).toContain('Invalid JSON');
    expect(result.current.talks).toHaveLength(0);

    // JSON parsing errors don't trigger retry since fetch succeeded
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('handles HTTP error responses with retry logic', async () => {
    vi.useFakeTimers();
    mockFetchFailure(404, 'Not Found');

    const hook = renderHook(() => useTalks());

    await runRetryTimersAndRestore();

    await waitFor(() => {
      expect(hook.result.current.loading).toBe(false);
    });

    expect(hook.result.current.error).toBeInstanceOf(Error);
    expect(hook.result.current.error?.message).toContain('HTTP 404: Not Found');
    expect(hook.result.current.talks).toHaveLength(0);
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('handles invalid data format', async () => {
    mockFetchResponse({ invalid: 'data', not: 'array' });

    const { result } = await renderUseTalksHook();

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(
      'Unable to load talks: Invalid data format: expected an array of talks. Please check your connection and try again.'
    );
    expect(result.current.talks).toHaveLength(0);
  });

  describe('rating filter', () => {
    const nearlyTop = { ...mockTalk, id: 'four', rating: 4 };
    const top = { ...mockTalk, id: 'five', rating: 5 };

    beforeEach(() => {
      mockFetchResponse([nearlyTop, top]);
    });

    it('keeps talks of every rating by default', async () => {
      const { result } = await renderUseTalksHook();

      expect(result.current.talks.map(t => t.id)).toEqual(['four', 'five']);
    });

    it('keeps only 5-star talks when requested', async () => {
      const { result } = renderHook(() => useTalks(true));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.talks.map(t => t.id)).toEqual(['five']);
    });

    it('reloads with the new rating filter when it changes', async () => {
      const { result, rerender } = renderHook(({ topOnly }) => useTalks(topOnly), {
        initialProps: { topOnly: false },
      });
      await waitFor(() => expect(result.current.talks).toHaveLength(2));

      rerender({ topOnly: true });

      await waitFor(() => expect(result.current.talks.map(t => t.id)).toEqual(['five']));
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  it('starts loading with no talks and no error', () => {
    const { result } = renderHook(() => useTalks());

    expect(result.current).toEqual({ talks: [], loading: true, error: null });
  });

  it('clears a previous error when it reloads successfully', async () => {
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve('not an array') } as Response)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([mockTalk]) } as Response);
    const { result, rerender } = renderHook(({ topOnly }) => useTalks(topOnly), {
      initialProps: { topOnly: false },
    });
    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));

    rerender({ topOnly: true });

    await waitFor(() => expect(result.current.talks).toHaveLength(1));
    expect(result.current.error).toBeNull();
  });

  it('fetches the talks data file', async () => {
    await renderUseTalksHook();

    expect(global.fetch).toHaveBeenCalledWith(`${import.meta.env.BASE_URL}data/talks.json`);
  });

  describe('retry with exponential backoff', () => {
    const advance = async (ms: number) => {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(ms);
      });
    };

    it('waits 1s before the second attempt and 2s before the third', async () => {
      vi.useFakeTimers();
      mockFetchError(new Error('Network error'));

      renderHook(() => useTalks());
      await advance(0);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      await advance(999);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      await advance(1);
      expect(global.fetch).toHaveBeenCalledTimes(2);

      await advance(1999);
      expect(global.fetch).toHaveBeenCalledTimes(2);
      await advance(1);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('recovers when a retry succeeds after a failed attempt', async () => {
      vi.useFakeTimers();
      vi.spyOn(global, 'fetch')
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([mockTalk]) } as Response);

      const { result } = renderHook(() => useTalks());
      await advance(1000);

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.talks).toEqual([mockTalk]);
    });
  });
});
