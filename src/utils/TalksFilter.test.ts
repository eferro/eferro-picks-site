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
      expect(filter.toParams()).toBe('yearType=specific&year=2023');
    });

    it('should return a query string for the query', () => {
      const filter = TalksFilter.fromUrlParams('query=testing');
      expect(filter.toParams()).toBe('query=testing');
    });

    it('should return a query string for both year and query', () => {
      const filter = TalksFilter.fromUrlParams('year=2023&query=testing');
      expect(filter.toParams()).toBe('yearType=specific&year=2023&query=testing');
    });

    it('should include conference and rating when present', () => {
      const filter = TalksFilter.fromUrlParams('conference=ReactConf&rating=4');
      expect(filter.toParams()).toBe('conference=ReactConf&rating=4');
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

    it('should filter by author', () => {
      const talkAlice = { id: '4', title: 'By Alice', year: 2024, url: '', duration: 0, topics: [], speakers: ['Alice'], description: '', core_topic: '', conference_name: 'ConfA', notes: 'n' };
      const talkBob = { id: '5', title: 'By Bob', year: 2024, url: '', duration: 0, topics: [], speakers: ['Bob'], description: '', core_topic: '', conference_name: 'ConfB' };
      const filter = TalksFilter.fromUrlParams('author=Alice');
      expect(filter.filter([talkAlice, talkBob])).toEqual([talkAlice]);
    });

    it('should filter by topics (AND condition)', () => {
      const talkReactTs = { id: '6', title: 'React TS', year: 2024, url: '', duration: 0, topics: ['react','typescript'], speakers: [], description: '', core_topic: '' };
      const talkReact = { id: '7', title: 'React', year: 2024, url: '', duration: 0, topics: ['react'], speakers: [], description: '', core_topic: '' };
      const filter = TalksFilter.fromUrlParams('topics=react,typescript');
      expect(filter.filter([talkReactTs, talkReact])).toEqual([talkReactTs]);
    });

    it('should filter by conference', () => {
      const t1 = { id: '8', title: 'A', year: 2024, url: '', duration: 0, topics: [], speakers: [], description: '', core_topic: '', conference_name: 'ConfA' };
      const t2 = { id: '9', title: 'B', year: 2024, url: '', duration: 0, topics: [], speakers: [], description: '', core_topic: '', conference_name: 'ConfB' };
      const filter = TalksFilter.fromUrlParams('conference=ConfA');
      expect(filter.filter([t1, t2])).toEqual([t1]);
    });

    it('should filter by hasNotes', () => {
      const withNotes = { id: '10', title: 'Notes', year: 2024, url: '', duration: 0, topics: [], speakers: [], description: '', core_topic: '', notes: 'some' };
      const withoutNotes = { id: '11', title: 'No', year: 2024, url: '', duration: 0, topics: [], speakers: [], description: '', core_topic: '', notes: '' };
      const filter = TalksFilter.fromUrlParams('hasNotes=true');
      expect(filter.filter([withNotes, withoutNotes])).toEqual([withNotes]);
    });

    it('should filter by format', () => {
      const talk = { id: '12', title: 't', year: 2024, url: '', duration: 0, topics: [], speakers: [], description: '', core_topic: '', format: 'talk' };
      const podcast = { id: '13', title: 'p', year: 2024, url: '', duration: 0, topics: [], speakers: [], description: '', core_topic: '', format: 'podcast' };
      const filter = TalksFilter.fromUrlParams('format=podcast');
      expect(filter.filter([talk, podcast])).toEqual([podcast]);
      expect(filter.toParams()).toContain('format=podcast');
    });

    it('should treat format=all as no format filter', () => {
      const filter = TalksFilter.fromUrlParams('format=all');
      expect(filter.formats).toEqual([]);
    });
  });

  describe('year filter types', () => {
    it('should parse and serialize last2 years filter', () => {
      const filter = TalksFilter.fromUrlParams('yearType=last2');
      expect(filter.yearType).toBe('last2');
      expect(filter.year).toBeNull();
      expect(filter.toParams()).toContain('yearType=last2');
    });

    it('should parse and serialize last5 years filter', () => {
      const filter = TalksFilter.fromUrlParams('yearType=last5');
      expect(filter.yearType).toBe('last5');
      expect(filter.year).toBeNull();
      expect(filter.toParams()).toContain('yearType=last5');
    });

    it('should parse and serialize before year filter', () => {
      const filter = TalksFilter.fromUrlParams('yearType=before&year=2020');
      expect(filter.yearType).toBe('before');
      expect(filter.year).toBe(2020);
      expect(filter.toParams()).toContain('yearType=before');
      expect(filter.toParams()).toContain('year=2020');
    });

    it('should parse and serialize after year filter', () => {
      const filter = TalksFilter.fromUrlParams('yearType=after&year=2020');
      expect(filter.yearType).toBe('after');
      expect(filter.year).toBe(2020);
      expect(filter.toParams()).toContain('yearType=after');
      expect(filter.toParams()).toContain('year=2020');
    });

    it('should parse and serialize specific year filter', () => {
      const filter = TalksFilter.fromUrlParams('yearType=specific&year=2023');
      expect(filter.yearType).toBe('specific');
      expect(filter.year).toBe(2023);
      expect(filter.toParams()).toContain('yearType=specific');
      expect(filter.toParams()).toContain('year=2023');
    });

    it('should default to no year filter if no yearType/year', () => {
      const filter = TalksFilter.fromUrlParams('');
      expect(filter.yearType).toBeNull();
      expect(filter.year).toBeNull();
      expect(filter.toParams()).not.toContain('yearType');
      expect(filter.toParams()).not.toContain('year=');
    });
  });

  describe('fromUrlParams (full filter set)', () => {
    it('should parse all filter parameters from URL', () => {
      const params = 'year=2023&author=Alice&topics=react,typescript&conference=ReactConf&hasNotes=true&rating=5&query=testing&format=podcast';
      const filter = TalksFilter.fromUrlParams(params);
      expect(filter.year).toBe(2023);
      expect(filter.author).toBe('Alice');
      expect(filter.topics).toEqual(['react', 'typescript']);
      expect(filter.conference).toBe('ReactConf');
      expect(filter.hasNotes).toBe(true);
      expect(filter.rating).toBe(5);
      expect(filter.query).toBe('testing');
      expect(filter.formats).toEqual(['podcast']);
      const serialized = filter.toParams();
      expect(serialized).toContain('conference=ReactConf');
      expect(serialized).toContain('rating=5');
      expect(serialized).toContain('format=podcast');
    });
  });
});