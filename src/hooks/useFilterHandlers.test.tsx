import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { useFilterHandlers } from './useFilterHandlers';
import { TalksFilter } from '../utils/TalksFilter';
import type { TalksFilterData } from '../utils/TalksFilter';
import type { YearFilterData } from '../components/TalksList/YearFilter';

// Mock updateFilter function
const mockUpdateFilter = vi.fn<(updates: TalksFilterData) => void>();

describe('useFilterHandlers', () => {

  describe('handleHasNotesClick', () => {
    it('toggles hasNotes filter from false to true', () => {
      const filter = new TalksFilter({ hasNotes: false });
      const { result } = renderHook(() => useFilterHandlers(filter, mockUpdateFilter));

      act(() => {
        result.current.handleHasNotesClick();
      });

      expect(mockUpdateFilter).toHaveBeenCalledWith({ hasNotes: true });
    });

    it('toggles hasNotes filter from true to false', () => {
      const filter = new TalksFilter({ hasNotes: true });
      const { result } = renderHook(() => useFilterHandlers(filter, mockUpdateFilter));

      act(() => {
        result.current.handleHasNotesClick();
      });

      expect(mockUpdateFilter).toHaveBeenCalledWith({ hasNotes: false });
    });
  });

  describe('handleRatingClick', () => {
    it('sets rating to 5 when currently null', () => {
      const filter = new TalksFilter({ rating: null });
      const { result } = renderHook(() => useFilterHandlers(filter, mockUpdateFilter));

      act(() => {
        result.current.handleRatingClick();
      });

      expect(mockUpdateFilter).toHaveBeenCalledWith({ rating: 5 });
    });

    it('sets rating to null when currently 5', () => {
      const filter = new TalksFilter({ rating: 5 });
      const { result } = renderHook(() => useFilterHandlers(filter, mockUpdateFilter));

      act(() => {
        result.current.handleRatingClick();
      });

      expect(mockUpdateFilter).toHaveBeenCalledWith({ rating: null });
    });

    it.each([4, 3])('sets rating to 5 when currently %i', (rating) => {
      const filter = new TalksFilter({ rating });
      const { result } = renderHook(() => useFilterHandlers(filter, mockUpdateFilter));

      act(() => {
        result.current.handleRatingClick();
      });

      expect(mockUpdateFilter).toHaveBeenCalledWith({ rating: 5 });
    });
  });

  describe('handleFormatChange', () => {
    it('updates formats with new array', () => {
      const filter = new TalksFilter();
      const { result } = renderHook(() => useFilterHandlers(filter, mockUpdateFilter));
      const newFormats = ['video', 'podcast'];

      act(() => {
        result.current.handleFormatChange(newFormats);
      });

      expect(mockUpdateFilter).toHaveBeenCalledWith({ formats: newFormats });
    });
  });

  describe('handleTopicClick', () => {
    it('sets query to the topic when a different query is active', () => {
      const filter = new TalksFilter({ query: 'something else' });
      const { result } = renderHook(() => useFilterHandlers(filter, mockUpdateFilter));

      act(() => {
        result.current.handleTopicClick('react');
      });

      expect(mockUpdateFilter).toHaveBeenCalledWith({ query: 'react' });
    });

    it('clears the query when the same topic is clicked again (toggle off)', () => {
      const filter = new TalksFilter({ query: 'react' });
      const { result } = renderHook(() => useFilterHandlers(filter, mockUpdateFilter));

      act(() => {
        result.current.handleTopicClick('react');
      });

      expect(mockUpdateFilter).toHaveBeenCalledWith({ query: '' });
    });
  });

  describe('handleQuickWatchClick', () => {
    it('toggles quickWatch from false to true', () => {
      const filter = new TalksFilter({ quickWatch: false });
      const { result } = renderHook(() => useFilterHandlers(filter, mockUpdateFilter));

      act(() => {
        result.current.handleQuickWatchClick();
      });

      expect(mockUpdateFilter).toHaveBeenCalledWith({ quickWatch: true });
    });

    it('toggles quickWatch from true to false', () => {
      const filter = new TalksFilter({ quickWatch: true });
      const { result } = renderHook(() => useFilterHandlers(filter, mockUpdateFilter));

      act(() => {
        result.current.handleQuickWatchClick();
      });

      expect(mockUpdateFilter).toHaveBeenCalledWith({ quickWatch: false });
    });
  });

  describe('handleConferenceClick', () => {
    it('sets conference when not currently selected', () => {
      const filter = new TalksFilter({ conference: null });
      const { result } = renderHook(() => useFilterHandlers(filter, mockUpdateFilter));

      act(() => {
        result.current.handleConferenceClick('React Conf');
      });

      expect(mockUpdateFilter).toHaveBeenCalledWith({ conference: 'React Conf' });
    });

    it('clears conference when currently selected', () => {
      const filter = new TalksFilter({ conference: 'React Conf' });
      const { result } = renderHook(() => useFilterHandlers(filter, mockUpdateFilter));

      act(() => {
        result.current.handleConferenceClick('React Conf');
      });

      expect(mockUpdateFilter).toHaveBeenCalledWith({ conference: null });
    });
  });

  describe('handleYearFilterChange', () => {
    it('clears year filter when passed null', () => {
      const filter = new TalksFilter();
      const { result } = renderHook(() => useFilterHandlers(filter, mockUpdateFilter));

      act(() => {
        result.current.handleYearFilterChange(null);
      });

      expect(mockUpdateFilter).toHaveBeenCalledWith({ yearType: null, year: null });
    });

    it('sets specific year filter', () => {
      const filter = new TalksFilter();
      const { result } = renderHook(() => useFilterHandlers(filter, mockUpdateFilter));
      const yearFilter: YearFilterData = { type: 'specific', year: 2023 };

      act(() => {
        result.current.handleYearFilterChange(yearFilter);
      });

      expect(mockUpdateFilter).toHaveBeenCalledWith({ yearType: 'specific', year: 2023 });
    });

    it('sets last2 year filter with null year', () => {
      const filter = new TalksFilter();
      const { result } = renderHook(() => useFilterHandlers(filter, mockUpdateFilter));
      const yearFilter: YearFilterData = { type: 'last2' };

      act(() => {
        result.current.handleYearFilterChange(yearFilter);
      });

      expect(mockUpdateFilter).toHaveBeenCalledWith({ yearType: 'last2', year: null });
    });

    it('sets before year filter', () => {
      const filter = new TalksFilter();
      const { result } = renderHook(() => useFilterHandlers(filter, mockUpdateFilter));
      const yearFilter: YearFilterData = { type: 'before', year: 2020 };

      act(() => {
        result.current.handleYearFilterChange(yearFilter);
      });

      expect(mockUpdateFilter).toHaveBeenCalledWith({ yearType: 'before', year: 2020 });
    });
  });

  // handleAuthorClick tests removed - functionality migrated to unified search

  describe('hook stability', () => {
    it('returns stable handler functions when dependencies do not change', () => {
      const filter = new TalksFilter();
      const { result, rerender } = renderHook(() => useFilterHandlers(filter, mockUpdateFilter));
      
      const firstResult = result.current;
      
      // Rerender with same dependencies
      rerender();
      
      const secondResult = result.current;
      
      // All handlers should be the same reference (memoized)
      expect(firstResult.handleHasNotesClick).toBe(secondResult.handleHasNotesClick);
      expect(firstResult.handleRatingClick).toBe(secondResult.handleRatingClick);
      expect(firstResult.handleFormatChange).toBe(secondResult.handleFormatChange);
      expect(firstResult.handleConferenceClick).toBe(secondResult.handleConferenceClick);
      expect(firstResult.handleYearFilterChange).toBe(secondResult.handleYearFilterChange);
      expect(firstResult.handleTopicClick).toBe(secondResult.handleTopicClick);
      expect(firstResult.handleQuickWatchClick).toBe(secondResult.handleQuickWatchClick);
    });
  });

  describe('handlers use the latest filter after a re-render', () => {
    type Handlers = ReturnType<typeof useFilterHandlers>;

    // Each handler must read the current filter, not the one from the first render
    it.each<[string, TalksFilterData, TalksFilterData, (h: Handlers) => void, TalksFilterData]>([
      ['handleHasNotesClick', { hasNotes: false }, { hasNotes: true }, h => h.handleHasNotesClick(), { hasNotes: false }],
      ['handleRatingClick', { rating: null }, { rating: 5 }, h => h.handleRatingClick(), { rating: null }],
      ['handleQuickWatchClick', { quickWatch: false }, { quickWatch: true }, h => h.handleQuickWatchClick(), { quickWatch: false }],
      ['handleConferenceClick', { conference: null }, { conference: 'XP' }, h => h.handleConferenceClick('XP'), { conference: null }],
      ['handleTopicClick', { query: '' }, { query: 'tdd' }, h => h.handleTopicClick('tdd'), { query: '' }],
    ])('%s', (_name, initial, updated, act_, expected) => {
      const { result, rerender } = renderHook(
        ({ filter }) => useFilterHandlers(filter, mockUpdateFilter),
        { initialProps: { filter: new TalksFilter(initial) } }
      );

      rerender({ filter: new TalksFilter(updated) });
      act(() => act_(result.current));

      expect(mockUpdateFilter).toHaveBeenLastCalledWith(expected);
    });

    it('calls the latest updateFilter function', () => {
      const firstUpdate = vi.fn<(updates: TalksFilterData) => void>();
      const latestUpdate = vi.fn<(updates: TalksFilterData) => void>();
      const filter = new TalksFilter();
      const { result, rerender } = renderHook(
        ({ update }) => useFilterHandlers(filter, update),
        { initialProps: { update: firstUpdate } }
      );

      rerender({ update: latestUpdate });
      act(() => result.current.handleFormatChange(['podcast']));

      expect(firstUpdate).not.toHaveBeenCalled();
      expect(latestUpdate).toHaveBeenCalledWith({ formats: ['podcast'] });
    });
  });
});
