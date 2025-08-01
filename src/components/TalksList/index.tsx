import { useMemo } from 'react';
import { Talk } from '../../types/talks';
import { TalkSection } from './TalkSection';
import { useTalks } from '../../hooks/useTalks';
import { YearFilter, type YearFilterData } from './YearFilter';
import { useUrlFilter } from '../../hooks/useUrlFilter';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import { useFilterHandlers } from '../../hooks/useFilterHandlers';
import { DocumentTextIcon, StarIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner, ErrorMessage, PageContainer, Button } from '../ui';

import { SearchBox } from '../SearchBox';
import { TopicsFilter } from './TopicsFilter';
import { FormatFilter } from './FormatFilter';
import { ActiveFilters } from './ActiveFilters';

export function TalksList() {
  const { filter, updateFilter } = useUrlFilter();
  // No local state for year filter; handled by TalksFilter
  const { talks, loading, error } = useTalks(filter.rating === 5);

  // Add scroll position saving
  useScrollPosition();



  // Get all filter handlers from custom hook
  const {
    handleHasNotesClick,
    handleRatingClick,
    handleFormatChange,
    handleTopicClick,
    handleClearTopics,
    handleTopicsChange,
    handleConferenceClick,
    handleYearFilterChange,
    handleAuthorClick,
  } = useFilterHandlers(filter, updateFilter);

  // Derive yearType and year from TalksFilter
  const yearType = filter.yearType;
  const year = filter.year;
  let yearFilter: YearFilterData | null = null;
  if (yearType) {
    yearFilter = { type: yearType, year: year ?? undefined };
  }

  // Filter talks using TalksFilter
  const filteredTalks = useMemo(() => {
    if (!talks) return [];
    return filter.filter(talks);
  }, [talks, filter]);

  // Group talks by core topic
  const sortedTopics = useMemo(() => {
    // Group talks by core topic
    const talksByTopic = filteredTalks.reduce((acc, talk) => {
      const topic = talk.core_topic || 'Uncategorized';
      if (!acc[topic]) {
        acc[topic] = [];
      }
      acc[topic].push(talk);
      return acc;
    }, {} as Record<string, Talk[]>);

    // Sort topics by number of talks (descending), but keep Uncategorized at the end
    return Object.entries(talksByTopic)
      .sort(([topicA, a], [topicB, b]) => {
        // If one is Uncategorized, it should go last
        if (topicA === 'Uncategorized') return 1;
        if (topicB === 'Uncategorized') return -1;
        // Otherwise sort by number of talks
        return b.length - a.length;
      });
  }, [filteredTalks]);


  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <PageContainer padding="compact" width="extended">
      {/* Search Box */}
      <div className="mb-6">
        <SearchBox talks={talks || []} />
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-4">
        <YearFilter
          talks={talks}
          selectedFilter={yearFilter}
          onFilterChange={handleYearFilterChange}
        />
        <TopicsFilter
          talks={talks || []}
          selectedTopics={filter.topics}
          onChange={handleTopicsChange}
        />
        <FormatFilter selectedFormats={filter.formats} onChange={handleFormatChange} />
        <Button
          variant="toggle"
          active={filter.hasNotes}
          onClick={handleHasNotesClick}
          aria-label="Toggle Has Notes filter"
          icon={<DocumentTextIcon />}
        >
          Has Notes
        </Button>
        <Button
          variant="toggle"
          active={filter.rating === 5}
          onClick={handleRatingClick}
          aria-label="Toggle Rating filter"
          icon={<StarIcon />}
        >
          {filter.rating === 5 ? '5 Stars' : 'All'}
        </Button>
      </div>

      {/* Active filters */}
      <ActiveFilters
        filter={filter}
        yearFilter={yearFilter}
        onRemoveAuthor={() => handleAuthorClick(filter.author!)}
        onRemoveConference={() => handleConferenceClick(filter.conference!)}
        onRemoveTopic={handleTopicClick}
        onClearTopics={handleClearTopics}
        onRemoveYearFilter={() => handleYearFilterChange(null)}
        onRemoveHasNotes={handleHasNotesClick}
        onRemoveRating={handleRatingClick}
        onRemoveFormat={(format) => handleFormatChange(filter.formats.filter(f => f !== format))}
      />

      {/* Results count */}
      <div className="text-sm text-gray-500 mb-6">
        Showing {filteredTalks.length} of {talks.length} talks
      </div>
      
      {sortedTopics.length > 0 ? (
        sortedTopics.map(([topic, topicTalks]) => (
          <TalkSection
            key={topic}
            coreTopic={topic}
            talks={topicTalks}
            onAuthorClick={handleAuthorClick}
            selectedAuthor={filter.author}
            onTopicClick={handleTopicClick}
            selectedTopics={filter.topics}
            onConferenceClick={handleConferenceClick}
            selectedConference={filter.conference}
          />
        ))
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600 text-lg">No talks found matching your criteria.</p>
        </div>
      )}
    </PageContainer>
  );
} 