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
});
