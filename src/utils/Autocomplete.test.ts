import { describe, it, expect } from 'vitest';
import { Autocomplete, getSuggestions } from './Autocomplete';
import type { Talk } from '../types/talks';

const talks: Talk[] = [
  {
    id: '1',
    title: 'T1',
    url: '',
    duration: 0,
    topics: ['react', 'javascript'],
    speakers: ['Alice'],
    description: '',
    core_topic: ''
  },
  {
    id: '2',
    title: 'T2',
    url: '',
    duration: 0,
    topics: ['testing', 'javascript'],
    speakers: ['Bob'],
    description: '',
    core_topic: ''
  },
  {
    id: '3',
    title: 'T3',
    url: '',
    duration: 0,
    topics: ['react'],
    speakers: ['Alice', 'Carol'],
    description: '',
    core_topic: ''
  }
];

describe('Autocomplete', () => {
  const ac = new Autocomplete(talks);

  it('suggests topics matching query case-insensitively', () => {
    expect(ac.autocompleteTopics('re')).toEqual(['react']);
    expect(ac.autocompleteTopics('JAV')).toEqual(['javascript']);
  });

  it('deduplicates topics', () => {
    expect(ac.autocompleteTopics('')).toEqual(['javascript', 'react', 'testing']);
  });

  it('suggests speakers matching query case-insensitively', () => {
    expect(ac.autocompleteSpeakers('al')).toEqual(['Alice']);
    expect(ac.autocompleteSpeakers('b')).toEqual(['Bob']);
  });

  it('deduplicates speakers', () => {
    expect(ac.autocompleteSpeakers('')).toEqual(['Alice', 'Bob', 'Carol']);
  });

  describe('accent/diacritic handling', () => {
    const talksWithAccents: Talk[] = [
      {
        id: '1',
        title: 'Talk',
        url: '',
        duration: 0,
        topics: ['Diseño de Software', 'Programación'],
        speakers: ['Rafa Gómez', 'José García'],
        description: '',
        core_topic: ''
      }
    ];
    const acWithAccents = new Autocomplete(talksWithAccents);

    it('finds speakers when searching without accents', () => {
      expect(acWithAccents.autocompleteSpeakers('Gomez')).toEqual(['Rafa Gómez']);
      expect(acWithAccents.autocompleteSpeakers('gomez')).toEqual(['Rafa Gómez']);
      expect(acWithAccents.autocompleteSpeakers('Garcia')).toEqual(['José García']);
      expect(acWithAccents.autocompleteSpeakers('Jose')).toEqual(['José García']);
    });

    it('finds speakers when searching with accents', () => {
      expect(acWithAccents.autocompleteSpeakers('Gómez')).toEqual(['Rafa Gómez']);
      expect(acWithAccents.autocompleteSpeakers('García')).toEqual(['José García']);
    });

    it('finds topics when searching without accents', () => {
      expect(acWithAccents.autocompleteTopics('Diseno')).toEqual(['Diseño de Software']);
      expect(acWithAccents.autocompleteTopics('Programacion')).toEqual(['Programación']);
    });
  });
});

