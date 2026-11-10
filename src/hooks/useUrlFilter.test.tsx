import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useUrlFilter } from './useUrlFilter';
import { routerWrapper, currentParams } from '../test/router';

const renderUseUrlFilter = (params = '') =>
  renderHook(() => useUrlFilter(), { wrapper: routerWrapper({ params }) });

describe('useUrlFilter', () => {
  it('parses the filter from the URL', () => {
    const { result } = renderUseUrlFilter('query=testing');

    expect(result.current.filter.query).toBe('testing');
  });

  it('writes the updated filter to the URL', () => {
    const { result } = renderUseUrlFilter();

    act(() => result.current.updateFilter({ query: 'Alice react' }));

    expect(currentParams().get('query')).toBe('Alice react');
  });

  it('exposes the updated filter after the URL changes', () => {
    const { result } = renderUseUrlFilter();

    act(() => result.current.updateFilter({ hasNotes: true }));

    expect(result.current.filter.hasNotes).toBe(true);
  });

  it('preserves unrelated params when updating', () => {
    const { result } = renderUseUrlFilter('page=2');

    act(() => result.current.updateFilter({ query: 'testing' }));

    expect(currentParams().toString()).toBe('query=testing&page=2');
  });

  it('overrides existing values and keeps the other filters', () => {
    // Kills the spread order mutation {...updates, ...filter}
    const { result } = renderUseUrlFilter('query=oldValue&hasNotes=true');

    act(() => result.current.updateFilter({ query: 'newValue' }));

    expect(currentParams().get('query')).toBe('newValue');
    expect(currentParams().get('hasNotes')).toBe('true');
  });

  describe('clearing the year filter', () => {
    it.each([
      'year=2023&yearType=specific',
      'yearType=last2',
      'yearType=last5',
      'year=2020&yearType=before',
      'year=2020&yearType=after',
    ])('removes year and yearType for "%s"', (params) => {
      const { result } = renderUseUrlFilter(params);

      act(() => result.current.updateFilter({ year: null, yearType: null }));

      expect(currentParams().get('year')).toBeNull();
      expect(currentParams().get('yearType')).toBeNull();
    });

    it('preserves non-filter params', () => {
      const { result } = renderUseUrlFilter('yearType=last2&page=3&scroll=100');

      act(() => result.current.updateFilter({ yearType: null, year: null }));

      expect(currentParams().toString()).toBe('page=3&scroll=100');
    });
  });
});
