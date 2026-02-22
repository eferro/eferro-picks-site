import { useCallback } from 'react';
import type { TalksFilter, TalksFilterData } from '../utils/TalksFilter';
import type { YearFilterData } from '../components/TalksList/YearFilter';

type UpdateFilterFunction = (updates: TalksFilterData) => void;

/**
 * Custom hook that provides all filter handler functions for TalksList
 * 
 * @param filter - Current filter state from TalksFilter
 * @param updateFilter - Function to update filter state and URL
 * @returns Object containing all filter handler functions
 */
export function useFilterHandlers(filter: TalksFilter, updateFilter: UpdateFilterFunction) {
  const handleHasNotesClick = useCallback(() => {
    updateFilter({ hasNotes: !filter.hasNotes });
  }, [filter.hasNotes, updateFilter]);

  const handleRatingClick = useCallback(() => {
    updateFilter({ rating: filter.rating === 5 ? null : 5 });
  }, [filter.rating, updateFilter]);

  const handleFormatChange = useCallback((formats: string[]) => {
    updateFilter({ formats });
  }, [updateFilter]);

  const handleConferenceClick = useCallback((conference: string) => {
    const newConference = filter.conference === conference ? null : conference;
    updateFilter({ conference: newConference });
  }, [filter.conference, updateFilter]);

  const handleYearFilterChange = useCallback((yearFilter: YearFilterData | null) => {
    if (!yearFilter) {
      updateFilter({ yearType: null, year: null });
    } else {
      updateFilter({ yearType: yearFilter.type, year: yearFilter.year ?? null });
    }
  }, [updateFilter]);

  return {
    handleHasNotesClick,
    handleRatingClick,
    handleFormatChange,
    handleConferenceClick,
    handleYearFilterChange,
  };
}