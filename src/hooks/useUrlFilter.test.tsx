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
});
