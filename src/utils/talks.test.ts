import { describe, it, expect } from 'vitest';
import { hasMeaningfulNotes } from './talks';

describe('talks utils', () => {
  describe('hasMeaningfulNotes', () => {
    it('returns false for undefined notes', () => {
      expect(hasMeaningfulNotes(undefined)).toBe(false);
    });

    it('returns false for null notes', () => {
      expect(hasMeaningfulNotes(null as never)).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(hasMeaningfulNotes('')).toBe(false);
    });

    it('returns false for string with only spaces', () => {
      expect(hasMeaningfulNotes('   ')).toBe(false);
    });

    it('returns false for string with only newlines', () => {
      expect(hasMeaningfulNotes('\n\r\n')).toBe(false);
    });

    it('returns false for string with only spaces and newlines', () => {
      expect(hasMeaningfulNotes('  \n  \r\n  ')).toBe(false);
    });

    it('returns true for string with actual content', () => {
      expect(hasMeaningfulNotes('Some notes')).toBe(true);
    });

    it('returns true for string with content and whitespace', () => {
      expect(hasMeaningfulNotes('  Some notes  \n')).toBe(true);
    });

    describe('boundary mutation detection', () => {
      it('should detect length boundary mutations (> vs >=)', () => {
        // These tests would catch `> 0` → `>= 0` mutations
        expect(hasMeaningfulNotes('')).toBe(false);  // length = 0, should be false
        expect(hasMeaningfulNotes('a')).toBe(true);  // length = 1, should be true
        expect(hasMeaningfulNotes(' ')).toBe(false); // length = 1 after trim = 0, should be false
      });

      it('should verify string trimming is essential', () => {
        // These verify that .trim() is actually applied (not just .length)
        expect(hasMeaningfulNotes('  ')).toBe(false);    // Would be true if no trim()
        expect(hasMeaningfulNotes('\n\n')).toBe(false);  // Would be true if no trim()
        expect(hasMeaningfulNotes('\t\t')).toBe(false);  // Would be true if no trim()
      });
    });
  });
}); 


import { hasMeaningfulNotes } from './talks';

// Note: After normalization, filtering and transformation happen during JSON transformation
// The data loading pipeline now works directly with normalized Talk[] data
