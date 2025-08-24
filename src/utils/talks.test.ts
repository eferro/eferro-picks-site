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
  });
}); 


import { filterTalks, processTalks } from './talks';
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
    make({ airtable_id: '4', resource_type: 'invalid' as never })
  ];

  it('filters by language and resource type', () => {
    const result = filterTalks(sample, false);
    expect(result.map(i => i.airtable_id)).toEqual(['1', '3']);
  });

  it('also filters by rating when enabled', () => {
    const result = filterTalks(sample, true);
    expect(result.map(i => i.airtable_id)).toEqual(['1']);
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
