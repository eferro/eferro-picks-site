import { useMemo } from 'react';
import { Talk } from '../../types/talks';
import { TalkSection } from './TalkSection';
import { useTalks } from '../../hooks/useTalks';
import { YearFilter, type YearFilterData } from './YearFilter';
import { useUrlFilter } from '../../hooks/useUrlFilter';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import { useFilterHandlers } from '../../hooks/useFilterHandlers';
import { DocumentTextIcon, StarIcon, BoltIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner, ErrorMessage, PageContainer, Button } from '../ui';

import { SearchBox } from '../SearchBox';
import { FormatFilter } from './FormatFilter';
import { ActiveFilters } from './ActiveFilters';
import { CategoryIndex, type CategoryData } from './CategoryIndex';
import { RecentlyAddedTalks } from '../RecentlyAddedTalks';

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
    handleConferenceClick,
    handleTopicClick,
    handleYearFilterChange,
    handleQuickWatchClick,
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

  // Generate category data for the index
  const categoryData: CategoryData[] = useMemo(() => {
    return sortedTopics.map(([topic, topicTalks]) => ({
      name: topic,
      count: topicTalks.length,
    }));
  }, [sortedTopics]);

  // Handle category click - scroll to section
  const handleCategoryClick = (categoryName: string) => {
    const element = document.querySelector(`[data-category="${categoryName}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <PageContainer padding="compact" width="extended">
      {/* Search Box */}
      <div className="mb-6">
        <SearchBox talks={talks || []} />
      </div>

      {/* Recently Added Talks - only show when no filters are active */}
      {filter.isEmpty() && (
        <RecentlyAddedTalks talks={talks || []} />
      )}

      {/* Filters */}
      <div className="mb-6 flex items-center gap-4">
        <YearFilter
          talks={talks}
          selectedFilter={yearFilter}
          onFilterChange={handleYearFilterChange}
        />
        <FormatFilter selectedFormats={filter.formats} onChange={handleFormatChange} />
        <Button
          variant="toggle"
          active={filter.quickWatch}
          onClick={handleQuickWatchClick}
          aria-label="Toggle Quick Watch filter"
          icon={<BoltIcon />}
        >
          Quick Watch
        </Button>
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
          aria-label="Toggle Top Picks filter"
          title="Show only 5-star talks — the curator's top recommendations"
          icon={<StarIcon />}
        >
          {filter.rating === 5 ? '⭐ Top Picks' : 'Top Picks'}
        </Button>
      </div>

      {/* Active filters */}
      <ActiveFilters
        filter={filter}
        yearFilter={yearFilter}
        onRemoveConference={() => handleConferenceClick(filter.conference!)}
        onRemoveYearFilter={() => handleYearFilterChange(null)}
        onRemoveHasNotes={handleHasNotesClick}
        onRemoveRating={handleRatingClick}
        onRemoveQuickWatch={handleQuickWatchClick}
        onRemoveFormat={(format) => handleFormatChange(filter.formats.filter(f => f !== format))}
      />

      {/* Results count */}
      <div className="text-sm text-gray-500 mb-6">
        Showing {filteredTalks.length} of {talks.length} talks
      </div>

      {/* Main content with sidebar layout */}
      <div className="flex gap-8">
        {/* Category Index Sidebar */}
        {categoryData.length > 1 && (
          <div className="hidden lg:block w-64 flex-shrink-0">
            <CategoryIndex
              categories={categoryData}
              onCategoryClick={handleCategoryClick}
            />
          </div>
        )}

        {/* Main talks content */}
        <div className="flex-1 min-w-0">
          {sortedTopics.length > 0 ? (
            sortedTopics.map(([topic, topicTalks]) => (
              <div key={topic} data-category={topic}>
                <TalkSection
                  coreTopic={topic}
                  talks={topicTalks}
                  onConferenceClick={handleConferenceClick}
                  selectedConference={filter.conference}
                  onTopicClick={handleTopicClick}
                  selectedQuery={filter.query}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 text-lg">No talks found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
} 