import { describe, it, expect } from 'vitest';
import { mergeParams, TALKS_FILTER_KEYS } from './url';

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

  it('removes all filter parameters including yearType', () => {
    const current = new URLSearchParams('year=2023&yearType=specific&extra=1');
    const next = new URLSearchParams();
    const result = mergeParams(current, next);
    expect(result.get('extra')).toBe('1');
    expect(result.get('year')).toBeNull();
    expect(result.get('yearType')).toBeNull();
  });

  it('removes yearType for last2 filter type', () => {
    const current = new URLSearchParams('yearType=last2&extra=keep');
    const next = new URLSearchParams();
    const result = mergeParams(current, next);
    expect(result.get('extra')).toBe('keep');
    expect(result.get('yearType')).toBeNull();
  });

  it('removes all TALKS_FILTER_KEYS parameters', () => {
    // Build URL with ALL filter keys
    const filterParams = TALKS_FILTER_KEYS.map(key => `${key}=test`).join('&');
    const current = new URLSearchParams(`${filterParams}&extra=preserved`);
    const next = new URLSearchParams();

    const result = mergeParams(current, next);

    // Non-filter param should be preserved
    expect(result.get('extra')).toBe('preserved');

    // ALL filter params should be removed
    TALKS_FILTER_KEYS.forEach(key => {
      expect(result.get(key)).toBeNull();
    });
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
