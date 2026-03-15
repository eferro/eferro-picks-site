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


import { filterTalks, processTalks, transformAirtableItemToTalk } from './talks';
import type { AirtableItem } from '../hooks/useTalks';

describe('filterTalks', () => {
  const base: Omit<AirtableItem, 'airtable_id'> & { airtable_id: string } = {
    airtable_id: '0',
    name: 'Test',
    url: 'https://example.com',
    duration: 10,
    topics_names: [],
    speakers_names: [],
    description: '',
    core_topic: '',
    notes: 'notes',
    language: 'English',
    rating: 5,
    resource_type: 'talk',
    year: 2024,
    conference_name: 'Conf'
  } as unknown as AirtableItem;

  const make = (overrides: Partial<AirtableItem>): AirtableItem => ({
    ...base,
    ...overrides
  }) as AirtableItem;

  const sample = [
    make({ airtable_id: '1' }),
    make({ airtable_id: '2', language: 'Spanish' as never }),
    make({ airtable_id: '3', rating: 4 }),
    make({ airtable_id: '4', resource_type: 'invalid' as never }),
    make({ airtable_id: '5', language: undefined as never }) // missing language treated as English
  ];

  it('filters by language and resource type', () => {
    const result = filterTalks(sample, false);
    expect(result.map(i => i.airtable_id)).toEqual(['1', '3', '5']);
  });

  it('treats missing language as English so new items are included', () => {
    const withMissingLang = [make({ airtable_id: 'x', language: undefined as never })];
    const result = filterTalks(withMissingLang, false);
    expect(result).toHaveLength(1);
    expect(result[0].airtable_id).toBe('x');
  });

  it('also filters by rating when enabled', () => {
    const result = filterTalks(sample, true);
    expect(result.map(i => i.airtable_id)).toEqual(['1', '5']);
  });

  describe('rating filter mutation detection', () => {
    it('should only include exactly 5-star ratings when rating filter enabled', () => {
      const items = [
        make({ airtable_id: 'r1', rating: 4 }),  // Should NOT match (not 5)
        make({ airtable_id: 'r2', rating: 5 }),  // Should match (exactly 5)
        make({ airtable_id: 'r3', rating: 3 }),  // Should NOT match (not 5)
        make({ airtable_id: 'r4', rating: 1 }),  // Should NOT match (not 5)
      ];

      const result = filterTalks(items, true);
      expect(result).toHaveLength(1);
      expect(result[0].rating).toBe(5); // Verifies only 5-star items pass
      expect(result[0].airtable_id).toBe('r2');
    });

    it('should include all ratings when rating filter disabled', () => {
      const items = [
        make({ airtable_id: 'a1', rating: 4 }),
        make({ airtable_id: 'a2', rating: 5 }),
        make({ airtable_id: 'a3', rating: 3 }),
      ];

      const result = filterTalks(items, false);
      expect(result).toHaveLength(3); // Verifies rating filter is actually disabled
      expect(result.map(i => i.rating)).toEqual([4, 5, 3]);
    });

    it('should catch constant mutations in rating value', () => {
      // This would catch mutations like `!== 5` → `!== 4` or `!== 1`
      const items = [
        make({ airtable_id: 'c1', rating: 1 }),
        make({ airtable_id: 'c2', rating: 2 }),
        make({ airtable_id: 'c3', rating: 3 }),
        make({ airtable_id: 'c4', rating: 4 }),
        make({ airtable_id: 'c5', rating: 5 }),
      ];

      const result = filterTalks(items, true);
      // Only rating 5 should pass - this catches if the constant 5 gets mutated to 4, 3, etc.
      expect(result).toHaveLength(1);
      expect(result[0].airtable_id).toBe('c5');
      expect(result[0].rating).toBe(5);
    });

    it('should catch equality operator mutations (!== vs ===)', () => {
      // This would catch `item.rating !== 5` → `item.rating === 5` mutation
      const highRatedItems = [
        make({ airtable_id: 'eq1', rating: 5 }),
        make({ airtable_id: 'eq2', rating: 5 }),
      ];
      const lowRatedItems = [
        make({ airtable_id: 'eq3', rating: 1 }),
        make({ airtable_id: 'eq4', rating: 2 }),
      ];

      // With rating filter enabled, only 5s should pass
      const resultEnabled = filterTalks([...highRatedItems, ...lowRatedItems], true);
      expect(resultEnabled).toHaveLength(2);
      expect(resultEnabled.every(item => item.rating === 5)).toBe(true);

      // With rating filter disabled, all should pass
      const resultDisabled = filterTalks([...highRatedItems, ...lowRatedItems], false);
      expect(resultDisabled).toHaveLength(4);
    });
  });

  describe('language filter mutation detection', () => {
    it('should catch string equality mutations in language filtering', () => {
      const items = [
        make({ airtable_id: 'en1', language: 'English' }),
        make({ airtable_id: 'es1', language: 'Spanish' }),
        make({ airtable_id: 'fr1', language: 'French' }),
        make({ airtable_id: 'de1', language: 'German' }),
      ];

      const result = filterTalks(items, false);

      // Only English should pass - catches mutations like 'English' -> 'Spanish'
      expect(result).toHaveLength(1);
      expect(result[0].language).toBe('English');
      expect(result[0].airtable_id).toBe('en1');
    });

    it('should catch negation mutations in language filtering', () => {
      const items = [
        make({ airtable_id: 'en1', language: 'English' }),
        make({ airtable_id: 'es1', language: 'Spanish' }),
      ];

      // This catches mutations like `lang !== 'English'` -> `lang === 'English'`
      const result = filterTalks(items, false);
      expect(result).toHaveLength(1);
      expect(result[0].language).toBe('English');

      // Spanish should be filtered out
      expect(result.every(item => item.language !== 'Spanish')).toBe(true);
    });

    it('should handle undefined/null language as English (default behavior)', () => {
      const items = [
        make({ airtable_id: 'null1', language: null as never }),
        make({ airtable_id: 'undef1', language: undefined as never }),
        make({ airtable_id: 'empty1', language: '' as never }),
        make({ airtable_id: 'space1', language: '  ' as never }),
      ];

      const result = filterTalks(items, false);

      // All should be treated as English and pass
      expect(result).toHaveLength(4);
      expect(result.map(item => item.airtable_id)).toEqual(['null1', 'undef1', 'empty1', 'space1']);
    });
  });

  describe('resource type filter mutation detection', () => {
    it('should filter by valid resource types only', () => {
      const items = [
        make({ airtable_id: 't1', resource_type: 'talk' }),
        make({ airtable_id: 'p1', resource_type: 'podcast' }),
        make({ airtable_id: 'v1', resource_type: 'video' }),
        make({ airtable_id: 'vp1', resource_type: 'videopodcast' }),
        make({ airtable_id: 'invalid1', resource_type: 'invalid' as never }),
        make({ airtable_id: 'book1', resource_type: 'book' as never }),
      ];

      const result = filterTalks(items, false);

      // Only valid types should pass
      expect(result).toHaveLength(4);
      expect(result.map(item => item.airtable_id)).toEqual(['t1', 'p1', 'v1', 'vp1']);
      expect(result.every(item =>
        ['talk', 'podcast', 'video', 'videopodcast'].includes(item.resource_type)
      )).toBe(true);
    });

    it('should handle case-insensitive resource type matching', () => {
      const items = [
        make({ airtable_id: 'upper1', resource_type: 'TALK' as never }),
        make({ airtable_id: 'mixed1', resource_type: 'Podcast' as never }),
        make({ airtable_id: 'lower1', resource_type: 'video' }),
      ];

      const result = filterTalks(items, false);

      // All should pass due to toLowerCase() processing
      expect(result).toHaveLength(3);
      expect(result.map(item => item.airtable_id)).toEqual(['upper1', 'mixed1', 'lower1']);
    });

    it('should exclude undefined/null resource types', () => {
      const items = [
        make({ airtable_id: 'valid1', resource_type: 'talk' }),
        make({ airtable_id: 'null1', resource_type: null as never }),
        make({ airtable_id: 'undef1', resource_type: undefined as never }),
      ];

      const result = filterTalks(items, false);

      // Only valid resource type should pass
      expect(result).toHaveLength(1);
      expect(result[0].airtable_id).toBe('valid1');
    });
  });

  describe('logical operator mutations in filtering conditions', () => {
    it('should use AND logic for all filter conditions', () => {
      const items = [
        // Passes all conditions
        make({
          airtable_id: 'pass1',
          language: 'English',
          rating: 5,
          resource_type: 'talk'
        }),
        // Fails language check
        make({
          airtable_id: 'fail1',
          language: 'Spanish',
          rating: 5,
          resource_type: 'talk'
        }),
        // Fails rating check
        make({
          airtable_id: 'fail2',
          language: 'English',
          rating: 3,
          resource_type: 'talk'
        }),
        // Fails resource type check
        make({
          airtable_id: 'fail3',
          language: 'English',
          rating: 5,
          resource_type: 'invalid' as never
        }),
      ];

      const result = filterTalks(items, true); // Enable rating filter

      // Only item passing ALL conditions should remain
      expect(result).toHaveLength(1);
      expect(result[0].airtable_id).toBe('pass1');
    });

    it('should catch boolean parameter mutations', () => {
      const items = [
        make({ airtable_id: 'r5', rating: 5 }),
        make({ airtable_id: 'r4', rating: 4 }),
      ];

      // Test filterByRating = true
      const withRatingFilter = filterTalks(items, true);
      expect(withRatingFilter).toHaveLength(1);
      expect(withRatingFilter[0].rating).toBe(5);

      // Test filterByRating = false
      const withoutRatingFilter = filterTalks(items, false);
      expect(withoutRatingFilter).toHaveLength(2);

      // This catches mutations where the boolean parameter gets negated
      expect(withoutRatingFilter.some(item => item.rating === 4)).toBe(true);
    });
  });
});

