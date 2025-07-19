import { describe, it, expect } from 'vitest';
import { TalksFilter } from './TalksFilter';

describe('TalksFilter', () => {
  describe('constructor', () => {
    it('should parse the year from the URL parameters', () => {
      const filter = TalksFilter.fromUrlParams('year=2023');
      expect(filter.year).toBe(2023);
    });

    it('should parse the query from the URL parameters', () => {
      const filter = TalksFilter.fromUrlParams('query=testing');
      expect(filter.query).toBe('testing');
    });

    it('should parse multiple parameters from the URL', () => {
      const filter = TalksFilter.fromUrlParams('year=2023&query=testing');
      expect(filter.year).toBe(2023);
      expect(filter.query).toBe('testing');
    });

    it('should handle empty parameters', () => {
      const filter = TalksFilter.fromUrlParams('');
      expect(filter.year).toBeNull();
      expect(filter.query).toBe('');
    });

    it('should handle null parameters', () => {
      const filter = TalksFilter.fromUrlParams(null as any);
      expect(filter.year).toBeNull();
      expect(filter.query).toBe('');
    });

    it('should handle undefined parameters', () => {
      const filter = TalksFilter.fromUrlParams(undefined as any);
      expect(filter.year).toBeNull();
      expect(filter.query).toBe('');
    });
  });

  describe('toParams', () => {
    it('should return an empty string if no filters are set', () => {
      const filter = TalksFilter.fromUrlParams('');
      expect(filter.toParams()).toBe('');
    });

    it('should return a query string for the year', () => {
      const filter = TalksFilter.fromUrlParams('year=2023');
      expect(filter.toParams()).toBe('year=2023');
    });

    it('should return a query string for the query', () => {
      const filter = TalksFilter.fromUrlParams('query=testing');
      expect(filter.toParams()).toBe('query=testing');
    });

    it('should return a query string for both year and query', () => {
      const filter = TalksFilter.fromUrlParams('year=2023&query=testing');
      expect(filter.toParams()).toBe('year=2023&query=testing');
    });
  });

  describe('filter', () => {
    const talk2023 = { id: '1', title: 'Talk 2023', year: 2023, url: '', duration: 0, topics: [], speakers: [], description: '', core_topic: '' };
    const talk2024 = { id: '2', title: 'Talk 2024', year: 2024, url: '', duration: 0, topics: [], speakers: [], description: '', core_topic: '' };
    const talkWithTesting = { id: '3', title: 'Talk about testing', year: 2024, url: '', duration: 0, topics: [], speakers: [], description: '', core_topic: '' };
    const talks = [talk2023, talk2024, talkWithTesting];

    it('should filter by year', () => {
      const filter = TalksFilter.fromUrlParams('year=2023');
      expect(filter.filter(talks)).toEqual([talk2023]);
    });

    it('should filter by query', () => {
      const filter = TalksFilter.fromUrlParams('query=testing');
      expect(filter.filter(talks)).toEqual([talkWithTesting]);
    });

    it('should filter by year and query', () => {
      const filter = TalksFilter.fromUrlParams('year=2024&query=testing');
      expect(filter.filter(talks)).toEqual([talkWithTesting]);
    });

    it('should return all talks if no filter is set', () => {
      const filter = TalksFilter.fromUrlParams('');
      expect(filter.filter(talks)).toEqual(talks);
    });

    it('should return an empty array if no talks match the filter', () => {
      const filter = TalksFilter.fromUrlParams('year=2025');
      expect(filter.filter(talks)).toEqual([]);
    });

    it('should return an empty array if the talks array is empty', () => {
      const filter = TalksFilter.fromUrlParams('year=2023');
      expect(filter.filter([])).toEqual([]);
    });

    it('should handle case-insensitive query matching', () => {
      const filter = TalksFilter.fromUrlParams('query=TESTING');
      expect(filter.filter(talks)).toEqual([talkWithTesting]);
    });
  });

  describe('fromUrlParams (full filter set)', () => {
    it('should parse all filter parameters from URL', () => {
      const params = 'year=2023&author=Alice&topics=react,typescript&conference=ReactConf&hasNotes=true&rating=5&query=testing';
      const filter = TalksFilter.fromUrlParams(params);
      expect(filter.year).toBe(2023);
      expect(filter.author).toBe('Alice');
      expect(filter.topics).toEqual(['react', 'typescript']);
      expect(filter.conference).toBe('ReactConf');
      expect(filter.hasNotes).toBe(true);
      expect(filter.rating).toBe(5);
      expect(filter.query).toBe('testing');
    });
  });
});