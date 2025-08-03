import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useFilterHandlers } from './useFilterHandlers';
import { TalksFilter } from '../utils/TalksFilter';
import type { TalksFilterData } from '../utils/TalksFilter';
import type { YearFilterData } from '../components/TalksList/YearFilter';

// Mock updateFilter function
const mockUpdateFilter = vi.fn<[TalksFilterData], void>();

describe('useFilterHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    it('adds topic when not currently selected', () => {
      const filter = new TalksFilter({ topics: ['React'] });
      const { result } = renderHook(() => useFilterHandlers(filter, mockUpdateFilter));

      act(() => {
        result.current.handleTopicClick('Testing');
      });

      expect(mockUpdateFilter).toHaveBeenCalledWith({ topics: ['React', 'Testing'] });
    });

    it('removes topic when currently selected', () => {
      const filter = new TalksFilter({ topics: ['React', 'Testing'] });
      const { result } = renderHook(() => useFilterHandlers(filter, mockUpdateFilter));

      act(() => {
        result.current.handleTopicClick('React');
      });

      expect(mockUpdateFilter).toHaveBeenCalledWith({ topics: ['Testing'] });
    });

    it('adds topic to empty topics array', () => {
      const filter = new TalksFilter({ topics: [] });
      const { result } = renderHook(() => useFilterHandlers(filter, mockUpdateFilter));

      act(() => {
        result.current.handleTopicClick('React');
      });

      expect(mockUpdateFilter).toHaveBeenCalledWith({ topics: ['React'] });
    });
  });

  describe('handleClearTopics', () => {
    it('clears all topics', () => {
      const filter = new TalksFilter({ topics: ['React', 'Testing', 'JavaScript'] });
      const { result } = renderHook(() => useFilterHandlers(filter, mockUpdateFilter));

      act(() => {
        result.current.handleClearTopics();
      });

      expect(mockUpdateFilter).toHaveBeenCalledWith({ topics: [] });
    });
  });

  describe('handleTopicsChange', () => {
    it('updates topics with new array', () => {
      const filter = new TalksFilter();
      const { result } = renderHook(() => useFilterHandlers(filter, mockUpdateFilter));
      const newTopics = ['React', 'TypeScript'];

      act(() => {
        result.current.handleTopicsChange(newTopics);
      });

      expect(mockUpdateFilter).toHaveBeenCalledWith({ topics: newTopics });
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
      const yearFilter: YearFilterData = { type: 'last2', year: null };

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

  describe('handleAuthorClick', () => {
    it('sets author when not currently selected', () => {
      const filter = new TalksFilter({ author: null });
      const { result } = renderHook(() => useFilterHandlers(filter, mockUpdateFilter));

      act(() => {
        result.current.handleAuthorClick('John Doe');
      });

      expect(mockUpdateFilter).toHaveBeenCalledWith({ author: 'John Doe' });
    });

    it('clears author when currently selected', () => {
      const filter = new TalksFilter({ author: 'John Doe' });
      const { result } = renderHook(() => useFilterHandlers(filter, mockUpdateFilter));

      act(() => {
        result.current.handleAuthorClick('John Doe');
      });

      expect(mockUpdateFilter).toHaveBeenCalledWith({ author: null });
    });
  });

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
      expect(firstResult.handleTopicClick).toBe(secondResult.handleTopicClick);
      expect(firstResult.handleClearTopics).toBe(secondResult.handleClearTopics);
      expect(firstResult.handleTopicsChange).toBe(secondResult.handleTopicsChange);
      expect(firstResult.handleConferenceClick).toBe(secondResult.handleConferenceClick);
      expect(firstResult.handleYearFilterChange).toBe(secondResult.handleYearFilterChange);
      expect(firstResult.handleAuthorClick).toBe(secondResult.handleAuthorClick);
    });
  });
});