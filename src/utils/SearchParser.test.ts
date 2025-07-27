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
});
