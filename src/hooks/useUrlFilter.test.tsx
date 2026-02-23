import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { setMockSearchParams, mockSetSearchParams } from '../test/utils';
import { useUrlFilter } from './useUrlFilter';

describe('useUrlFilter', () => {
  it('parses filter from url params (unified query)', () => {
    setMockSearchParams(new URLSearchParams('query=testing'));
    const { result } = renderHook(() => useUrlFilter());
    expect(result.current.filter.query).toBe('testing');
  });

  it('updates search params when calling updateFilter', () => {
    setMockSearchParams(new URLSearchParams());
    const { result } = renderHook(() => useUrlFilter());
    result.current.updateFilter({ query: 'Alice react' });
    const params = mockSetSearchParams.mock.calls[0][0] as URLSearchParams;
    expect(params.get('query')).toBe('Alice react');
  });

  it('preserves unrelated params when updating', () => {
    setMockSearchParams(new URLSearchParams('page=2'));
    const { result } = renderHook(() => useUrlFilter());
    result.current.updateFilter({ query: 'testing' });
    const params = mockSetSearchParams.mock.calls[0][0] as URLSearchParams;
    expect(params.get('page')).toBe('2');
    expect(params.get('query')).toBe('testing');
  });

  describe('Year Filter Removal', () => {
    it('clears year filter including yearType parameter', () => {
      setMockSearchParams(new URLSearchParams('year=2023&yearType=specific'));
      const { result } = renderHook(() => useUrlFilter());

      // Clear year filter
      result.current.updateFilter({ year: null, yearType: null });

      const params = mockSetSearchParams.mock.calls[0][0] as URLSearchParams;
      expect(params.get('year')).toBeNull();
      expect(params.get('yearType')).toBeNull();
    });

    it('clears last2 year filter', () => {
      setMockSearchParams(new URLSearchParams('yearType=last2'));
      const { result } = renderHook(() => useUrlFilter());

      result.current.updateFilter({ yearType: null, year: null });

      const params = mockSetSearchParams.mock.calls[0][0] as URLSearchParams;
      expect(params.get('yearType')).toBeNull();
      expect(params.get('year')).toBeNull();
    });

    it('clears last5 year filter', () => {
      setMockSearchParams(new URLSearchParams('yearType=last5'));
      const { result } = renderHook(() => useUrlFilter());

      result.current.updateFilter({ yearType: null, year: null });

      const params = mockSetSearchParams.mock.calls[0][0] as URLSearchParams;
      expect(params.get('yearType')).toBeNull();
    });

    it('clears before year filter', () => {
      setMockSearchParams(new URLSearchParams('year=2020&yearType=before'));
      const { result } = renderHook(() => useUrlFilter());

      result.current.updateFilter({ year: null, yearType: null });

      const params = mockSetSearchParams.mock.calls[0][0] as URLSearchParams;
      expect(params.get('year')).toBeNull();
      expect(params.get('yearType')).toBeNull();
    });

    it('clears after year filter', () => {
      setMockSearchParams(new URLSearchParams('year=2020&yearType=after'));
      const { result } = renderHook(() => useUrlFilter());

      result.current.updateFilter({ year: null, yearType: null });

      const params = mockSetSearchParams.mock.calls[0][0] as URLSearchParams;
      expect(params.get('year')).toBeNull();
      expect(params.get('yearType')).toBeNull();
    });

    it('preserves non-filter params when clearing year filter', () => {
      setMockSearchParams(new URLSearchParams('yearType=last2&page=3&scroll=100'));
      const { result } = renderHook(() => useUrlFilter());

      result.current.updateFilter({ yearType: null, year: null });

      const params = mockSetSearchParams.mock.calls[0][0] as URLSearchParams;
      expect(params.get('yearType')).toBeNull();
      expect(params.get('year')).toBeNull();
      expect(params.get('page')).toBe('3');
      expect(params.get('scroll')).toBe('100');
    });
  });
});
