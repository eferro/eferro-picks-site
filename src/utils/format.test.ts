import { describe, it, expect } from 'vitest';
import { formatDuration } from './format';

describe('formatDuration', () => {
  describe('invalid input guard (returns "0m")', () => {
    it('returns "0m" for zero (the `<= 0` boundary)', () => {
      expect(formatDuration(0)).toBe('0m');
    });

    it('returns "0m" for negative values', () => {
      expect(formatDuration(-1)).toBe('0m');
      expect(formatDuration(-5)).toBe('0m');
      expect(formatDuration(-100)).toBe('0m');
      expect(formatDuration(-3600)).toBe('0m');
    });

    it('returns "0m" for null/undefined values', () => {
      expect(formatDuration(null as never)).toBe('0m');
      expect(formatDuration(undefined as never)).toBe('0m');
    });

    it('returns "0m" for NaN values', () => {
      expect(formatDuration(Number.NaN)).toBe('0m');
    });
  });

  describe('seconds branch (hours = 0, minutes = 0)', () => {
    it('formats whole seconds under a minute', () => {
      expect(formatDuration(1)).toBe('1s');
      expect(formatDuration(30)).toBe('30s');
      expect(formatDuration(45)).toBe('45s');
      expect(formatDuration(59)).toBe('59s'); // just under 1 minute (> vs >= boundary)
    });

    it('preserves fractional seconds (no Math.floor on the seconds branch)', () => {
      expect(formatDuration(30.5)).toBe('30.5s');
      expect(formatDuration(30.9)).toBe('30.9s');
    });
  });

  describe('minutes branch (hours = 0, minutes > 0)', () => {
    it('formats whole minutes under an hour', () => {
      expect(formatDuration(60)).toBe('1m'); // exactly 1 minute (boundary)
      expect(formatDuration(61)).toBe('1m'); // just over 1 minute
      expect(formatDuration(90)).toBe('1m'); // seconds dropped
      expect(formatDuration(119)).toBe('1m'); // 1m 59s -> 1m
      expect(formatDuration(120)).toBe('2m');
      expect(formatDuration(150)).toBe('2m'); // 150/60=2.5 -> floor 2 (kills * vs / and floor removal)
      expect(formatDuration(180)).toBe('3m'); // 180/60=3 vs 180*60 huge (non-identity divisor)
      expect(formatDuration(300)).toBe('5m');
      expect(formatDuration(1200)).toBe('20m');
      expect(formatDuration(1800)).toBe('30m');
      expect(formatDuration(2700)).toBe('45m');
      expect(formatDuration(3540)).toBe('59m'); // 59 minutes
      expect(formatDuration(3599)).toBe('59m'); // just under 1 hour (boundary)
    });

    it('floors fractional minutes', () => {
      expect(formatDuration(90.1)).toBe('1m'); // 1.50... -> 1
      expect(formatDuration(90.7)).toBe('1m');
      expect(formatDuration(150.9)).toBe('2m'); // 2.51... -> 2
    });
  });

  describe('hours branch (hours > 0)', () => {
    it('formats hours and minutes, ignoring leftover seconds', () => {
      expect(formatDuration(3600)).toBe('1h 0m'); // exactly 1 hour (boundary)
      expect(formatDuration(3601)).toBe('1h 0m'); // just over 1 hour
      expect(formatDuration(3659)).toBe('1h 0m'); // 1h 0m 59s -> seconds dropped
      expect(formatDuration(3660)).toBe('1h 1m');
      expect(formatDuration(3661)).toBe('1h 1m'); // 1h 1m 1s -> seconds dropped
      expect(formatDuration(3720)).toBe('1h 2m');
      expect(formatDuration(4260)).toBe('1h 11m'); // 4260 % 3600 = 660s = 11m (kills % vs +)
      expect(formatDuration(5400)).toBe('1h 30m');
      expect(formatDuration(7199)).toBe('1h 59m'); // just under 2 hours
      expect(formatDuration(7200)).toBe('2h 0m'); // exactly 2 hours
      expect(formatDuration(7201)).toBe('2h 0m'); // just over 2 hours
      expect(formatDuration(7260)).toBe('2h 1m'); // 7260/3600=2.01h (kills * vs /)
    });

    it('floors fractional hours and minutes', () => {
      expect(formatDuration(3600.5)).toBe('1h 0m');
      expect(formatDuration(3661.9)).toBe('1h 1m');
      expect(formatDuration(5400.7)).toBe('1h 30m'); // 1.5001 h -> 1h 30m
      expect(formatDuration(7200.99)).toBe('2h 0m'); // 2.0002 h -> 2h 0m
    });

    it('handles large multi-hour durations', () => {
      expect(formatDuration(10800)).toBe('3h 0m');
      expect(formatDuration(14400)).toBe('4h 0m');
      expect(formatDuration(16200)).toBe('4h 30m');
      expect(formatDuration(21600)).toBe('6h 0m');
      expect(formatDuration(36000)).toBe('10h 0m');
      expect(formatDuration(86400)).toBe('24h 0m'); // 1 day
      expect(formatDuration(90000)).toBe('25h 0m'); // just over 1 day
      expect(formatDuration(90061)).toBe('25h 1m'); // 25h 1m 1s
      expect(formatDuration(360000)).toBe('100h 0m');
    });
  });

  describe('return value construction (template literals)', () => {
    it('builds the hours format as `${h}h ${m}m`', () => {
      expect(formatDuration(3600)).toMatch(/^\d+h \d+m$/);
    });

    it('builds the minutes format as `${m}m`', () => {
      expect(formatDuration(300)).toMatch(/^\d+m$/);
    });

    it('builds the seconds format as `${s}s`', () => {
      expect(formatDuration(45)).toMatch(/^\d+(\.\d+)?s$/);
    });
  });
});
