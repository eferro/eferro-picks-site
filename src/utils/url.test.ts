import { describe, it, expect } from 'vitest';
import { mergeParams } from './url';
import { TalksFilter } from './TalksFilter';

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

  it('drops every param a fully populated filter writes when that filter is cleared', () => {
    // Independent of TALKS_FILTER_KEYS: if a new filter param is added to
    // TalksFilter.toParams() but not to the key list, clearing it would
    // leave the stale value in the URL.
    const fullFilter = new TalksFilter({
      yearType: 'before',
      year: 2020,
      conference: 'Agile Conf',
      hasNotes: true,
      rating: 5,
      query: 'tdd',
      formats: ['podcast'],
      quickWatch: true,
    });
    const current = new URLSearchParams(`${fullFilter.toParams()}&extra=kept`);

    const result = mergeParams(current, new URLSearchParams());

    expect(result.toString()).toBe('extra=kept');
  });

  it.each(['author', 'topics'])('drops the legacy %s param', (legacyKey) => {
    const current = new URLSearchParams(`${legacyKey}=value&extra=kept`);

    const result = mergeParams(current, new URLSearchParams());

    expect(result.toString()).toBe('extra=kept');
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