describe('transformAirtableItemToTalk', () => {
  it('maps article/paper resource_type to article format and handles missing arrays', () => {
    const item = {
      airtable_id: 'a1',
      name: 'Article',
      url: 'https://article',
      duration: undefined,
      topics_names: undefined,
      speakers_names: undefined,
      description: '',
      core_topic: '',
      notes: '',
      language: 'English',
      rating: 5,
      resource_type: 'article/paper',
      year: 2024,
      conference_name: 'Conf'
    } as unknown as AirtableItem;

    const talk = transformAirtableItemToTalk(item);
    expect(talk.format).toBe('article');
    expect(talk.duration).toBe(0);
    expect(talk.topics).toEqual([]);
    expect(talk.speakers).toEqual([]);
  });

  describe('format transformation mutation detection', () => {
    it('should correctly map resource types to formats', () => {
      const testCases = [
        { resource_type: 'talk', expected: 'talk' },
        { resource_type: 'video', expected: 'talk' },
        { resource_type: 'podcast', expected: 'podcast' },
        { resource_type: 'videopodcast', expected: 'podcast' },
        { resource_type: 'article/paper', expected: 'article' },
      ];

      testCases.forEach(({ resource_type, expected }) => {
        const item = {
          airtable_id: `test-${resource_type}`,
          name: 'Test',
          url: 'https://test.com',
          resource_type,
        } as unknown as AirtableItem;

        const result = transformAirtableItemToTalk(item);
        expect(result.format).toBe(expected);
      });
    });

    it('should handle case-sensitive resource type comparisons', () => {
      // Test that toLowerCase() is actually applied
      const upperCaseItem = {
        airtable_id: 'test1',
        name: 'Test',
        url: 'https://test.com',
        resource_type: 'PODCAST',
      } as unknown as AirtableItem;

      const result = transformAirtableItemToTalk(upperCaseItem);
      expect(result.format).toBe('podcast'); // Should work despite uppercase

      // Test mixed case
      const mixedCaseItem = {
        airtable_id: 'test2',
        name: 'Test',
        url: 'https://test.com',
        resource_type: 'VideoPodcast',
      } as unknown as AirtableItem;

      const result2 = transformAirtableItemToTalk(mixedCaseItem);
      expect(result2.format).toBe('podcast');
    });

    it('should default to "talk" format for unknown resource types', () => {
      const unknownTypeItem = {
        airtable_id: 'test1',
        name: 'Test',
        url: 'https://test.com',
        resource_type: 'unknown',
      } as unknown as AirtableItem;

      const result = transformAirtableItemToTalk(unknownTypeItem);
      expect(result.format).toBe('talk'); // Default format
    });
  });

  describe('duration transformation mutation detection', () => {
    it('should handle undefined duration as 0', () => {
      const item = {
        airtable_id: 'test1',
        name: 'Test',
        url: 'https://test.com',
        duration: undefined,
      } as unknown as AirtableItem;

      const result = transformAirtableItemToTalk(item);
      expect(result.duration).toBe(0); // Should default to 0
    });

    it('should preserve valid duration values', () => {
      const item = {
        airtable_id: 'test1',
        name: 'Test',
        url: 'https://test.com',
        duration: 1800, // 30 minutes
      } as unknown as AirtableItem;

      const result = transformAirtableItemToTalk(item);
      expect(result.duration).toBe(1800); // Should preserve value
    });

    it('should handle null duration as 0', () => {
      const item = {
        airtable_id: 'test1',
        name: 'Test',
        url: 'https://test.com',
        duration: null,
      } as unknown as AirtableItem;

      const result = transformAirtableItemToTalk(item);
      expect(result.duration).toBe(0); // Should default to 0
    });
  });

  describe('array field transformation mutation detection', () => {
    it('should handle undefined arrays as empty arrays', () => {
      const item = {
        airtable_id: 'test1',
        name: 'Test',
        url: 'https://test.com',
        topics_names: undefined,
        speakers_names: undefined,
      } as unknown as AirtableItem;

      const result = transformAirtableItemToTalk(item);
      expect(result.topics).toEqual([]);
      expect(result.speakers).toEqual([]);
    });

    it('should handle null arrays as empty arrays', () => {
      const item = {
        airtable_id: 'test1',
        name: 'Test',
        url: 'https://test.com',
        topics_names: null,
        speakers_names: null,
      } as unknown as AirtableItem;

      const result = transformAirtableItemToTalk(item);
      expect(result.topics).toEqual([]);
      expect(result.speakers).toEqual([]);
    });

    it('should preserve existing array values', () => {
      const item = {
        airtable_id: 'test1',
        name: 'Test',
        url: 'https://test.com',
        topics_names: ['React', 'Testing'],
        speakers_names: ['Kent Beck', 'Martin Fowler'],
      } as unknown as AirtableItem;

      const result = transformAirtableItemToTalk(item);
      expect(result.topics).toEqual(['React', 'Testing']);
      expect(result.speakers).toEqual(['Kent Beck', 'Martin Fowler']);
    });
  });

  describe('notes transformation with hasMeaningfulNotes integration', () => {
    it('should set notes to undefined when hasMeaningfulNotes returns false', () => {
      const itemsWithEmptyNotes = [
        { notes: '' },
        { notes: '   ' },
        { notes: '\n\n' },
        { notes: null },
        { notes: undefined },
      ];

      itemsWithEmptyNotes.forEach((noteCase, index) => {
        const item = {
          airtable_id: `test${index}`,
          name: 'Test',
          url: 'https://test.com',
          ...noteCase,
        } as unknown as AirtableItem;

        const result = transformAirtableItemToTalk(item);
        expect(result.notes).toBeUndefined(); // Should be undefined for empty notes
      });
    });

    it('should preserve notes when hasMeaningfulNotes returns true', () => {
      const item = {
        airtable_id: 'test1',
        name: 'Test',
        url: 'https://test.com',
        notes: 'These are meaningful notes',
      } as unknown as AirtableItem;

      const result = transformAirtableItemToTalk(item);
      expect(result.notes).toBe('These are meaningful notes');
    });

    it('should preserve notes with whitespace when they have content', () => {
      const item = {
        airtable_id: 'test1',
        name: 'Test',
        url: 'https://test.com',
        notes: '  Good notes with spaces  \n',
      } as unknown as AirtableItem;

      const result = transformAirtableItemToTalk(item);
      expect(result.notes).toBe('  Good notes with spaces  \n'); // Preserves original formatting
    });
  });
});

