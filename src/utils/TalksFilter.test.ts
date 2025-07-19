import { describe, it, expect } from 'vitest';
import { TalksFilter } from './TalksFilter';

describe('TalksFilter', () => {
  describe('constructor', () => {
    it('should parse the year from the URL parameters', () => {
      const filter = new TalksFilter('year=2023');
      expect(filter.year).toBe(2023);
    });

    it('should parse the query from the URL parameters', () => {
      const filter = new TalksFilter('query=testing');
      expect(filter.query).toBe('testing');
    });

    it('should parse multiple parameters from the URL', () => {
      const filter = new TalksFilter('year=2023&query=testing');
      expect(filter.year).toBe(2023);
      expect(filter.query).toBe('testing');
    });

    it('should handle empty parameters', () => {
      const filter = new TalksFilter('');
      expect(filter.year).toBeNull();
      expect(filter.query).toBe('');
    });

    it('should handle null parameters', () => {
      const filter = new TalksFilter(null);
      expect(filter.year).toBeNull();
      expect(filter.query).toBe('');
    });

    it('should handle undefined parameters', () => {
      const filter = new TalksFilter(undefined);
      expect(filter.year).toBeNull();
      expect(filter.query).toBe('');
    });
  });
});