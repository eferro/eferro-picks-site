import { describe, it, expect } from 'vitest';
import { parseSearch } from './SearchParser';

describe('parseSearch', () => {
  it('parses author token', () => {
    const result = parseSearch('author:Alice');
    expect(result.author).toBe('Alice');
    expect(result.topics).toEqual([]);
    expect(result.query).toBe('');
  });

  it('parses multiple topics', () => {
    const result = parseSearch('topic:react topic:testing');
    expect(result.author).toBeNull();
    expect(result.topics).toEqual(['react', 'testing']);
  });

  it('parses mix of tokens and query text', () => {
    const result = parseSearch('author:Bob cool talk topic:javascript');
    expect(result.author).toBe('Bob');
    expect(result.topics).toEqual(['javascript']);
    expect(result.query).toBe('cool talk');
  });

  it('handles multi-word author names with quotes', () => {
    const result = parseSearch('author:"Kent Beck" topic:tdd');
    expect(result.author).toBe('Kent Beck');
    expect(result.topics).toEqual(['tdd']);
    expect(result.query).toBe('');
  });

  it('handles multi-word author names without quotes', () => {
    const result = parseSearch('author:Kent Beck topic:refactoring');
    expect(result.author).toBe('Kent Beck');
    expect(result.topics).toEqual(['refactoring']);
    expect(result.query).toBe('');
  });

  it('handles multi-word topic names with quotes', () => {
    const result = parseSearch('author:Alice topic:"unit testing"');
    expect(result.author).toBe('Alice');
    expect(result.topics).toEqual(['unit testing']);
    expect(result.query).toBe('');
  });

  it('treats common lowercase name particles as part of author names', () => {
    const result = parseSearch('author:Guido van Rossum topic:python');
    expect(result.author).toBe('Guido van Rossum');
    expect(result.topics).toEqual(['python']);
    expect(result.query).toBe('');
  });

  it('includes additional capitalized words in topic values without quotes', () => {
    const result = parseSearch('topic:Functional Programming author:Alice');
    expect(result.topics).toEqual(['Functional Programming']);
    expect(result.author).toBe('Alice');
    expect(result.query).toBe('');
  });

  it('retains lowercase suffixes for author names', () => {
    const result = parseSearch('author:Bob jr topic:testing');
    expect(result.author).toBe('Bob jr');
    expect(result.topics).toEqual(['testing']);
    expect(result.query).toBe('');
  });

  it('gracefully handles empty author token', () => {
    const result = parseSearch('author:   ');
    expect(result.author).toBeNull();
    expect(result.topics).toEqual([]);
    expect(result.query).toBe('');
  });

  it('gracefully handles empty topic token', () => {
    const result = parseSearch('topic:  ');
    expect(result.author).toBeNull();
    expect(result.topics).toEqual([]);
    expect(result.query).toBe('');
  });

  it('does not treat the next keyword as part of a missing author value', () => {
    const result = parseSearch('author: topic:architecture inspiring talk');
    expect(result.author).toBeNull();
    expect(result.topics).toEqual(['architecture']);
    expect(result.query).toBe('inspiring talk');
  });

  it('keeps uppercase general query terms out of author values', () => {
    const result = parseSearch('author:Kent Beck TDD fundamentals');
    expect(result.author).toBe('Kent Beck');
    expect(result.topics).toEqual([]);
    expect(result.query).toBe('TDD fundamentals');
  });
});
