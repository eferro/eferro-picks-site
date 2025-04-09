import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { useTalks } from './useTalks';

describe('useTalks', () => {
  beforeAll(() => {
    // Set BASE_URL for testing
    // @ts-ignore
    import.meta.env = import.meta.env || {};
    // @ts-ignore
    import.meta.env.BASE_URL = '/';
  });

  it('loads and filters talks from the real data file', async () => {
    const { result } = renderHook(() => useTalks());

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
}); 