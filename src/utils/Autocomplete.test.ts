import { describe, it, expect } from 'vitest';
import { Autocomplete } from './Autocomplete';
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
