import { describe, it, expect } from 'vitest';
import { mergeParams } from './url';

describe('mergeParams', () => {
  it('copies non-filter params', () => {
    const current = new URLSearchParams('foo=bar&author=Alice');
    const next = new URLSearchParams('author=Bob');
    const result = mergeParams(current, next);
    expect(result.get('foo')).toBe('bar');
    expect(result.get('author')).toBe('Bob');
  });

  it('does not copy filter params', () => {
    const current = new URLSearchParams('year=2023&extra=1');
    const next = new URLSearchParams();
    const result = mergeParams(current, next);
    expect(result.get('extra')).toBe('1');
    expect(result.get('year')).toBeNull();
  });

  it('does not override existing params in next', () => {
    const current = new URLSearchParams('foo=bar');
    const next = new URLSearchParams('foo=baz');
    const result = mergeParams(current, next);
    expect(result.get('foo')).toBe('baz');
  });

  it('does not mutate next params', () => {
    const current = new URLSearchParams('foo=bar');
    const next = new URLSearchParams();
    const result = mergeParams(current, next);
    expect(result.get('foo')).toBe('bar');
    expect(next.get('foo')).toBeNull();
    expect(result).not.toBe(next);
  });
});
