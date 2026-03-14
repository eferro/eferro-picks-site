import { describe, it, expect } from 'vitest';
import { formatDuration } from './format';

// Time constants for better readability
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const ONE_HOUR_PLUS_FRACTION = SECONDS_PER_HOUR + 0.5;
const ONE_MINUTE_PLUS_HALF = SECONDS_PER_MINUTE + 30;
const ONE_MINUTE_PLUS_FRACTION = ONE_MINUTE_PLUS_HALF + 0.7;
const HALF_MINUTE = 30;
const HALF_MINUTE_WITH_FRACTION = HALF_MINUTE + 0.9;
const ONE_HOUR_PLUS_59_SECONDS = SECONDS_PER_HOUR + 59;
const TEN_HOURS = 10 * SECONDS_PER_HOUR;
const TWENTY_FOUR_HOURS = 24 * SECONDS_PER_HOUR;

describe('formatDuration', () => {
  describe('edge cases', () => {
    it('returns "0m" for zero seconds', () => {
      expect(formatDuration(0)).toBe('0m');
    });

    it('returns "0m" for negative values', () => {
      expect(formatDuration(-5)).toBe('0m');
      expect(formatDuration(-100)).toBe('0m');
      expect(formatDuration(-SECONDS_PER_HOUR)).toBe('0m');
    });

    it('returns "0m" for null/undefined values', () => {
      expect(formatDuration(null as never)).toBe('0m');
      expect(formatDuration(undefined as never)).toBe('0m');
    });

    it('returns "0m" for NaN values', () => {
      expect(formatDuration(Number.NaN)).toBe('0m');
    });

    it('handles decimal values correctly', () => {
      expect(formatDuration(ONE_HOUR_PLUS_FRACTION)).toBe('1h 0m');
      expect(formatDuration(ONE_MINUTE_PLUS_FRACTION)).toBe('1m');
      expect(formatDuration(HALF_MINUTE_WITH_FRACTION)).toBe('30.9s');
    });

    it('handles very large numbers', () => {
      expect(formatDuration(TEN_HOURS)).toBe('10h 0m');
      expect(formatDuration(TWENTY_FOUR_HOURS)).toBe('24h 0m');
    });
  });

  describe('seconds only', () => {
    it('formats seconds correctly when less than a minute', () => {
      expect(formatDuration(1)).toBe('1s');
      expect(formatDuration(HALF_MINUTE)).toBe('30s');
      expect(formatDuration(45)).toBe('45s');
      expect(formatDuration(59)).toBe('59s');
    });
  });

  describe('minutes only', () => {
    it('formats minutes correctly when less than an hour', () => {
      expect(formatDuration(SECONDS_PER_MINUTE)).toBe('1m');
      expect(formatDuration(ONE_MINUTE_PLUS_HALF)).toBe('1m');
      expect(formatDuration(2 * SECONDS_PER_MINUTE)).toBe('2m');
      expect(formatDuration(5 * SECONDS_PER_MINUTE)).toBe('5m');
      expect(formatDuration(30 * SECONDS_PER_MINUTE)).toBe('30m');
      expect(formatDuration(59 * SECONDS_PER_MINUTE)).toBe('59m');
    });
  });

  describe('hours and minutes', () => {
    it('formats hours and minutes correctly', () => {
      expect(formatDuration(SECONDS_PER_HOUR)).toBe('1h 0m'); // exactly 1 hour
      expect(formatDuration(SECONDS_PER_HOUR + SECONDS_PER_MINUTE)).toBe('1h 1m'); // 1 hour 1 minute
      expect(formatDuration(SECONDS_PER_HOUR + SECONDS_PER_MINUTE + 1)).toBe('1h 1m'); // 1 hour 1 minute 1 second (seconds ignored)
      expect(formatDuration(2 * SECONDS_PER_HOUR)).toBe('2h 0m'); // exactly 2 hours
      expect(formatDuration(2 * SECONDS_PER_HOUR + SECONDS_PER_MINUTE)).toBe('2h 1m'); // 2 hours 1 minute
      expect(formatDuration(SECONDS_PER_HOUR + 30 * SECONDS_PER_MINUTE)).toBe('1h 30m'); // 1 hour 30 minutes
    });

    it('ignores seconds when hours are present', () => {
      expect(formatDuration(SECONDS_PER_HOUR + SECONDS_PER_MINUTE + 1)).toBe('1h 1m'); // 1h 1m 1s -> 1h 1m
      expect(formatDuration(SECONDS_PER_HOUR + 2 * SECONDS_PER_MINUTE)).toBe('1h 2m'); // 1h 2m 0s -> 1h 2m
      expect(formatDuration(ONE_HOUR_PLUS_59_SECONDS)).toBe('1h 0m'); // 1h 0m 59s -> 1h 0m
    });
  });

  describe('boundary values', () => {
    it('handles exact minute boundaries', () => {
      expect(formatDuration(SECONDS_PER_MINUTE - 1)).toBe('59s'); // Just under 1 minute
      expect(formatDuration(SECONDS_PER_MINUTE)).toBe('1m'); // Exactly 1 minute
      expect(formatDuration(SECONDS_PER_MINUTE + 1)).toBe('1m'); // Just over 1 minute
    });

    it('handles exact hour boundaries', () => {
      expect(formatDuration(SECONDS_PER_HOUR - 1)).toBe('59m'); // Just under 1 hour
      expect(formatDuration(SECONDS_PER_HOUR)).toBe('1h 0m'); // Exactly 1 hour
      expect(formatDuration(SECONDS_PER_HOUR + 1)).toBe('1h 0m'); // Just over 1 hour
    });
  });

  describe('real-world scenarios', () => {
    it('handles typical talk durations', () => {
      expect(formatDuration(5 * SECONDS_PER_MINUTE)).toBe('5m'); // 5 minute lightning talk
      expect(formatDuration(20 * SECONDS_PER_MINUTE)).toBe('20m'); // 20 minute talk
      expect(formatDuration(30 * SECONDS_PER_MINUTE)).toBe('30m'); // 30 minute talk
      expect(formatDuration(45 * SECONDS_PER_MINUTE)).toBe('45m'); // 45 minute talk
      expect(formatDuration(SECONDS_PER_HOUR)).toBe('1h 0m'); // 1 hour talk
      expect(formatDuration(SECONDS_PER_HOUR + 30 * SECONDS_PER_MINUTE)).toBe('1h 30m'); // 1.5 hour talk
      expect(formatDuration(2 * SECONDS_PER_HOUR)).toBe('2h 0m'); // 2 hour workshop
    });

    it('handles workshop durations', () => {
      expect(formatDuration(3 * SECONDS_PER_HOUR)).toBe('3h 0m'); // 3 hour workshop
      expect(formatDuration(4 * SECONDS_PER_HOUR)).toBe('4h 0m'); // 4 hour workshop
      expect(formatDuration(4 * SECONDS_PER_HOUR + 30 * SECONDS_PER_MINUTE)).toBe('4h 30m'); // 4.5 hour workshop
      expect(formatDuration(6 * SECONDS_PER_HOUR)).toBe('6h 0m'); // 6 hour workshop
    });
  });
});