describe('processTalks', () => {
  const items: AirtableItem[] = [
    {
      airtable_id: '1',
      name: 'Valid',
      url: 'https://1',
      duration: 20,
      topics_names: ['a'],
      speakers_names: ['s'],
      description: 'd',
      core_topic: 'c',
      notes: '  good  ',
      language: 'English',
      rating: 5,
      resource_type: 'talk',
      year: 2024,
      conference_name: 'ConfA'
    } as unknown as AirtableItem,
    {
      airtable_id: '2',
      name: 'Another',
      url: 'https://2',
      duration: 10,
      topics_names: [],
      speakers_names: [],
      description: '',
      core_topic: '',
      notes: '   ',
      language: 'English',
      rating: 4,
      resource_type: 'talk',
      year: 2024,
      conference_name: 'ConfB'
    } as unknown as AirtableItem,
    {
      airtable_id: '3',
      name: 'Spanish',
      url: 'https://3',
      duration: 5,
      topics_names: [],
      speakers_names: [],
      description: '',
      core_topic: '',
      notes: '',
      language: 'Spanish',
      rating: 5,
      resource_type: 'talk',
      year: 2024,
      conference_name: 'ConfC'
    } as unknown as AirtableItem
  ];

  it('transforms and filters items', () => {
    const result = processTalks(items, false);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: '1',
      title: 'Valid',
      notes: '  good  '
    });
    expect(result[1].notes).toBeUndefined();
  });

  it('applies rating filter when requested', () => {
    const result = processTalks(items, true);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('maps resource_type to format field', () => {
    const customItems = [
      { ...items[0], resource_type: 'talk' },
      { ...items[1], airtable_id: '10', resource_type: 'podcast' }
    ];
    const result = processTalks(customItems, false);
    expect(result[0]).toHaveProperty('format', 'talk');
    expect(result[1]).toHaveProperty('format', 'podcast');
  });

  it('includes and maps video resource_type to talk format', () => {
    const videoItem = {
      ...items[0],
      airtable_id: 'video1',
      name: 'Red Bead Experiment',
      resource_type: 'video'
    };
    const result = processTalks([videoItem], false);
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('format', 'talk');
    expect(result[0].title).toBe('Red Bead Experiment');
  });
});
