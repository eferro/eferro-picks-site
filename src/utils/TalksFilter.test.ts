import { describe, it, expect } from 'vitest';
import { TalksFilter, TalksFilterData } from './TalksFilter';
import { createTalk } from '../test/utils';
import { FIXED_TEST_YEAR, createTestYear, createBoundaryYearTalks } from '../test/testHelpers';
import type { Talk } from '../types/talks';

const ids = (talks: Talk[]): string[] => talks.map(t => t.id);

/** A talk whose searchable fields contain nothing, so only overrides can match a query. */
const blankTalk = (overrides: Partial<Talk> = {}): Talk =>
  createTalk({ id: 'blank', title: 'Untitled', description: '', speakers: [], topics: [], notes: '', ...overrides });

describe('TalksFilter', () => {
  describe('fromUrlParams', () => {
    it('parses year and query', () => {
      const filter = TalksFilter.fromUrlParams('year=2023&query=testing');
      expect(filter.year).toBe(2023);
      expect(filter.query).toBe('testing');
    });

    it('accepts a URLSearchParams instance', () => {
      const filter = TalksFilter.fromUrlParams(new URLSearchParams('query=tdd&rating=4'));
      expect(filter.query).toBe('tdd');
      expect(filter.rating).toBe(4);
    });

    it.each([
      ['an empty string', ''],
      ['null', null],
      ['undefined', undefined],
    ])('returns an empty filter for %s', (_name, params) => {
      const filter = TalksFilter.fromUrlParams(params);
      expect(filter.year).toBeNull();
      expect(filter.yearType).toBeNull();
      expect(filter.query).toBe('');
      expect(filter.hasNotes).toBe(false);
      expect(filter.quickWatch).toBe(false);
      expect(filter.formats).toEqual([]);
      expect(filter.isEmpty()).toBe(true);
    });

    it('parses the full set of parameters', () => {
      const filter = TalksFilter.fromUrlParams(
        'yearType=after&year=2023&conference=ReactConf&hasNotes=true&rating=5&query=testing&format=podcast&quickWatch=true'
      );
      expect(filter.yearType).toBe('after');
      expect(filter.year).toBe(2023);
      expect(filter.conference).toBe('ReactConf');
      expect(filter.hasNotes).toBe(true);
      expect(filter.rating).toBe(5);
      expect(filter.query).toBe('testing');
      expect(filter.formats).toEqual(['podcast']);
      expect(filter.quickWatch).toBe(true);
    });

    it.each(['last2', 'last5', 'specific', 'before', 'after'] as const)('parses yearType=%s', (yearType) => {
      expect(TalksFilter.fromUrlParams(`yearType=${yearType}`).yearType).toBe(yearType);
    });

    it('treats an empty conference as no conference filter', () => {
      expect(TalksFilter.fromUrlParams('conference=').conference).toBeNull();
    });

    describe('boolean flags are only enabled by the value "true"', () => {
      it.each([
        ['hasNotes=true', true],
        ['hasNotes=false', false],
        ['hasNotes=', false],
      ])('%s -> hasNotes %s', (params, expected) => {
        expect(TalksFilter.fromUrlParams(params).hasNotes).toBe(expected);
      });

      it.each([
        ['quickWatch=true', true],
        ['quickWatch=false', false],
        ['quickWatch=', false],
      ])('%s -> quickWatch %s', (params, expected) => {
        expect(TalksFilter.fromUrlParams(params).quickWatch).toBe(expected);
      });
    });

    describe('formats', () => {
      it.each([
        ['format=podcast', ['podcast']],
        ['format=talk,podcast', ['talk', 'podcast']],
        ['format=talk,,podcast', ['talk', 'podcast']],
        ['format=all', []],
        ['format=', []],
      ])('%s -> %j', (params, expected) => {
        expect(TalksFilter.fromUrlParams(params).formats).toEqual(expected);
      });
    });

    describe('integer parameters (year, rating)', () => {
      it.each(['abc', 'NaN', '', '  ', 'Infinity', '-Infinity', 'invalid'])(
        'ignores invalid value "%s"',
        (value) => {
          const filter = TalksFilter.fromUrlParams(`year=${value}&rating=${value}`);
          expect(filter.year).toBeNull();
          expect(filter.rating).toBeNull();
        }
      );

      it('keeps zero as a valid value', () => {
        const filter = TalksFilter.fromUrlParams('year=0&rating=0');
        expect(filter.year).toBe(0);
        expect(filter.rating).toBe(0);
      });

      it.each([
        ['08', 8],      // not octal
        ['0020', 20],   // not octal 020 = 16
        ['0x10', 0],    // hex prefix not interpreted with radix 10
        ['-2023', -2023],
        ['+2023', 2023],
        ['2023abc', 2023], // stops at first non-digit
        ['1e3', 1],        // no scientific notation
      ])('parses year "%s" in base 10 as %i', (value, expected) => {
        expect(TalksFilter.fromUrlParams(`year=${value}`).year).toBe(expected);
      });

      it('parses rating "05" in base 10 as 5', () => {
        expect(TalksFilter.fromUrlParams('rating=05').rating).toBe(5);
      });
    });

    describe('legacy author/topics parameters are migrated into query', () => {
      it.each([
        ['author=Kent+Beck', 'Kent Beck'],
        ['topics=TDD,Refactoring', 'TDD Refactoring'],
        ['topics=TDD,,Refactoring', 'TDD Refactoring'],
        ['author=Kent+Beck&topics=TDD,Refactoring', 'Kent Beck TDD Refactoring'],
        ['query=domain&author=Eric+Evans&topics=DDD', 'domain Eric Evans DDD'],
        ['author=', ''],
        ['topics=', ''],
      ])('%s -> query "%s"', (params, expectedQuery) => {
        const filter = TalksFilter.fromUrlParams(params);
        expect(filter.query).toBe(expectedQuery);
        expect(filter.author).toBeNull();
        expect(filter.topics).toEqual([]);
      });

      it('preserves the other parameters during migration', () => {
        const filter = TalksFilter.fromUrlParams('author=Kent+Beck&year=2020&yearType=specific&rating=5&hasNotes=true');
        expect(filter.query).toBe('Kent Beck');
        expect(filter.year).toBe(2020);
        expect(filter.yearType).toBe('specific');
        expect(filter.rating).toBe(5);
        expect(filter.hasNotes).toBe(true);
      });

      it('filters by the migrated author as a search term', () => {
        const alice = createTalk({ id: 'alice', title: 'By Alice', speakers: ['Alice'] });
        const bob = createTalk({ id: 'bob', title: 'By Bob', speakers: ['Bob'] });
        expect(ids(TalksFilter.fromUrlParams('author=Alice').filter([alice, bob]))).toEqual(['alice']);
      });

      it('filters by the migrated topics requiring all of them', () => {
        const both = createTalk({ id: 'both', title: 'React TS', topics: ['react', 'typescript'] });
        const one = createTalk({ id: 'one', title: 'React', topics: ['react'] });
        expect(ids(TalksFilter.fromUrlParams('topics=react,typescript').filter([both, one]))).toEqual(['both']);
      });
    });
  });

  describe('toParams', () => {
    it.each<[string, TalksFilterData, string]>([
      ['no filters', {}, ''],
      ['a year without yearType (implicit specific)', { year: 2023 }, 'yearType=specific&year=2023'],
      ['before without a year', { yearType: 'before' }, 'yearType=before'],
      ['a query with spaces', { query: 'Kent Beck' }, 'query=Kent+Beck'],
      ['conference and rating', { conference: 'ReactConf', rating: 4 }, 'conference=ReactConf&rating=4'],
      ['rating zero', { rating: 0 }, 'rating=0'],
      ['multiple formats', { formats: ['talk', 'podcast'] }, 'format=talk%2Cpodcast'],
      ['false booleans and null rating', { hasNotes: false, quickWatch: false, rating: null }, ''],
      ['direct author/topics (legacy, never written)', { author: 'Alice', topics: ['tdd'] }, ''],
      [
        'query with year and rating',
        { query: 'domain', year: 2020, yearType: 'specific', rating: 5 },
        'yearType=specific&year=2020&rating=5&query=domain',
      ],
    ])('serializes %s', (_name, data, expected) => {
      expect(new TalksFilter(data).toParams()).toBe(expected);
    });

    it.each(['last2', 'last5'] as const)('does not write a year for relative yearType %s', (yearType) => {
      expect(new TalksFilter({ yearType, year: 2020 }).toParams()).toBe(`yearType=${yearType}`);
    });
  });

  describe('URL round trip (fromUrlParams -> toParams)', () => {
    it.each([
      'yearType=last2',
      'yearType=last5',
      'yearType=specific&year=2023',
      'yearType=before&year=2020',
      'yearType=after&year=2020',
      'conference=Agile+Conf',
      'hasNotes=true',
      'rating=5',
      'query=tdd+ddd',
      'format=podcast',
      'format=talk%2Cpodcast',
      'quickWatch=true',
      'yearType=after&year=2020&conference=XP&hasNotes=true&rating=5&query=tdd&format=talk&quickWatch=true',
    ])('preserves "%s"', (params) => {
      expect(TalksFilter.fromUrlParams(params).toParams()).toBe(params);
    });

    it('normalizes a bare year to an explicit specific yearType', () => {
      expect(TalksFilter.fromUrlParams('year=2023&query=testing').toParams()).toBe('yearType=specific&year=2023&query=testing');
    });
  });

  describe('isEmpty', () => {
    it.each<[string, TalksFilterData]>([
      ['no arguments', {}],
      [
        'every field explicitly at its default',
        { year: null, yearType: null, author: null, topics: [], conference: null, hasNotes: false, rating: null, query: '', formats: [], quickWatch: false },
      ],
      ['an empty query', { query: '' }],
      ['a whitespace-only query', { query: '   \n\t   ' }],
    ])('is empty with %s', (_name, data) => {
      expect(new TalksFilter(data).isEmpty()).toBe(true);
    });

    it.each<[string, TalksFilterData]>([
      ['year', { year: 2023 }],
      ['yearType', { yearType: 'last2' }],
      ['author', { author: 'Alice' }],
      ['topics', { topics: ['tdd'] }],
      ['conference', { conference: 'Test Conference' }],
      ['hasNotes', { hasNotes: true }],
      ['rating', { rating: 5 }],
      ['query', { query: 'test query' }],
      ['formats', { formats: ['podcast'] }],
      ['quickWatch', { quickWatch: true }],
      ['several fields', { year: 2023, yearType: 'specific', conference: 'Test', hasNotes: true }],
    ])('is not empty when %s is set', (_name, data) => {
      expect(new TalksFilter(data).isEmpty()).toBe(false);
    });

    it('is not empty when parsed from a URL with a filter', () => {
      expect(TalksFilter.fromUrlParams('query=test').isEmpty()).toBe(false);
    });
  });

  describe('filter', () => {
    it('returns every talk when no filter is set', () => {
      const talks = [createTalk({ id: '1', year: 2023 }), createTalk({ id: '2', year: 2024 })];
      expect(new TalksFilter().filter(talks)).toEqual(talks);
    });

    it('returns an empty array for an empty talks list', () => {
      expect(TalksFilter.fromUrlParams('year=2023').filter([])).toEqual([]);
    });

    describe('query search', () => {
      it.each([
        ['an empty query', ''],
        ['a whitespace-only query', '   \n  \t  '],
      ])('returns all talks for %s', (_name, query) => {
        const talks = [createTalk({ id: '1', title: 'React Testing' }), createTalk({ id: '2', title: 'Vue Development' })];
        expect(new TalksFilter({ query }).filter(talks)).toEqual(talks);
      });

      it.each<{ name: string; talk: Partial<Talk>; query: string }>([
        { name: 'title', talk: { title: 'Domain Driven Design' }, query: 'Domain' },
        { name: 'description', talk: { description: 'This talk covers microservices architecture' }, query: 'microservices' },
        { name: 'speakers', talk: { speakers: ['Kent Beck', 'Martin Fowler'] }, query: 'Kent' },
        { name: 'speaker name prefix', talk: { speakers: ['Robert Martin'] }, query: 'Mart' },
        { name: 'topics', talk: { topics: ['TDD', 'Refactoring', 'Clean Code'] }, query: 'Refactoring' },
        { name: 'hyphenated topic part', talk: { topics: ['Domain-Driven Design'] }, query: 'Domain' },
        { name: 'notes', talk: { notes: 'Excellent explanation of hexagonal architecture' }, query: 'hexagonal' },
      ])('matches a term found only in $name', ({ talk, query }) => {
        const match = blankTalk({ id: 'match', ...talk });
        const other = blankTalk({ id: 'other' });
        expect(ids(new TalksFilter({ query }).filter([match, other]))).toEqual(['match']);
      });

      it.each<{ name: string; talk: Partial<Talk> }>([
        { name: 'description is undefined', talk: { description: undefined } },
        { name: 'speakers is undefined', talk: { speakers: undefined } },
        { name: 'topics is undefined', talk: { topics: undefined } },
        { name: 'notes is undefined', talk: { notes: undefined } },
      ])('does not match (nor crash) when $name', ({ talk }) => {
        expect(new TalksFilter({ query: 'something' }).filter([blankTalk(talk)])).toEqual([]);
      });

      it('is case-insensitive', () => {
        const talk = createTalk({ id: 't', title: 'Talk about testing' });
        expect(ids(TalksFilter.fromUrlParams('query=TESTING').filter([talk]))).toEqual(['t']);
      });

      describe('word-start matching', () => {
        it.each<{ name: string; talk: Partial<Talk>; query: string; matches: boolean }>([
          { name: 'a word prefix matches', talk: { title: 'Refactoring Legacy Code' }, query: 'Refactor', matches: true },
          { name: 'a fragment inside a word does not match', talk: { title: 'Refactoring Legacy Code' }, query: 'factor', matches: false },
          {
            name: 'XP does not match inside experience/expert/experiment',
            talk: { title: 'Learning from experience', description: 'An expert explains how to experiment' },
            query: 'XP',
            matches: false,
          },
          { name: 'XP matches the exact topic', talk: { topics: ['XP', 'TDD'] }, query: 'XP', matches: true },
          { name: 'a hyphenated topic matches as a whole', talk: { topics: ['Lean-Agile'] }, query: 'Lean-Agile', matches: true },
          { name: 'a hyphenated topic matches by its second part', talk: { topics: ['Agile-XP'] }, query: 'XP', matches: true },
          {
            name: 'words next to punctuation match',
            talk: { notes: 'Covers generics, iterators and (XP) practices.' },
            query: 'generics XP',
            matches: true,
          },
        ])('$name', ({ talk, query, matches }) => {
          const target = blankTalk(talk);
          expect(new TalksFilter({ query }).filter([target])).toEqual(matches ? [target] : []);
        });

        it.each([
          ['c++', ['cpp']],
          ['c#', ['csharp']],
        ])('query "%s" matches only the talk about that language', (query, expectedIds) => {
          const talks = [
            blankTalk({ id: 'cpp', title: 'C++ Tips' }),
            blankTalk({ id: 'csharp', title: 'C# in depth' }),
            blankTalk({ id: 'clean', title: 'Clean Code' }),
          ];
          expect(ids(new TalksFilter({ query }).filter(talks))).toEqual(expectedIds);
        });
      });

      describe('multiple terms (AND logic)', () => {
        it('keeps only talks containing every term', () => {
          const talks = [
            createTalk({ id: 'both', title: 'Domain Driven Design' }),
            createTalk({ id: 'domain', title: 'Domain Modeling' }),
            createTalk({ id: 'design', title: 'Good Design Practices' }),
            createTalk({ id: 'none', title: 'Other Topic' }),
          ];
          expect(ids(new TalksFilter({ query: 'Domain Design' }).filter(talks))).toEqual(['both']);
        });

        it.each([
          ['title + speaker + description', 'Eric Domain patterns'],
          ['title + speaker + topic', 'Clean Robert Craftsmanship'],
          ['speaker + notes', 'Kent workflow'],
          ['title + description', 'Microservices resilience'],
          ['several spaces between terms', 'Clean    Martin'],
        ])('matches terms spread across fields: %s', (_name, query) => {
          const talk = blankTalk({
            title: 'Domain Modeling Clean Microservices',
            speakers: ['Eric Evans', 'Robert Martin', 'Kent Beck'],
            topics: ['Craftsmanship'],
            description: 'Strategic patterns and resilience',
            notes: 'Great explanation of TDD workflow',
          });
          expect(new TalksFilter({ query }).filter([talk])).toEqual([talk]);
        });

        it('rejects a talk when one term is found nowhere', () => {
          const talk = blankTalk({ title: 'Domain Modeling', speakers: ['Eric Evans'], description: 'Strategic patterns' });
          expect(new TalksFilter({ query: 'Domain hexagonal' }).filter([talk])).toEqual([]);
        });
      });

      describe('accent normalization', () => {
        it.each<{ name: string; talk: Partial<Talk>; query: string }>([
          { name: 'accented query vs plain title', talk: { title: 'Jose Garcia talks about refactoring' }, query: 'José García' },
          { name: 'plain query vs accented title', talk: { title: 'José García talks about Diseño' }, query: 'Jose Garcia Diseno' },
          { name: 'several accents in a title', talk: { title: 'Introducción a la programación funcional' }, query: 'Introduccion programacion' },
          { name: 'speakers and description', talk: { speakers: ['Raúl López'], description: 'Técnicas avanzadas' }, query: 'Raul Tecnicas' },
          { name: 'multiple speakers', talk: { speakers: ['José García', 'María Pérez'] }, query: 'Jose Maria' },
          { name: 'topics', talk: { topics: ['Diseño de Software', 'Programación'] }, query: 'Diseno Programacion' },
          { name: 'notes', talk: { notes: 'Explicación detallada de técnicas avanzadas' }, query: 'Explicacion tecnicas' },
        ])('matches ignoring accents: $name', ({ talk, query }) => {
          const target = blankTalk(talk);
          expect(new TalksFilter({ query }).filter([target])).toEqual([target]);
        });
      });
    });

    describe('year', () => {
      const yearTalks = [
        createTalk({ id: '2019', year: 2019 }),
        createTalk({ id: '2020', year: 2020 }),
        createTalk({ id: '2021', year: 2021 }),
        createTalk({ id: 'no-year', year: undefined }),
      ];

      it.each<[TalksFilterData['yearType'], string[]]>([
        ['specific', ['2020']],
        ['before', ['2019']],
        ['after', ['2021']],
      ])('%s 2020 keeps %j and excludes talks without year', (yearType, expectedIds) => {
        expect(ids(new TalksFilter({ yearType, year: 2020 }).filter(yearTalks))).toEqual(expectedIds);
      });

      it.each(['specific', 'before', 'after'] as const)('%s without a reference year keeps every talk', (yearType) => {
        expect(new TalksFilter({ yearType, year: null }).filter(yearTalks)).toEqual(yearTalks);
      });

      it('treats a year without yearType as specific', () => {
        expect(ids(new TalksFilter({ year: 2020 }).filter(yearTalks))).toEqual(['2020']);
        expect(ids(TalksFilter.fromUrlParams('year=2020').filter(yearTalks))).toEqual(['2020']);
      });

      describe('relative ranges (current year injected as FIXED_TEST_YEAR)', () => {
        const b = createBoundaryYearTalks(FIXED_TEST_YEAR);
        const rangeTalks = [b.current, b.minus1, b.minus2, b.minus3, b.minus4, b.minus5, b.minus6];

        it.each<[TalksFilterData['yearType'], string[]]>([
          ['last2', ['current', 'minus1', 'minus2']],
          ['last5', ['current', 'minus1', 'minus2', 'minus3', 'minus4', 'minus5']],
        ])('%s keeps %j', (yearType, expectedIds) => {
          const filter = new TalksFilter({ yearType, _testCurrentYear: FIXED_TEST_YEAR });
          expect(ids(filter.filter(rangeTalks))).toEqual(expectedIds);
        });

        it.each(['last2', 'last5'] as const)('%s excludes talks without year', (yearType) => {
          const talk = createTalk({ id: 'no-year', year: undefined });
          expect(new TalksFilter({ yearType, _testCurrentYear: FIXED_TEST_YEAR }).filter([talk])).toEqual([]);
        });

        it('measures the range from the injected current year', () => {
          const talk = createTalk({ id: 'old', year: createTestYear(-3) });
          const filter = new TalksFilter({ yearType: 'last2', _testCurrentYear: createTestYear(-1) });
          expect(ids(filter.filter([talk]))).toEqual(['old']);
        });
      });
    });

    describe('conference', () => {
      it('keeps only talks from that conference', () => {
        const talks = [
          createTalk({ id: 'a', conference_name: 'ConfA' }),
          createTalk({ id: 'b', conference_name: 'ConfB' }),
          createTalk({ id: 'none', conference_name: undefined }),
        ];
        expect(ids(TalksFilter.fromUrlParams('conference=ConfA').filter(talks))).toEqual(['a']);
      });
    });

    describe('hasNotes', () => {
      const talks = [
        createTalk({ id: 'notes', notes: 'Some notes' }),
        createTalk({ id: 'empty', notes: '' }),
        createTalk({ id: 'blank', notes: '  \n ' }),
        createTalk({ id: 'undefined', notes: undefined }),
      ];

      it('keeps only talks with meaningful notes when enabled', () => {
        expect(ids(TalksFilter.fromUrlParams('hasNotes=true').filter(talks))).toEqual(['notes']);
      });

      it('keeps every talk when disabled', () => {
        expect(new TalksFilter({ hasNotes: false }).filter(talks)).toEqual(talks);
      });
    });

    describe('rating', () => {
      const talks = [
        createTalk({ id: '5', rating: 5 }),
        createTalk({ id: '4', rating: 4 }),
        createTalk({ id: '3', rating: 3 }),
        createTalk({ id: 'unrated', rating: undefined }),
      ];

      it('keeps only talks with exactly that rating', () => {
        expect(ids(new TalksFilter({ rating: 5 }).filter(talks))).toEqual(['5']);
      });

      it('keeps rated and unrated talks when rating is null', () => {
        expect(new TalksFilter({ rating: null }).filter(talks)).toEqual(talks);
      });
    });

    describe('author and topics (constructor API)', () => {
      it('keeps only talks whose speakers include the author', () => {
        const talks = [
          createTalk({ id: 'alice-bob', speakers: ['Alice', 'Bob'] }),
          createTalk({ id: 'bob', speakers: ['Bob'] }),
          createTalk({ id: 'bob-carol', speakers: ['Bob', 'Carol'] }),
        ];
        expect(ids(new TalksFilter({ author: 'Alice' }).filter(talks))).toEqual(['alice-bob']);
        expect(new TalksFilter({ author: null }).filter(talks)).toEqual(talks);
      });

      it('requires every selected topic (AND logic)', () => {
        const talks = [
          createTalk({ id: 'react', topics: ['React'] }),
          createTalk({ id: 'ts', topics: ['TypeScript'] }),
          createTalk({ id: 'both', topics: ['React', 'TypeScript'] }),
          createTalk({ id: 'more', topics: ['React', 'TypeScript', 'Testing'] }),
          createTalk({ id: 'none', topics: [] }),
        ];
        expect(ids(new TalksFilter({ topics: ['React', 'TypeScript'] }).filter(talks))).toEqual(['both', 'more']);
        expect(new TalksFilter({ topics: [] }).filter(talks)).toEqual(talks);
      });
    });

    describe('formats', () => {
      const talks = [
        createTalk({ id: 'article', format: 'article' }),
        createTalk({ id: 'podcast', format: 'podcast' }),
        createTalk({ id: 'talk', format: 'talk' }),
        createTalk({ id: 'undefined', format: undefined }),
      ];

      it.each<[string[], string[]]>([
        [['podcast'], ['podcast']],
        [['article', 'podcast'], ['article', 'podcast']],
        [['talk'], ['talk', 'undefined']], // missing format defaults to "talk"
        [[], ['article', 'podcast', 'talk', 'undefined']],
      ])('formats %j keep %j', (formats, expectedIds) => {
        expect(ids(new TalksFilter({ formats }).filter(talks))).toEqual(expectedIds);
      });

      it('filters by formats parsed from the URL', () => {
        expect(ids(TalksFilter.fromUrlParams('format=podcast').filter(talks))).toEqual(['podcast']);
      });
    });

    describe('quickWatch (under 15 minutes)', () => {
      it.each([
        [0, false],
        [300, true],
        [600, true],
        [899, true],
        [900, false],
        [1200, false],
        [3600, false],
      ])('duration %is is kept: %s', (duration, kept) => {
        const talk = createTalk({ id: 'd', duration });
        expect(new TalksFilter({ quickWatch: true }).filter([talk])).toEqual(kept ? [talk] : []);
      });

      it('keeps every talk when disabled (the default)', () => {
        const talks = [createTalk({ id: '0', duration: 0 }), createTalk({ id: '600', duration: 600 }), createTalk({ id: '3600', duration: 3600 })];
        expect(new TalksFilter().quickWatch).toBe(false);
        expect(new TalksFilter({}).filter(talks)).toEqual(talks);
      });
    });

    describe('combined filters', () => {
      const matching = createTalk({
        id: 'match',
        title: 'Domain Modeling',
        year: 2023,
        speakers: ['Eric Evans'],
        topics: ['DDD'],
        conference_name: 'DDD Europe',
        notes: 'Strategic patterns about bounded contexts',
        rating: 5,
        format: 'article',
        duration: 600,
      });
      const allCriteria: TalksFilterData = {
        yearType: 'specific',
        year: 2023,
        conference: 'DDD Europe',
        hasNotes: true,
        rating: 5,
        formats: ['article'],
        quickWatch: true,
        query: 'Domain Eric patterns',
      };

      it('keeps a talk satisfying every criterion', () => {
        expect(new TalksFilter(allCriteria).filter([matching])).toEqual([matching]);
      });

      it.each<[string, Partial<Talk>]>([
        ['year', { year: 2020 }],
        ['conference', { conference_name: 'Other Conf' }],
        ['notes', { notes: '' }],
        ['rating', { rating: 4 }],
        ['format', { format: 'podcast' }],
        ['duration', { duration: 3600 }],
        ['query', { title: 'Test Talk', speakers: ['Someone'] }],
      ])('rejects a talk failing only the %s criterion', (_name, change) => {
        const failing = createTalk({ ...matching, id: 'fail', ...change });
        expect(ids(new TalksFilter(allCriteria).filter([matching, failing]))).toEqual(['match']);
      });

      it('combines year and query', () => {
        const talks = [
          createTalk({ id: 'tdd-2023', title: 'TDD Basics', year: 2023 }),
          createTalk({ id: 'tdd-2022', title: 'TDD Advanced', year: 2022 }),
          createTalk({ id: 'ref-2023', title: 'Refactoring', year: 2023 }),
        ];
        expect(ids(TalksFilter.fromUrlParams('year=2023&query=TDD').filter(talks))).toEqual(['tdd-2023']);
      });
    });
  });
});
