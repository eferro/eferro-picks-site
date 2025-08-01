import { useCallback } from 'react';
import type { TalksFilter } from '../utils/TalksFilter';
import type { YearFilterData } from '../components/TalksList/YearFilter';

type UpdateFilterFunction = (updates: Partial<TalksFilter>) => void;

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

  const updateTopics = useCallback((topics: string[]) => {
    updateFilter({ topics });
  }, [updateFilter]);

  const handleTopicClick = useCallback((topic: string) => {
    const isSelected = filter.topics.includes(topic);
    const newTopics = isSelected 
      ? filter.topics.filter(t => t !== topic) 
      : [...filter.topics, topic];
    updateTopics(newTopics);
  }, [filter.topics, updateTopics]);

  const handleClearTopics = useCallback(() => {
    updateTopics([]);
  }, [updateTopics]);

  const handleTopicsChange = useCallback((topics: string[]) => {
    updateTopics(topics);
  }, [updateTopics]);

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

  const handleAuthorClick = useCallback((author: string) => {
    const newAuthor = filter.author === author ? null : author;
    updateFilter({ author: newAuthor });
  }, [filter.author, updateFilter]);

  return {
    handleHasNotesClick,
    handleRatingClick,
    handleFormatChange,
    handleTopicClick,
    handleClearTopics,
    handleTopicsChange,
    handleConferenceClick,
    handleYearFilterChange,
    handleAuthorClick,
  };
}