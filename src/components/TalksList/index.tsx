import { useMemo } from 'react';
import { Talk } from '../../types/talks';
import { TalkSection } from './TalkSection';
import { useTalks } from '../../hooks/useTalks';
import { YearFilter, type YearFilterData } from './YearFilter';
import { useUrlFilter } from '../../hooks/useUrlFilter';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import { DocumentTextIcon, StarIcon } from '@heroicons/react/24/outline';

import { SearchBox } from '../SearchBox';
import { TopicsFilter } from './TopicsFilter';
import { FormatFilter } from './FormatFilter';

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="text-center py-12">
      <p className="text-red-600">{message}</p>
    </div>
  );
}

export function TalksList() {
  const { filter, updateFilter } = useUrlFilter();
  // No local state for year filter; handled by TalksFilter
  const { talks, loading, error } = useTalks(filter.rating === 5);

  // Add scroll position saving
  useScrollPosition();



  // Update URL when filters change
  const handleHasNotesClick = () => {
    updateFilter({ hasNotes: !filter.hasNotes });
  };

  const handleRatingClick = () => {
    updateFilter({ rating: filter.rating === 5 ? null : 5 });
  };

  const updateTopics = (topics: string[]) => {
    updateFilter({ topics });
  };

  const handleFormatChange = (formats: string[]) => {
    updateFilter({ formats });
  };

  const handleTopicClick = (topic: string) => {
    const isSelected = filter.topics.includes(topic);
    const newTopics = isSelected ? filter.topics.filter(t => t !== topic) : [...filter.topics, topic];
    updateTopics(newTopics);
  };

  const handleClearTopics = () => {
    updateTopics([]);
  };

  const handleTopicsChange = (topics: string[]) => {
    updateTopics(topics);
  };

  // Handle conference selection and sync with URL using TalksFilter
  const handleConferenceClick = (conference: string) => {
    const newConference = filter.conference === conference ? null : conference;
    updateFilter({ conference: newConference });
  };

  // Handle year filter change and sync with URL (set yearType and year)
  const handleYearFilterChange = (yearFilter: YearFilterData | null) => {
    if (!yearFilter) {
      updateFilter({ yearType: null, year: null });
    } else {
      updateFilter({ yearType: yearFilter.type, year: yearFilter.year ?? null });
    }
  };

  // Handle author selection by toggling based on current URL param
  const handleAuthorClick = (author: string) => {
    const newAuthor = filter.author === author ? null : author;
    updateFilter({ author: newAuthor });
  };

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
    <div className="max-w-7xl 2xl:max-w-[96rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <button
          onClick={handleHasNotesClick}
          aria-label="Toggle Has Notes filter"
          className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter.hasNotes
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <DocumentTextIcon className={`h-5 w-5 ${filter.hasNotes ? 'text-white' : 'text-blue-500'} mr-2`} />
          Has Notes
        </button>
        <button
          onClick={handleRatingClick}
          aria-label="Toggle Rating filter"
          className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter.rating === 5
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <StarIcon className={`h-5 w-5 ${filter.rating === 5 ? 'text-white' : 'text-blue-500'} mr-2`} />
          {filter.rating === 5 ? '5 Stars' : 'All'}
        </button>
      </div>

      {/* Active filters */}
      {(filter.author || filter.topics.length > 0 || filter.conference || yearFilter || filter.hasNotes || filter.rating === 5 || filter.formats.length > 0) && (
        <div className="mb-6 space-y-3">
          {filter.author && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Speaker:</span>
              <button
                className="break-words inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                onClick={() => handleAuthorClick(filter.author!)}
              >
                {filter.author}
                <span className="ml-2 text-blue-600">×</span>
              </button>
            </div>
          )}
          
          {filter.conference && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Conference:</span>
              <button
                className="break-words inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                onClick={() => handleConferenceClick(filter.conference!)}
              >
                {filter.conference}
                <span className="ml-2 text-blue-600">×</span>
              </button>
            </div>
          )}
          
          {filter.topics.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">Topics:</span>
              {filter.topics.map(topic => (
                <button
                  key={topic}
                  className="break-words inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                  onClick={() => handleTopicClick(topic)}
                >
                  {topic}
                  <span className="ml-2 text-gray-600">×</span>
                </button>
              ))}
              <button
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={handleClearTopics}
              >
                Clear all topics
              </button>
            </div>
          )}
          
          {yearFilter && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Year:</span>
              <button
                className="break-words inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                onClick={() => handleYearFilterChange(null)}
              >
                {yearFilter.type === 'specific' && yearFilter.year ? (
                  yearFilter.year
                ) : yearFilter.type === 'before' ? (
                  `Before ${yearFilter.year}`
                ) : yearFilter.type === 'after' ? (
                  `After ${yearFilter.year}`
                ) : yearFilter.type === 'last2' ? (
                  'Last 2 Years'
                ) : (
                  'Last 5 Years'
                )}
                <span className="ml-2 text-blue-600">×</span>
              </button>
            </div>
          )}
          
          {filter.hasNotes && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Filter:</span>
              <button
                className="break-words inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                onClick={handleHasNotesClick}
                aria-label="Remove Has Notes filter"
              >
                Has Notes
                <span className="ml-2 text-blue-600" aria-hidden="true">×</span>
              </button>
            </div>
          )}
          
          {filter.rating === 5 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Filter:</span>
              <button
                className="break-words inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                onClick={handleRatingClick}
                aria-label="Remove Rating filter"
              >
                5 Stars
                <span className="ml-2 text-blue-600" aria-hidden="true">×</span>
              </button>
            </div>
          )}

          {filter.formats.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Format:</span>
              {filter.formats.map(fmt => (
                <button
                  key={fmt}
                  className="break-words inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  onClick={() => handleFormatChange(filter.formats.filter(f => f !== fmt))}
                >
                  {fmt.charAt(0).toUpperCase() + fmt.slice(1)}
                  <span className="ml-2 text-blue-600">×</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

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
    </div>
  );
} 