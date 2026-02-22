import { describe, it, expect } from 'vitest';
import { TalksFilter } from './TalksFilter';
import { createTalk } from '../test/utils';
import {
  FIXED_TEST_YEAR,
  createTestYear,
  createYearRangeTalks,
  createBoundaryYearTalks
} from '../test/testHelpers';

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
      const filter = TalksFilter.fromUrlParams(null as never);
      expect(filter.year).toBeNull();
      expect(filter.query).toBe('');
    });

    it('should handle undefined parameters', () => {
      const filter = TalksFilter.fromUrlParams(undefined as never);
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

    it('should respect before yearType', () => {
      const talks = [
        createTalk({ id: 'b1', title: '2019', year: 2019 }),
        createTalk({ id: 'b2', title: '2021', year: 2021 })
      ];
      const filter = TalksFilter.fromUrlParams('yearType=before&year=2020');
      expect(filter.filter(talks)).toEqual([talks[0]]);
    });

    it('should respect after yearType', () => {
      const talks = [
        createTalk({ id: 'a1', title: '2019', year: 2019 }),
        createTalk({ id: 'a2', title: '2021', year: 2021 })
      ];
      const filter = TalksFilter.fromUrlParams('yearType=after&year=2020');
      expect(filter.filter(talks)).toEqual([talks[1]]);
    });

    it('should respect last2 yearType', () => {
      const talks = createYearRangeTalks(FIXED_TEST_YEAR, 4);
      const filter = new TalksFilter({
        yearType: 'last2',
        _testCurrentYear: FIXED_TEST_YEAR
      });
      expect(filter.filter(talks)).toEqual([talks[0], talks[1], talks[2]]);
    });

    it('should respect last5 yearType', () => {
      const talks = createYearRangeTalks(FIXED_TEST_YEAR, 7);
      const filter = new TalksFilter({
        yearType: 'last5',
        _testCurrentYear: FIXED_TEST_YEAR
      });
      const result = filter.filter(talks);
      expect(result).toHaveLength(6); // current + 5 years back
      expect(result).not.toContain(talks[6]); // 6 years ago excluded
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
      // author and topics are migrated to query
      expect(filter.author).toBeNull();
      expect(filter.topics).toEqual([]);
      expect(filter.query).toBe('testing Alice react typescript');
      expect(filter.conference).toBe('ReactConf');
      expect(filter.hasNotes).toBe(true);
      expect(filter.rating).toBe(5);
      expect(filter.formats).toEqual(['podcast']);
      const serialized = filter.toParams();
      expect(serialized).toContain('conference=ReactConf');
      expect(serialized).toContain('rating=5');
      expect(serialized).toContain('format=podcast');
    });
  });

  describe('URL parameter validation', () => {
    it('should handle invalid year parameters gracefully', () => {
      const invalidYears = ['abc', 'NaN', '', '  ', 'Infinity', '-Infinity'];
      
      invalidYears.forEach(invalidYear => {
        const filter = TalksFilter.fromUrlParams(`year=${invalidYear}`);
        expect(filter.year).toBeNull();
      });
    });

    it('should handle invalid rating parameters gracefully', () => {
      const invalidRatings = ['abc', 'NaN', '', '  ', 'Infinity', '-Infinity'];
      
      invalidRatings.forEach(invalidRating => {
        const filter = TalksFilter.fromUrlParams(`rating=${invalidRating}`);
        expect(filter.rating).toBeNull();
      });
    });

    it('should parse valid numeric parameters correctly', () => {
      const filter = TalksFilter.fromUrlParams('year=2023&rating=5');
      expect(filter.year).toBe(2023);
      expect(filter.rating).toBe(5);
    });

    it('should handle edge case numeric values', () => {
      const filter = TalksFilter.fromUrlParams('year=0&rating=0');
      expect(filter.year).toBe(0);
      expect(filter.rating).toBe(0);
    });
  });

  describe('Legacy URL Parameter Migration', () => {
    it('should migrate author parameter to query', () => {
      const filter = TalksFilter.fromUrlParams('author=Kent+Beck');
      expect(filter.query).toBe('Kent Beck');
      expect(filter.author).toBeNull();
    });

    it('should migrate topics parameter to query', () => {
      const filter = TalksFilter.fromUrlParams('topics=TDD,Refactoring');
      expect(filter.query).toBe('TDD Refactoring');
      expect(filter.topics).toEqual([]);
    });

    it('should combine author and topics in query', () => {
      const filter = TalksFilter.fromUrlParams('author=Kent+Beck&topics=TDD,Refactoring');
      expect(filter.query).toBe('Kent Beck TDD Refactoring');
      expect(filter.author).toBeNull();
      expect(filter.topics).toEqual([]);
    });

    it('should combine legacy params with existing query', () => {
      const filter = TalksFilter.fromUrlParams('query=domain&author=Eric+Evans&topics=DDD');
      expect(filter.query).toBe('domain Eric Evans DDD');
    });

    it('should preserve other parameters during migration', () => {
      const filter = TalksFilter.fromUrlParams('author=Kent+Beck&year=2020&yearType=specific&rating=5&hasNotes=true');
      expect(filter.query).toBe('Kent Beck');
      expect(filter.year).toBe(2020);
      expect(filter.yearType).toBe('specific');
      expect(filter.rating).toBe(5);
      expect(filter.hasNotes).toBe(true);
    });

    it('should handle empty author parameter', () => {
      const filter = TalksFilter.fromUrlParams('author=');
      expect(filter.query).toBe('');
      expect(filter.author).toBeNull();
    });

    it('should handle empty topics parameter', () => {
      const filter = TalksFilter.fromUrlParams('topics=');
      expect(filter.query).toBe('');
      expect(filter.topics).toEqual([]);
    });

    it('should filter topics with empty strings', () => {
      const filter = TalksFilter.fromUrlParams('topics=TDD,,Refactoring');
      expect(filter.query).toBe('TDD Refactoring');
    });
  });

  describe('toParams - No Legacy Parameters', () => {
    it('should not write author parameter', () => {
      const filter = new TalksFilter({ query: 'Kent Beck' });
      const params = filter.toParams();
      expect(params).toBe('query=Kent+Beck');
      expect(params).not.toContain('author');
    });

    it('should not write topics parameter', () => {
      const filter = new TalksFilter({ query: 'TDD Refactoring' });
      const params = filter.toParams();
      expect(params).toBe('query=TDD+Refactoring');
      expect(params).not.toContain('topics');
    });

    it('should preserve other parameters', () => {
      const filter = new TalksFilter({
        query: 'domain',
        year: 2020,
        yearType: 'specific',
        rating: 5,
      });
      const params = filter.toParams();
      expect(params).toContain('query=domain');
      expect(params).toContain('year=2020');
      expect(params).toContain('yearType=specific');
      expect(params).toContain('rating=5');
      expect(params).not.toContain('author');
      expect(params).not.toContain('topics');
    });
  });

  describe('Multi-field Search (searchInFields)', () => {
    describe('Empty Query Handling', () => {
      it('should return all talks when query is empty', () => {
        const talks = [createTalk({ id: '1' }), createTalk({ id: '2' })];
        const filter = new TalksFilter({ query: '' });
        expect(filter.filter(talks)).toEqual(talks);
      });

      it('should return all talks when query is only whitespace', () => {
        const talks = [createTalk({ id: '1' }), createTalk({ id: '2' })];
        const filter = new TalksFilter({ query: '   \n  \t  ' });
        expect(filter.filter(talks)).toEqual(talks);
      });
    });

    describe('Search in Title', () => {
      it('should match query in title', () => {
        const talk = createTalk({ title: 'Domain Driven Design' });
        const filter = new TalksFilter({ query: 'Domain' });
        expect(filter.filter([talk])).toEqual([talk]);
      });

      it('should match partial word in title', () => {
        const talk = createTalk({ title: 'Refactoring Legacy Code' });
        const filter = new TalksFilter({ query: 'factor' });
        expect(filter.filter([talk])).toEqual([talk]);
      });
    });

    describe('Search in Description', () => {
      it('should match query in description', () => {
        const talk = createTalk({
          title: 'Talk Title',
          description: 'This talk covers microservices architecture'
        });
        const filter = new TalksFilter({ query: 'microservices' });
        expect(filter.filter([talk])).toEqual([talk]);
      });

      it('should handle missing description gracefully', () => {
        const talk = createTalk({
          title: 'Talk Title',
          description: undefined
        });
        const filter = new TalksFilter({ query: 'something' });
        expect(filter.filter([talk])).toEqual([]);
      });

      it('should handle empty description', () => {
        const talk = createTalk({
          title: 'Talk Title',
          description: ''
        });
        const filter = new TalksFilter({ query: 'something' });
        expect(filter.filter([talk])).toEqual([]);
      });
    });

    describe('Search in Speakers', () => {
      it('should match query in speakers', () => {
        const talk = createTalk({
          title: 'Talk Title',
          speakers: ['Kent Beck', 'Martin Fowler']
        });
        const filter = new TalksFilter({ query: 'Kent' });
        expect(filter.filter([talk])).toEqual([talk]);
      });

      it('should match partial speaker name', () => {
        const talk = createTalk({
          title: 'Talk Title',
          speakers: ['Robert Martin']
        });
        const filter = new TalksFilter({ query: 'Mart' });
        expect(filter.filter([talk])).toEqual([talk]);
      });

      it('should handle missing speakers gracefully', () => {
        const talk = createTalk({
          title: 'Talk Title',
          speakers: undefined
        });
        const filter = new TalksFilter({ query: 'someone' });
        expect(filter.filter([talk])).toEqual([]);
      });
    });

    describe('Search in Topics', () => {
      it('should match query in topics', () => {
        const talk = createTalk({
          title: 'Talk Title',
          topics: ['TDD', 'Refactoring', 'Clean Code']
        });
        const filter = new TalksFilter({ query: 'Refactoring' });
        expect(filter.filter([talk])).toEqual([talk]);
      });

      it('should match partial topic', () => {
        const talk = createTalk({
          title: 'Talk Title',
          topics: ['Domain-Driven Design']
        });
        const filter = new TalksFilter({ query: 'Domain' });
        expect(filter.filter([talk])).toEqual([talk]);
      });

      it('should handle missing topics gracefully', () => {
        const talk = createTalk({
          title: 'Talk Title',
          topics: undefined
        });
        const filter = new TalksFilter({ query: 'topic' });
        expect(filter.filter([talk])).toEqual([]);
      });
    });

    describe('Search in Notes', () => {
      it('should match query in notes', () => {
        const talk = createTalk({
          title: 'Talk Title',
          notes: 'Excellent explanation of hexagonal architecture'
        });
        const filter = new TalksFilter({ query: 'hexagonal' });
        expect(filter.filter([talk])).toEqual([talk]);
      });

      it('should handle missing notes gracefully', () => {
        const talk = createTalk({
          title: 'Talk Title',
          notes: undefined
        });
        const filter = new TalksFilter({ query: 'note' });
        expect(filter.filter([talk])).toEqual([]);
      });

      it('should handle empty notes', () => {
        const talk = createTalk({
          title: 'Talk Title',
          notes: ''
        });
        const filter = new TalksFilter({ query: 'note' });
        expect(filter.filter([talk])).toEqual([]);
      });
    });

    describe('Multiple Search Terms (AND Logic)', () => {
      it('should match when ALL terms are found across different fields', () => {
        const talk = createTalk({
          title: 'Domain Modeling',
          speakers: ['Eric Evans'],
          topics: ['DDD'],
          description: 'Strategic patterns for software design'
        });
        const filter = new TalksFilter({ query: 'Eric Domain patterns' });
        expect(filter.filter([talk])).toEqual([talk]);
      });

      it('should NOT match when only SOME terms are found', () => {
        const talk = createTalk({
          title: 'Domain Modeling',
          speakers: ['Eric Evans'],
          description: 'Strategic patterns'
        });
        // 'hexagonal' is not in any field
        const filter = new TalksFilter({ query: 'Domain hexagonal' });
        expect(filter.filter([talk])).toEqual([]);
      });

      it('should handle multiple spaces between search terms', () => {
        const talk = createTalk({
          title: 'Refactoring patterns',
          speakers: ['Martin Fowler']
        });
        const filter = new TalksFilter({ query: 'Refactoring    Martin' });
        expect(filter.filter([talk])).toEqual([talk]);
      });

      it('should match three terms across different fields', () => {
        const talk = createTalk({
          title: 'Clean Code',
          speakers: ['Robert Martin'],
          topics: ['Craftsmanship'],
          description: 'Best practices for writing maintainable code'
        });
        const filter = new TalksFilter({ query: 'Clean Robert Craftsmanship' });
        expect(filter.filter([talk])).toEqual([talk]);
      });
    });

    describe('Cross-field Combinations', () => {
      it('should match term in title and another in description', () => {
        const talk = createTalk({
          title: 'Microservices Architecture',
          description: 'Discusses resilience patterns'
        });
        const filter = new TalksFilter({ query: 'Microservices resilience' });
        expect(filter.filter([talk])).toEqual([talk]);
      });

      it('should match term in speaker and another in notes', () => {
        const talk = createTalk({
          speakers: ['Kent Beck'],
          notes: 'Great explanation of TDD workflow'
        });
        const filter = new TalksFilter({ query: 'Kent workflow' });
        expect(filter.filter([talk])).toEqual([talk]);
      });

      it('should match all fields when same term appears in multiple fields', () => {
        const talk = createTalk({
          title: 'Testing strategies',
          topics: ['Testing'],
          description: 'Advanced testing techniques',
          notes: 'Focus on testing pyramid'
        });
        const filter = new TalksFilter({ query: 'Testing' });
        expect(filter.filter([talk])).toEqual([talk]);
      });
    });

    describe('Accent Normalization', () => {
      it('should match queries with accents against text without accents', () => {
        const talk = createTalk({
          title: 'Jose Garcia talks about refactoring'
        });
        const filter = new TalksFilter({ query: 'José García' });
        expect(filter.filter([talk])).toEqual([talk]);
      });

      it('should match queries without accents against text with accents', () => {
        const talk = createTalk({
          title: 'José García talks about Diseño'
        });
        const filter = new TalksFilter({ query: 'Jose Garcia Diseno' });
        expect(filter.filter([talk])).toEqual([talk]);
      });

      it('should handle multiple accented characters', () => {
        const talk = createTalk({
          title: 'Introducción a la programación funcional'
        });
        const filter = new TalksFilter({ query: 'Introduccion programacion' });
        expect(filter.filter([talk])).toEqual([talk]);
      });

      it('should handle mixed accents in query and content', () => {
        const talk = createTalk({
          speakers: ['Raúl López'],
          description: 'Técnicas avanzadas'
        });
        const filter = new TalksFilter({ query: 'Raul Tecnicas' });
        expect(filter.filter([talk])).toEqual([talk]);
      });

      it('should match accented speakers', () => {
        const talk = createTalk({
          speakers: ['José García', 'María Pérez']
        });
        const filter = new TalksFilter({ query: 'Jose Maria' });
        expect(filter.filter([talk])).toEqual([talk]);
      });

      it('should match accented topics', () => {
        const talk = createTalk({
          topics: ['Diseño de Software', 'Programación']
        });
        const filter = new TalksFilter({ query: 'Diseno Programacion' });
        expect(filter.filter([talk])).toEqual([talk]);
      });

      it('should match accented notes', () => {
        const talk = createTalk({
          notes: 'Explicación detallada de técnicas avanzadas'
        });
        const filter = new TalksFilter({ query: 'Explicacion tecnicas' });
        expect(filter.filter([talk])).toEqual([talk]);
      });
    });
  });

  describe('Year Filter Boundaries', () => {
    // Using FIXED_TEST_YEAR for deterministic testing
    const testYear = FIXED_TEST_YEAR;

    describe('last2 filter', () => {
      it('includes current year', () => {
        const talk = createTalk({ year: testYear });
        const filter = new TalksFilter({ yearType: 'last2', _testCurrentYear: testYear });
        expect(filter.filter([talk])).toContain(talk);
      });

      it('includes one year ago', () => {
        const talk = createTalk({ year: createTestYear(-1) });
        const filter = new TalksFilter({ yearType: 'last2', _testCurrentYear: testYear });
        expect(filter.filter([talk])).toContain(talk);
      });

      it('includes exactly two years ago', () => {
        const talk = createTalk({ year: createTestYear(-2) });
        const filter = new TalksFilter({ yearType: 'last2', _testCurrentYear: testYear });
        expect(filter.filter([talk])).toContain(talk);
      });

      it('excludes three years ago', () => {
        const talk = createTalk({ year: createTestYear(-3) });
        const filter = new TalksFilter({ yearType: 'last2', _testCurrentYear: testYear });
        expect(filter.filter([talk])).not.toContain(talk);
      });

      it('returns correct count for boundary range', () => {
        const talks = createBoundaryYearTalks(testYear);
        const filter = new TalksFilter({ yearType: 'last2', _testCurrentYear: testYear });
        const result = filter.filter([talks.current, talks.minus1, talks.minus2, talks.minus3]);
        expect(result).toHaveLength(3);
      });
    });

    describe('last5 filter', () => {
      it('includes current year', () => {
        const talk = createTalk({ year: testYear });
        const filter = new TalksFilter({ yearType: 'last5', _testCurrentYear: testYear });
        expect(filter.filter([talk])).toContain(talk);
      });

      it('includes exactly five years ago', () => {
        const talk = createTalk({ year: createTestYear(-5) });
        const filter = new TalksFilter({ yearType: 'last5', _testCurrentYear: testYear });
        expect(filter.filter([talk])).toContain(talk);
      });

      it('excludes six years ago', () => {
        const talk = createTalk({ year: createTestYear(-6) });
        const filter = new TalksFilter({ yearType: 'last5', _testCurrentYear: testYear });
        expect(filter.filter([talk])).not.toContain(talk);
      });

      it('returns correct count for boundary range', () => {
        const talks = createBoundaryYearTalks(testYear);
        const filter = new TalksFilter({ yearType: 'last5', _testCurrentYear: testYear });
        const result = filter.filter([talks.current, talks.minus5, talks.minus6]);
        expect(result).toHaveLength(2);
      });
    });

    describe('before filter', () => {
      const referenceYear = 2020;

      it('includes year before reference', () => {
        const talk = createTalk({ year: 2019 });
        const filter = new TalksFilter({ yearType: 'before', year: referenceYear });
        expect(filter.filter([talk])).toContain(talk);
      });

      it('excludes exact reference year', () => {
        const talk = createTalk({ year: referenceYear });
        const filter = new TalksFilter({ yearType: 'before', year: referenceYear });
        expect(filter.filter([talk])).not.toContain(talk);
      });

      it('excludes year after reference', () => {
        const talk = createTalk({ year: 2021 });
        const filter = new TalksFilter({ yearType: 'before', year: referenceYear });
        expect(filter.filter([talk])).not.toContain(talk);
      });
    });

    describe('after filter', () => {
      const referenceYear = 2020;

      it('includes year after reference', () => {
        const talk = createTalk({ year: 2021 });
        const filter = new TalksFilter({ yearType: 'after', year: referenceYear });
        expect(filter.filter([talk])).toContain(talk);
      });

      it('excludes exact reference year', () => {
        const talk = createTalk({ year: referenceYear });
        const filter = new TalksFilter({ yearType: 'after', year: referenceYear });
        expect(filter.filter([talk])).not.toContain(talk);
      });

      it('excludes year before reference', () => {
        const talk = createTalk({ year: 2019 });
        const filter = new TalksFilter({ yearType: 'after', year: referenceYear });
        expect(filter.filter([talk])).not.toContain(talk);
      });
    });

    describe('specific filter', () => {
      const referenceYear = 2020;

      it('includes exact reference year', () => {
        const talk = createTalk({ year: referenceYear });
        const filter = new TalksFilter({ yearType: 'specific', year: referenceYear });
        expect(filter.filter([talk])).toContain(talk);
      });

      it('excludes year before reference', () => {
        const talk = createTalk({ year: 2019 });
        const filter = new TalksFilter({ yearType: 'specific', year: referenceYear });
        expect(filter.filter([talk])).not.toContain(talk);
      });

      it('excludes year after reference', () => {
        const talk = createTalk({ year: 2021 });
        const filter = new TalksFilter({ yearType: 'specific', year: referenceYear });
        expect(filter.filter([talk])).not.toContain(talk);
      });
    });
  });

  describe('Combined Filters Integration', () => {
    it('should apply all filters simultaneously', () => {
      const matchingTalk = createTalk({
        id: '1',
        title: 'Domain Modeling',
        year: 2023,
        speakers: ['Eric Evans'],
        topics: ['DDD'],
        conference_name: 'DDD Europe',
        notes: 'Excellent talk about bounded contexts',
        rating: 5,
        format: 'video'
      });

      const wrongYear = createTalk({
        ...matchingTalk,
        id: '2',
        year: 2020,
        title: 'Domain Modeling Old'
      });

      const wrongConference = createTalk({
        ...matchingTalk,
        id: '3',
        conference_name: 'Other Conf'
      });

      const wrongFormat = createTalk({
        ...matchingTalk,
        id: '4',
        format: 'podcast'
      });

      const noNotes = createTalk({
        ...matchingTalk,
        id: '5',
        notes: ''
      });

      const filter = new TalksFilter({
        yearType: 'specific',
        year: 2023,
        conference: 'DDD Europe',
        hasNotes: true,
        rating: 5,
        formats: ['video'],
        query: 'Domain'
      });

      const talks = [matchingTalk, wrongYear, wrongConference, wrongFormat, noNotes];
      expect(filter.filter(talks)).toEqual([matchingTalk]);
    });

    it('should fail when any filter condition is not met', () => {
      const talk = createTalk({
        title: 'Test Talk',
        year: 2023,
        conference_name: 'TestConf',
        notes: 'test notes',
        rating: 5,
        format: 'video'
      });

      // Missing query match - should filter out
      const filterWithQuery = new TalksFilter({
        year: 2023,
        yearType: 'specific',
        conference: 'TestConf',
        hasNotes: true,
        rating: 5,
        formats: ['video'],
        query: 'Domain' // This doesn't match 'Test Talk'
      });

      expect(filterWithQuery.filter([talk])).toEqual([]);
    });

    it('should match when all filters are satisfied with multiple search terms', () => {
      const talk = createTalk({
        title: 'Domain Driven Design',
        year: 2023,
        speakers: ['Eric Evans'],
        topics: ['DDD', 'Architecture'],
        conference_name: 'DDD Europe',
        notes: 'Strategic patterns',
        rating: 5,
        format: 'video',
        description: 'An in-depth exploration of bounded contexts'
      });

      const filter = new TalksFilter({
        yearType: 'specific',
        year: 2023,
        conference: 'DDD Europe',
        hasNotes: true,
        rating: 5,
        formats: ['video'],
        query: 'Domain Eric patterns' // All three terms must match
      });

      expect(filter.filter([talk])).toEqual([talk]);
    });

    it('should fail when multiple filters match but one does not', () => {
      const talk = createTalk({
        title: 'Domain Modeling',
        year: 2023,
        speakers: ['Eric Evans'],
        conference_name: 'DDD Europe',
        notes: 'Great talk',
        format: 'video'
      });

      // All filters match except format
      const filter = new TalksFilter({
        yearType: 'specific',
        year: 2023,
        conference: 'DDD Europe',
        hasNotes: true,
        formats: ['podcast'], // Talk has format 'video', not 'podcast'
        query: 'Domain'
      });

      expect(filter.filter([talk])).toEqual([]);
    });

    it('should handle combined year filter and query correctly', () => {
      const talks = [
        createTalk({ id: '1', title: 'TDD Basics', year: 2023 }),
        createTalk({ id: '2', title: 'TDD Advanced', year: 2022 }),
        createTalk({ id: '3', title: 'Refactoring', year: 2023 })
      ];

      const filter = new TalksFilter({
        yearType: 'specific',
        year: 2023,
        query: 'TDD'
      });

      expect(filter.filter(talks)).toEqual([talks[0]]);
    });
  });

  describe('parseValidInt - Radix Edge Cases', () => {
    it('should parse octal-looking strings correctly with radix 10', () => {
      const filter = TalksFilter.fromUrlParams('year=08');
      expect(filter.year).toBe(8); // Not 0 (octal interpretation)
    });

    it('should parse octal-looking strings for rating correctly', () => {
      const filter = TalksFilter.fromUrlParams('rating=05');
      expect(filter.rating).toBe(5); // Not octal interpretation
    });

    it('should not interpret hex strings when using radix 10', () => {
      const filter = TalksFilter.fromUrlParams('year=0x10');
      expect(filter.year).toBe(0); // parseInt('0x10', 10) returns 0
    });

    it('should handle leading zeros correctly', () => {
      const filter = TalksFilter.fromUrlParams('year=0020');
      expect(filter.year).toBe(20); // Not 16 (octal 020)
    });

    it('should handle negative numbers correctly', () => {
      const filter = TalksFilter.fromUrlParams('year=-2023');
      expect(filter.year).toBe(-2023);
    });

    it('should handle numbers with leading plus sign', () => {
      const filter = TalksFilter.fromUrlParams('year=+2023');
      expect(filter.year).toBe(2023);
    });

    it('should stop parsing at first non-digit character', () => {
      const filter = TalksFilter.fromUrlParams('year=2023abc');
      expect(filter.year).toBe(2023);
    });

    it('should handle scientific notation correctly', () => {
      const filter = TalksFilter.fromUrlParams('year=1e3');
      expect(filter.year).toBe(1); // parseInt stops at 'e'
    });
  });

  describe('Filter Method - null/undefined Edge Cases', () => {
    it('should handle talks with null year when year filter is active', () => {
      const talkWithYear = createTalk({ id: '1', year: 2023 });
      const talkWithoutYear = createTalk({ id: '2', year: undefined });

      const filter = new TalksFilter({ yearType: 'specific', year: 2023 });
      const result = filter.filter([talkWithYear, talkWithoutYear]);

      expect(result).toEqual([talkWithYear]);
    });

    it('should handle talks with null conference when conference filter is active', () => {
      const talkWithConf = createTalk({ id: '1', conference_name: 'TestConf' });
      const talkWithoutConf = createTalk({ id: '2', conference_name: undefined });

      const filter = new TalksFilter({ conference: 'TestConf' });
      const result = filter.filter([talkWithConf, talkWithoutConf]);

      expect(result).toEqual([talkWithConf]);
    });

    it('should handle talks with null format when format filter is active', () => {
      const talkWithFormat = createTalk({ id: '1', format: 'video' });
      const talkWithoutFormat = createTalk({ id: '2', format: undefined });

      const filter = new TalksFilter({ formats: ['video'] });
      const result = filter.filter([talkWithFormat, talkWithoutFormat]);

      expect(result).toEqual([talkWithFormat]);
    });

    it('should treat talks without format as talk format when no format filter', () => {
      const talkWithFormat = createTalk({ id: '1', format: 'video' });
      const talkWithoutFormat = createTalk({ id: '2', format: undefined });

      const filter = new TalksFilter({ formats: ['talk'] });
      const result = filter.filter([talkWithFormat, talkWithoutFormat]);

      expect(result).toEqual([talkWithoutFormat]);
    });
  });
});