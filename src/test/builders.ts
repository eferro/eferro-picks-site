import type { Talk } from '../types/talks';

/**
 * Test data builders. This module has no side effects (no vi.mock, no
 * global hooks) so any test can import it safely.
 */

export const mockTalk: Talk = {
  id: '1',
  title: 'Test Talk',
  speakers: ['Test Speaker'],
  conference_name: 'Test Conference',
  duration: 3600, // 1 hour in seconds
  topics: ['test'],
  core_topic: 'test',
  url: 'https://example.com',
  description: 'Test description',
  notes: undefined,
  format: 'talk',
  registered_at: '2023-01-01T00:00:00Z',
  rating: undefined
};

export const createTalk = (overrides: Partial<Talk> = {}): Talk => ({
  ...mockTalk,
  ...overrides
});

/**
 * Fixed "current year" for date-dependent tests: inject it (e.g. via
 * TalksFilter's _testCurrentYear) instead of reading new Date().
 */
export const FIXED_TEST_YEAR = 2025;

/** A year relative to FIXED_TEST_YEAR (negative offsets are in the past). */
export const createTestYear = (offset: number = 0): number => FIXED_TEST_YEAR + offset;

/** Talks at year offsets around a base year, for year boundary tests. */
export function createBoundaryYearTalks(baseYear: number) {
  return {
    current: createTalk({ id: 'current', year: baseYear }),
    minus1: createTalk({ id: 'minus1', year: baseYear - 1 }),
    minus2: createTalk({ id: 'minus2', year: baseYear - 2 }),
    minus3: createTalk({ id: 'minus3', year: baseYear - 3 }),
    minus4: createTalk({ id: 'minus4', year: baseYear - 4 }),
    minus5: createTalk({ id: 'minus5', year: baseYear - 5 }),
    minus6: createTalk({ id: 'minus6', year: baseYear - 6 }),
    before: createTalk({ id: 'before', year: baseYear - 1 }),
    exact: createTalk({ id: 'exact', year: baseYear }),
    after: createTalk({ id: 'after', year: baseYear + 1 }),
  };
}
