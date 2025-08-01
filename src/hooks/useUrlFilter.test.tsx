import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { setMockSearchParams, mockSetSearchParams } from '../test/utils';
import { useUrlFilter } from './useUrlFilter';

describe('useUrlFilter', () => {
  it('parses filter from url params', () => {
    setMockSearchParams(new URLSearchParams('author=Bob'));
    const { result } = renderHook(() => useUrlFilter());
    expect(result.current.filter.author).toBe('Bob');
  });

  it('updates search params when calling updateFilter', () => {
    setMockSearchParams(new URLSearchParams());
    const { result } = renderHook(() => useUrlFilter());
    result.current.updateFilter({ author: 'Alice' });
    const params = mockSetSearchParams.mock.calls[0][0] as URLSearchParams;
    expect(params.get('author')).toBe('Alice');
  });

  it('preserves unrelated params when updating', () => {
    setMockSearchParams(new URLSearchParams('page=2'));
    const { result } = renderHook(() => useUrlFilter());
    result.current.updateFilter({ author: 'Alice' });
    const params = mockSetSearchParams.mock.calls[0][0] as URLSearchParams;
    expect(params.get('page')).toBe('2');
    expect(params.get('author')).toBe('Alice');
  });
});
