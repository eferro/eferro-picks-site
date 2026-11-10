import { describe, it, expect } from 'vitest';
import { getSuggestions } from './Autocomplete';
import { createTalk } from '../test/builders';
import type { Talk } from '../types/talks';

const talkWith = (speakers: string[], topics: string[]): Talk => createTalk({ speakers, topics });

const values = (talks: Talk[], query: string, max?: number) =>
  getSuggestions(talks, query, max).map(s => s.value);

describe('getSuggestions', () => {
  const talks = [
    talkWith(['Alice', 'Bob'], ['React', 'TypeScript']),
    talkWith(['Carol', 'José García'], ['Testing', 'TDD']),
  ];

  describe('no suggestions', () => {
    it.each([
      ['an empty query', ''],
      // A space would otherwise match every multi-word name such as "José García"
      ['a whitespace-only query', '   '],
    ])('for %s', (_case, query) => {
      expect(getSuggestions(talks, query)).toEqual([]);
    });

    it('when there are no talks', () => {
      expect(getSuggestions([], 'query')).toEqual([]);
    });

    it('when talks have no speakers or topics', () => {
      const incomplete = [createTalk({ speakers: undefined, topics: undefined })] as unknown as Talk[];

      expect(getSuggestions(incomplete, 'a')).toEqual([]);
    });
  });

  describe('matching', () => {
    it.each([
      ['the start of a speaker name', 'Ali', ['Alice']],
      ['the middle of a speaker name', 'garc', ['José García']],
      ['the start of a topic', 'Tes', ['Testing']],
      ['ignoring case', 'ALICE', ['Alice']],
      ['ignoring accents in the data', 'jose', ['José García']],
      ['ignoring accents in the query', 'Jósé', ['José García']],
    ])('matches %s', (_case, query, expected) => {
      expect(values(talks, query)).toEqual(expected);
    });
  });

  it('describes each suggestion with its type, value and label', () => {
    expect(getSuggestions(talks, 'Alice')).toEqual([{ type: 'speaker', value: 'Alice', label: 'Alice' }]);
    expect(getSuggestions(talks, 'React')).toEqual([{ type: 'topic', value: 'React', label: 'React' }]);
  });

  it('lists every matching speaker before any matching topic', () => {
    // 'a' matches speakers (Alice, Carol, José García) and a topic (React)
    expect(values(talks, 'a')).toEqual(['Alice', 'Carol', 'José García', 'React']);
  });

  it('suggests each speaker and topic only once', () => {
    const repeated = [talkWith(['Alice'], ['React']), talkWith(['Alice'], ['React'])];

    expect(values(repeated, 'Alice')).toEqual(['Alice']);
    expect(values(repeated, 'React')).toEqual(['React']);
  });

  describe('limit', () => {
    const manySpeakers = Array.from({ length: 20 }, (_, i) => talkWith([`Speaker ${i}`], []));

    it('returns at most 10 suggestions by default', () => {
      expect(getSuggestions(manySpeakers, 'Speaker')).toHaveLength(10);
    });

    it('returns at most the requested number of suggestions', () => {
      expect(getSuggestions(manySpeakers, 'Speaker', 7)).toHaveLength(7);
    });
  });
});
