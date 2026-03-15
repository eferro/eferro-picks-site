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

    it('returns "0m" for NaN values', () => {
      expect(formatDuration(Number.NaN)).toBe('0m');
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

  describe('arithmetic operator mutation detection', () => {
    it('should verify division operations with non-identity values', () => {
      // These values would catch arithmetic operator mutations (* vs /)
      expect(formatDuration(7260)).toBe('2h 1m'); // 7260/3600=2.01h vs 7260*3600=huge
      expect(formatDuration(10800)).toBe('3h 0m'); // 10800/3600=3h vs 10800*3600=huge
      expect(formatDuration(180)).toBe('3m'); // 180/60=3m vs 180*60=huge seconds
    });

    it('should verify modulo operations work correctly', () => {
      // Test modulo vs addition mutations (% vs +)
      expect(formatDuration(3720)).toBe('1h 2m'); // (3720 % 3600) = 120sec, (3720 + 3600) = 7320sec
      expect(formatDuration(150)).toBe('2m'); // (150 % 60) = 30sec, (150 + 60) = 210sec different behavior
      expect(formatDuration(4260)).toBe('1h 11m'); // (4260 % 3600) = 660sec = 11m, + would break completely
    });

    it('should detect boundary condition mutations in comparison operators', () => {
      // Test > vs >= mutations
      expect(formatDuration(0)).toBe('0m'); // hours=0, minutes=0 - verify 0 boundary case
      expect(formatDuration(59)).toBe('59s'); // hours=0, minutes=0 - should go to seconds (not minutes with >=)
      expect(formatDuration(60)).toBe('1m'); // hours=0, minutes=1 - should show minutes
      expect(formatDuration(3600)).toBe('1h 0m'); // hours=1, minutes=0 - should show hours
    });

    it('should verify hours calculation precision with edge cases', () => {
      // These catch floor operation mutations and arithmetic precision
      expect(formatDuration(3599)).toBe('59m'); // Just under 1 hour - should be minutes
      expect(formatDuration(3601)).toBe('1h 0m'); // Just over 1 hour - should be hours
      expect(formatDuration(7199)).toBe('1h 59m'); // Just under 2 hours
      expect(formatDuration(7201)).toBe('2h 0m'); // Just over 2 hours
    });
  });

  describe('conditional logic mutation detection', () => {
    it('should verify if-else chain logic with precise boundary values', () => {
      // Test the exact conditions that control format selection

      // Hours > 0 case
      expect(formatDuration(3600)).toBe('1h 0m'); // Exactly 1 hour (hours = 1, minutes = 0)
      expect(formatDuration(3601)).toBe('1h 0m'); // Slightly over 1 hour (hours = 1, minutes = 0)
      expect(formatDuration(3660)).toBe('1h 1m'); // 1 hour 1 minute (hours = 1, minutes = 1)

      // Minutes > 0 case (when hours = 0)
      expect(formatDuration(60)).toBe('1m');    // Exactly 1 minute (hours = 0, minutes = 1)
      expect(formatDuration(119)).toBe('1m');   // 1 minute 59 seconds (hours = 0, minutes = 1)
      expect(formatDuration(3599)).toBe('59m'); // 59 minutes 59 seconds (hours = 0, minutes = 59)

      // Seconds case (when hours = 0 AND minutes = 0)
      expect(formatDuration(1)).toBe('1s');    // 1 second (hours = 0, minutes = 0, seconds = 1)
      expect(formatDuration(59)).toBe('59s');  // 59 seconds (hours = 0, minutes = 0, seconds = 59)
    });

    it('should catch comparison operator mutations (> vs >= vs <)', () => {
      // These tests specifically catch boundary mutations in conditional logic

      // Test hours > 0 vs hours >= 0 mutation
      expect(formatDuration(0)).toBe('0m');      // hours = 0 - should NOT show hours format
      expect(formatDuration(3600)).toBe('1h 0m'); // hours = 1 - should show hours format

      // Test minutes > 0 vs minutes >= 0 mutation
      expect(formatDuration(0)).toBe('0m');    // minutes = 0 - should NOT show minutes format
      expect(formatDuration(60)).toBe('1m');   // minutes = 1 - should show minutes format

      // Test the special case where 0 seconds goes to '0m' not '0s'
      expect(formatDuration(0)).toBe('0m');    // Special case handled by first condition
    });

    it('should verify Math.floor behavior is essential', () => {
      // These catch mutations where Math.floor might be removed or changed

      // Decimal hours should floor to integer
      expect(formatDuration(5400.7)).toBe('1h 30m'); // 1.5001... hours -> 1h 30m
      expect(formatDuration(7200.99)).toBe('2h 0m');  // 2.0002... hours -> 2h 0m

      // Decimal minutes should floor to integer
      expect(formatDuration(150.9)).toBe('2m');       // 2.515 minutes -> 2m
      expect(formatDuration(90.1)).toBe('1m');        // 1.5016... minutes -> 1m

      // Verify that without Math.floor, results would be wrong
      // These values specifically chosen to show Math.floor is needed
      expect(formatDuration(3661.9)).toBe('1h 1m');   // Would be wrong without floor
    });

    it('should handle very large numbers correctly', () => {
      // Test that arithmetic operations work with large values
      expect(formatDuration(86400)).toBe('24h 0m');   // 1 day
      expect(formatDuration(90000)).toBe('25h 0m');   // Just over 1 day
      expect(formatDuration(360000)).toBe('100h 0m'); // Large value

      // Verify the calculations still work properly
      expect(formatDuration(90061)).toBe('25h 1m');   // 25 hours 1 minute 1 second
    });
  });

  describe('return statement mutation detection', () => {
    it('should verify each return path is reachable and correct', () => {
      // Test each return statement path

      // Early return for invalid input
      expect(formatDuration(null as never)).toBe('0m');
      expect(formatDuration(-1)).toBe('0m');
      expect(formatDuration(NaN)).toBe('0m');

      // Hours path return
      expect(formatDuration(3600)).toBe('1h 0m');
      expect(formatDuration(7260)).toBe('2h 1m');

      // Minutes path return
      expect(formatDuration(60)).toBe('1m');
      expect(formatDuration(120)).toBe('2m');

      // Seconds path return
      expect(formatDuration(30)).toBe('30s');
      expect(formatDuration(45)).toBe('45s');
    });

    it('should catch mutations in return value construction', () => {
      // These catch mutations in template literal construction

      // Hours format: `${hours}h ${minutes}m`
      expect(formatDuration(3600)).toMatch(/^\d+h \d+m$/);  // Format pattern
      expect(formatDuration(3660)).toBe('1h 1m');           // Specific values
      expect(formatDuration(7200)).toBe('2h 0m');           // Zero minutes

      // Minutes format: `${minutes}m`
      expect(formatDuration(300)).toMatch(/^\d+m$/);        // Format pattern
      expect(formatDuration(300)).toBe('5m');               // Specific value

      // Seconds format: `${remainingSeconds}s`
      expect(formatDuration(45)).toMatch(/^\d+(\.\d+)?s$/); // Format pattern (allows decimals)
      expect(formatDuration(45)).toBe('45s');               // Specific value
      expect(formatDuration(30.5)).toBe('30.5s');          // Decimal seconds
    });
  });
});