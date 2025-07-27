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
});
