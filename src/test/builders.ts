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