describe('getSuggestions', () => {
  const talks: Talk[] = [
    {
      id: '1',
      title: 'T1',
      url: '',
      duration: 0,
      topics: ['React', 'TypeScript'],
      speakers: ['Alice', 'Bob'],
      description: '',
      core_topic: ''
    },
    {
      id: '2',
      title: 'T2',
      url: '',
      duration: 0,
      topics: ['Testing', 'TDD'],
      speakers: ['Carol'],
      description: '',
      core_topic: ''
    }
  ];

  describe('Empty Query Handling', () => {
    it('should return empty array for empty query', () => {
      expect(getSuggestions(talks, '')).toEqual([]);
    });

    it('should return empty array for whitespace-only query', () => {
      expect(getSuggestions(talks, '   \n  ')).toEqual([]);
    });
  });

  describe('Speaker and Topic Ordering', () => {
    it('should return speakers before topics', () => {
      const result = getSuggestions(talks, 't');
      const types = result.map(s => s.type);
      const firstTopicIndex = types.indexOf('topic');
      const lastSpeakerIndex = types.lastIndexOf('speaker');

      if (firstTopicIndex !== -1 && lastSpeakerIndex !== -1) {
        expect(lastSpeakerIndex).toBeLessThan(firstTopicIndex);
      }
    });

    it('should return only speakers when no topics match', () => {
      const result = getSuggestions(talks, 'Alice');
      expect(result.every(s => s.type === 'speaker')).toBe(true);
    });

    it('should return only topics when no speakers match', () => {
      const result = getSuggestions(talks, 'TypeScript');
      expect(result.every(s => s.type === 'topic')).toBe(true);
    });
  });

  describe('MaxSuggestions Limit', () => {
    it('should respect maxSuggestions limit', () => {
      const manyTalks = Array.from({ length: 20 }, (_, i) => ({
        id: `${i}`,
        title: 'Talk',
        url: '',
        duration: 0,
        topics: [`Topic${i}`],
        speakers: [`Speaker${i}`],
        description: '',
        core_topic: ''
      }));
      const result = getSuggestions(manyTalks, 'e', 5);
      expect(result.length).toBeLessThanOrEqual(5);
    });

    it('should return exactly maxSuggestions when more matches available', () => {
      const manyTalks = Array.from({ length: 20 }, (_, i) => ({
        id: `${i}`,
        title: 'Talk',
        url: '',
        duration: 0,
        topics: [],
        speakers: [`Speaker${i}`],
        description: '',
        core_topic: ''
      }));
      const result = getSuggestions(manyTalks, 'Speaker', 7);
      expect(result.length).toBe(7);
    });

    it('should return fewer than maxSuggestions when fewer matches available', () => {
      const result = getSuggestions(talks, 'Alice', 10);
      expect(result.length).toBeLessThan(10);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should use default maxSuggestions of 10 when not specified', () => {
      const manyTalks = Array.from({ length: 20 }, (_, i) => ({
        id: `${i}`,
        title: 'Talk',
        url: '',
        duration: 0,
        topics: [`Topic${i}`],
        speakers: [`Speaker${i}`],
        description: '',
        core_topic: ''
      }));
      const result = getSuggestions(manyTalks, 'e');
      expect(result.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Deduplication', () => {
    it('should deduplicate speakers across talks', () => {
      const duplicateSpeakers = [
        {
          id: '1',
          title: 'T1',
          url: '',
          duration: 0,
          topics: [],
          speakers: ['Alice'],
          description: '',
          core_topic: ''
        },
        {
          id: '2',
          title: 'T2',
          url: '',
          duration: 0,
          topics: [],
          speakers: ['Alice'],
          description: '',
          core_topic: ''
        },
        {
          id: '3',
          title: 'T3',
          url: '',
          duration: 0,
          topics: [],
          speakers: ['Alice'],
          description: '',
          core_topic: ''
        }
      ];
      const result = getSuggestions(duplicateSpeakers, 'Alice');
      expect(result).toHaveLength(1);
      expect(result[0].value).toBe('Alice');
    });

    it('should deduplicate topics across talks', () => {
      const duplicateTopics = [
        {
          id: '1',
          title: 'T1',
          url: '',
          duration: 0,
          topics: ['React'],
          speakers: [],
          description: '',
          core_topic: ''
        },
        {
          id: '2',
          title: 'T2',
          url: '',
          duration: 0,
          topics: ['React'],
          speakers: [],
          description: '',
          core_topic: ''
        }
      ];
      const result = getSuggestions(duplicateTopics, 'React');
      expect(result).toHaveLength(1);
      expect(result[0].value).toBe('React');
    });
  });

  describe('Accent Handling', () => {
    it('should handle accent-insensitive matching for speakers', () => {
      const accentTalks = [
        {
          id: '1',
          title: 'Talk',
          url: '',
          duration: 0,
          topics: [],
          speakers: ['José García'],
          description: '',
          core_topic: ''
        }
      ];
      const result = getSuggestions(accentTalks, 'jose');
      expect(result.some(s => s.value === 'José García')).toBe(true);
    });

    it('should handle accent-insensitive matching for topics', () => {
      const accentTalks = [
        {
          id: '1',
          title: 'Talk',
          url: '',
          duration: 0,
          topics: ['Diseño'],
          speakers: [],
          description: '',
          core_topic: ''
        }
      ];
      const result = getSuggestions(accentTalks, 'diseno');
      expect(result.some(s => s.value === 'Diseño')).toBe(true);
    });

    it('should match with accents in query against text without accents', () => {
      const accentTalks = [
        {
          id: '1',
          title: 'Talk',
          url: '',
          duration: 0,
          topics: ['Design'],
          speakers: ['Jose Garcia'],
          description: '',
          core_topic: ''
        }
      ];
      const result = getSuggestions(accentTalks, 'José');
      expect(result.some(s => s.value === 'Jose Garcia')).toBe(true);
    });
  });

  describe('Case Insensitivity', () => {
    it('should match speakers case-insensitively', () => {
      const result = getSuggestions(talks, 'ALICE');
      expect(result.some(s => s.value === 'Alice')).toBe(true);
    });

    it('should match topics case-insensitively', () => {
      const result = getSuggestions(talks, 'react');
      expect(result.some(s => s.value === 'React')).toBe(true);
    });
  });

  describe('Partial Matching', () => {
    it('should match partial speaker names', () => {
      const result = getSuggestions(talks, 'Ali');
      expect(result.some(s => s.value === 'Alice')).toBe(true);
    });

    it('should match partial topic names', () => {
      const result = getSuggestions(talks, 'Tes');
      expect(result.some(s => s.value === 'Testing')).toBe(true);
    });
  });

  describe('Suggestion Structure', () => {
    it('should return suggestions with correct structure for speakers', () => {
      const result = getSuggestions(talks, 'Alice');
      const speaker = result.find(s => s.value === 'Alice');
      expect(speaker).toEqual({
        type: 'speaker',
        value: 'Alice',
        label: 'Alice'
      });
    });

    it('should return suggestions with correct structure for topics', () => {
      const result = getSuggestions(talks, 'React');
      const topic = result.find(s => s.value === 'React');
      expect(topic).toEqual({
        type: 'topic',
        value: 'React',
        label: 'React'
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty talks array', () => {
      expect(getSuggestions([], 'query')).toEqual([]);
    });

    it('should handle talks with undefined speakers', () => {
      const talksWithUndefined = [
        {
          id: '1',
          title: 'T1',
          url: '',
          duration: 0,
          topics: ['React'],
          speakers: undefined as unknown as string[],
          description: '',
          core_topic: ''
        }
      ];
      expect(() => getSuggestions(talksWithUndefined, 'query')).not.toThrow();
    });

    it('should handle talks with undefined topics', () => {
      const talksWithUndefined = [
        {
          id: '1',
          title: 'T1',
          url: '',
          duration: 0,
          topics: undefined as unknown as string[],
          speakers: ['Alice'],
          description: '',
          core_topic: ''
        }
      ];
      expect(() => getSuggestions(talksWithUndefined, 'query')).not.toThrow();
    });
  });
});
