import { describe, it, expect } from 'vitest';
import { hasMeaningfulNotes } from './talks';

describe('talks utils', () => {
  describe('hasMeaningfulNotes', () => {
    it('returns false for undefined notes', () => {
      expect(hasMeaningfulNotes(undefined)).toBe(false);
    });

    it('returns false for null notes', () => {
      expect(hasMeaningfulNotes(null as any)).toBe(false);
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
  });
}); 