import { createTalk } from './utils';
import type { Talk } from '../types/talks';

/**
 * Fixed year for deterministic testing
 * All time-dependent tests should use this instead of new Date().getFullYear()
 */
export const FIXED_TEST_YEAR = 2025;

/**
 * Create a test year with offset from fixed year
 * @param offset - Years to offset from FIXED_TEST_YEAR (negative for past, positive for future)
 */
export function createTestYear(offset: number = 0): number {
  return FIXED_TEST_YEAR + offset;
}

/**
 * Create multiple talks with sequential IDs and customizable template
 * @param count - Number of talks to create
 * @param template - Template object to merge with each talk
 */
export function createManyTalks(count: number, template: Partial<Talk> = {}): Talk[] {
  return Array.from({ length: count }, (_, i) =>
    createTalk({
      id: `${i}`,
      title: template.title || `Talk ${i}`,
      topics: template.topics || [`Topic${i}`],
      speakers: template.speakers || [`Speaker${i}`],
      ...template
    })
  );
}

/**
 * Create talks spanning a range of years
 * @param startYear - Starting year (most recent)
 * @param count - Number of years to span
 */
export function createYearRangeTalks(startYear: number, count: number): Talk[] {
  return Array.from({ length: count }, (_, i) =>
    createTalk({
      id: `year-${i}`,
      year: startYear - i,
      title: `Talk from ${startYear - i}`
    })
  );
}

/**
 * Create talks for testing year boundary conditions
 * Returns talks at specific year offsets from a base year
 */
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
