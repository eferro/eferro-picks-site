import { describe, it, expect } from 'vitest';
import { formatDuration } from './format';

describe('formatDuration', () => {
  describe('edge cases', () => {
    it('returns "0m" for zero seconds', () => {
      expect(formatDuration(0)).toBe('0m');
    });

    it('returns "0m" for negative values', () => {
      expect(formatDuration(-5)).toBe('0m');
      expect(formatDuration(-100)).toBe('0m');
      expect(formatDuration(-3600)).toBe('0m');
    });

    it('returns "0m" for null/undefined values', () => {
      expect(formatDuration(null as never)).toBe('0m');
      expect(formatDuration(undefined as never)).toBe('0m');
    });

    it('handles decimal values correctly', () => {
      expect(formatDuration(3600.5)).toBe('1h 0m');
      expect(formatDuration(90.7)).toBe('1m');
      expect(formatDuration(30.9)).toBe('30.9s');
    });

    it('handles very large numbers', () => {
      expect(formatDuration(36000)).toBe('10h 0m'); // 10 hours
      expect(formatDuration(86400)).toBe('24h 0m'); // 24 hours
    });
  });

  describe('seconds only', () => {
    it('formats seconds correctly when less than a minute', () => {
      expect(formatDuration(1)).toBe('1s');
      expect(formatDuration(30)).toBe('30s');
      expect(formatDuration(45)).toBe('45s');
      expect(formatDuration(59)).toBe('59s');
    });
  });

  describe('minutes only', () => {
    it('formats minutes correctly when less than an hour', () => {
      expect(formatDuration(60)).toBe('1m');
      expect(formatDuration(90)).toBe('1m');
      expect(formatDuration(120)).toBe('2m');
      expect(formatDuration(300)).toBe('5m');
      expect(formatDuration(1800)).toBe('30m');
      expect(formatDuration(3540)).toBe('59m'); // 59 minutes
    });
  });

  describe('hours and minutes', () => {
    it('formats hours and minutes correctly', () => {
      expect(formatDuration(3600)).toBe('1h 0m'); // exactly 1 hour
      expect(formatDuration(3660)).toBe('1h 1m'); // 1 hour 1 minute
      expect(formatDuration(3661)).toBe('1h 1m'); // 1 hour 1 minute 1 second (seconds ignored)
      expect(formatDuration(7200)).toBe('2h 0m'); // exactly 2 hours
      expect(formatDuration(7260)).toBe('2h 1m'); // 2 hours 1 minute
      expect(formatDuration(5400)).toBe('1h 30m'); // 1 hour 30 minutes
    });

    it('ignores seconds when hours are present', () => {
      expect(formatDuration(3661)).toBe('1h 1m'); // 1h 1m 1s -> 1h 1m
      expect(formatDuration(3720)).toBe('1h 2m'); // 1h 2m 0s -> 1h 2m
      expect(formatDuration(3659)).toBe('1h 0m'); // 1h 0m 59s -> 1h 0m
    });
  });

  describe('boundary values', () => {
    it('handles exact minute boundaries', () => {
      expect(formatDuration(59)).toBe('59s'); // Just under 1 minute
      expect(formatDuration(60)).toBe('1m'); // Exactly 1 minute
      expect(formatDuration(61)).toBe('1m'); // Just over 1 minute
    });

    it('handles exact hour boundaries', () => {
      expect(formatDuration(3599)).toBe('59m'); // Just under 1 hour
      expect(formatDuration(3600)).toBe('1h 0m'); // Exactly 1 hour
      expect(formatDuration(3601)).toBe('1h 0m'); // Just over 1 hour
    });
  });

  describe('real-world scenarios', () => {
    it('handles typical talk durations', () => {
      expect(formatDuration(300)).toBe('5m'); // 5 minute lightning talk
      expect(formatDuration(1200)).toBe('20m'); // 20 minute talk
      expect(formatDuration(1800)).toBe('30m'); // 30 minute talk
      expect(formatDuration(2700)).toBe('45m'); // 45 minute talk
      expect(formatDuration(3600)).toBe('1h 0m'); // 1 hour talk
      expect(formatDuration(5400)).toBe('1h 30m'); // 1.5 hour talk
      expect(formatDuration(7200)).toBe('2h 0m'); // 2 hour workshop
    });

    it('handles workshop durations', () => {
      expect(formatDuration(10800)).toBe('3h 0m'); // 3 hour workshop
      expect(formatDuration(14400)).toBe('4h 0m'); // 4 hour workshop
      expect(formatDuration(16200)).toBe('4h 30m'); // 4.5 hour workshop
      expect(formatDuration(21600)).toBe('6h 0m'); // 6 hour workshop
    });
  });
});