import { useState, useMemo, useEffect } from 'react';
import { Talk } from '../../types/talks';
import { TalkSection } from './TalkSection';
import { useTalks } from '../../hooks/useTalks';
import { YearFilter, type YearFilterData } from './YearFilter';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import { hasMeaningfulNotes } from '../../utils/talks';
import { DocumentTextIcon, StarIcon } from '@heroicons/react/24/outline';
import { TalksFilter } from '../../utils/TalksFilter';

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
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = useMemo(() => {
    const f = TalksFilter.fromUrlParams(searchParams);
    if (searchParams.get('rating') == null) {
      return new TalksFilter({ ...f, rating: 5 });
    }
    return f;
  }, [searchParams]);
  const [selectedYearFilter, setSelectedYearFilter] = useState<YearFilterData | null>(null);
  const [showOnlyWithNotes, setShowOnlyWithNotes] = useState(() => searchParams.get('hasNotes') === 'true');
  const [filterByRating, setFilterByRating] = useState(() => searchParams.get('rating') !== 'all');
  const { talks, loading, error } = useTalks(filterByRating);

  // Add scroll position saving
  useScrollPosition();

  // Ensure the URL always includes the rating parameter on first load
  useEffect(() => {
    if (!searchParams.get('rating')) {
      const params = new URLSearchParams(searchParams);
      params.set('rating', filterByRating ? '5' : 'all');
      setSearchParams(params);
    }
  }, [searchParams, filterByRating]);

  // Handle URL parameters and updates
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const author = params.get('author');
    const topics = params.get('topics')?.split(',').filter(Boolean) || [];
    const conference = params.get('conference');
    const year = params.get('year');
    const yearType = params.get('yearType');
    const hasNotes = params.get('hasNotes') === 'true';
    const rating = params.get('rating');
    
    // Update state from URL
    // setSelectedAuthor(author); // This line was removed as per the edit hint
    if (topics.length > 0) {
      // The selectedTopics state is removed, so we directly update the filter
      const nextFilter = new TalksFilter({
        year: filter.year,
        author: filter.author,
        topics: topics,
        conference: filter.conference,
        hasNotes: filter.hasNotes,
        rating: filter.rating,
        query: filter.query,
      });
      setSearchParams(nextFilter.toParams());
    }
    if (conference) {
      const nextFilter = new TalksFilter({
        ...filter,
        conference: conference,
      });
      setSearchParams(nextFilter.toParams());
    }
    if (yearType) {
      setSelectedYearFilter({
        type: yearType as YearFilterData['type'],
        year: year ? parseInt(year) : undefined
      });
    } else {
      setSelectedYearFilter(null);
    }
    setShowOnlyWithNotes(hasNotes);
    setFilterByRating(rating !== 'all');
  }, [searchParams, filter]);

  // Update URL when filters change
  const handleHasNotesClick = () => {
    const newValue = !showOnlyWithNotes;
    setShowOnlyWithNotes(newValue);
    
    const params = new URLSearchParams();
    
    // Preserve existing parameters
    for (const [key, value] of searchParams.entries()) {
      if (key !== 'hasNotes') {
        params.set(key, value);
      }
    }
    
    // Update hasNotes parameter
    if (newValue) {
      params.set('hasNotes', 'true');
    }
    
    setSearchParams(params);
  };

  const handleRatingClick = () => {
    const newValue = !filterByRating;
    setFilterByRating(newValue);
    
    const params = new URLSearchParams();
    
    // Preserve existing parameters
    for (const [key, value] of searchParams.entries()) {
      if (key !== 'rating') {
        params.set(key, value);
      }
    }
    
    // Update rating parameter
    if (newValue) {
      params.set('rating', '5');
    } else {
      params.set('rating', 'all');
    }
    
    setSearchParams(params);
  };

  // Handle topic selection and sync with URL
  const handleTopicClick = (topic: string) => {
    const urlTopics = (searchParams.get('topics')?.split(',').filter(Boolean)) || [];
    const isSelected = urlTopics.includes(topic);
    let newTopics;
    if (isSelected) {
      newTopics = urlTopics.filter(t => t !== topic);
    } else {
      newTopics = [...urlTopics, topic];
    }
    const nextFilter = new TalksFilter({
      year: filter.year,
      author: filter.author,
      topics: newTopics,
      conference: filter.conference,
      hasNotes: filter.hasNotes,
      rating: filter.rating,
      query: filter.query,
    });
    // Preserve extra params
    const current = new URLSearchParams(searchParams);
    const next = new URLSearchParams(nextFilter.toParams());
    for (const [key, value] of current.entries()) {
      if (!next.has(key) && !['year','author','topics','conference','hasNotes','rating','query'].includes(key)) {
        next.set(key, value);
      }
    }
    setSearchParams(next);
  };

  const handleClearTopics = () => {
    const nextFilter = new TalksFilter({
      year: filter.year,
      author: filter.author,
      topics: [],
      conference: filter.conference,
      hasNotes: filter.hasNotes,
      rating: filter.rating,
      query: filter.query,
    });
    // Preserve extra params
    const current = new URLSearchParams(searchParams);
    const next = new URLSearchParams(nextFilter.toParams());
    for (const [key, value] of current.entries()) {
      if (!next.has(key) && !['year','author','topics','conference','hasNotes','rating','query'].includes(key)) {
        next.set(key, value);
      }
    }
    setSearchParams(next);
  };

  // Handle conference selection and sync with URL using TalksFilter
  const handleConferenceClick = (conference: string) => {
    const newConference = filter.conference === conference ? null : conference;
    const nextFilter = new TalksFilter({
      ...filter,
      conference: newConference,
    });
    // Preserve extra params
    const current = new URLSearchParams(searchParams);
    const next = new URLSearchParams(nextFilter.toParams());
    for (const [key, value] of current.entries()) {
      if (!next.has(key) && !['year','author','topics','conference','hasNotes','rating','query'].includes(key)) {
        next.set(key, value);
      }
    }
    setSearchParams(next);
  };

  // Handle year filter change and sync with URL
  const handleYearFilterChange = (filter: YearFilterData | null) => {
    setSelectedYearFilter(filter);

    const params = new URLSearchParams();
    for (const [key, value] of searchParams.entries()) {
      if (key !== 'yearType' && key !== 'year') {
        params.set(key, value);
      }
    }

    if (filter) {
      params.set('yearType', filter.type);
      if (filter.year !== undefined) {
        params.set('year', filter.year.toString());
      } else {
        params.delete('year');
      }
    }

    setSearchParams(params);
  };

  // Handle author selection by toggling based on current URL param
  const handleAuthorClick = (author: string) => {
    // Toggle author filter using TalksFilter
    const newAuthor = filter.author === author ? null : author;
    const nextFilter = new TalksFilter({
      year: filter.year,
      author: newAuthor,
      topics: filter.topics,
      conference: filter.conference,
      hasNotes: filter.hasNotes,
      rating: filter.rating,
      query: filter.query,
    });
    // Preserve extra params
    const current = new URLSearchParams(searchParams);
    const next = new URLSearchParams(nextFilter.toParams());
    for (const [key, value] of current.entries()) {
      if (!next.has(key) && !['year','author','topics','conference','hasNotes','rating','query'].includes(key)) {
        next.set(key, value);
      }
    }
    setSearchParams(next);
  };

  // Filter talks by selected author, topics, conference, year, and notes
  const filteredTalks = useMemo(() => {
    if (!talks) return [];
    
    return talks.filter(talk => {
      // Filter by author using TalksFilter
      if (filter.author && !talk.speakers.includes(filter.author)) {
        return false;
      }

      // Filter by topics using TalksFilter
      if (filter.topics.length > 0) {
        const hasAllSelectedTopics = filter.topics.every(topic => 
          talk.topics.includes(topic)
        );
        if (!hasAllSelectedTopics) return false;
      }

      // Filter by conference
      if (filter.conference && talk.conference_name !== filter.conference) {
        return false;
      }

      // Filter by year
      if (selectedYearFilter) {
        const currentYear = new Date().getFullYear();

        switch (selectedYearFilter.type) {
          case 'last2':
            return talk.year ? talk.year >= currentYear - 2 : false;
          case 'last5':
            return talk.year ? talk.year >= currentYear - 5 : false;
          case 'specific':
            return selectedYearFilter.year ? talk.year === selectedYearFilter.year : true;
          default:
            return true;
        }
      }

      // Filter by notes
      if (showOnlyWithNotes && !hasMeaningfulNotes(talk.notes)) {
        return false;
      }

      return true;
    });
  }, [talks, filter.author, filter.topics, filter.conference, selectedYearFilter, showOnlyWithNotes]);

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
      {/* Filters */}
      <div className="mb-6 flex items-center gap-4">
        <YearFilter
          talks={talks}
          selectedFilter={selectedYearFilter}
          onFilterChange={handleYearFilterChange}
        />
        <button
          onClick={handleHasNotesClick}
          aria-label="Toggle Has Notes filter"
          className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            showOnlyWithNotes
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <DocumentTextIcon className={`h-5 w-5 ${showOnlyWithNotes ? 'text-white' : 'text-blue-500'} mr-2`} />
          Has Notes
        </button>
        <button
          onClick={handleRatingClick}
          aria-label="Toggle Rating filter"
          className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filterByRating
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <StarIcon className={`h-5 w-5 ${filterByRating ? 'text-white' : 'text-blue-500'} mr-2`} />
          {filterByRating ? '5 Stars' : 'All'}
        </button>
      </div>

      {/* Active filters */}
      {(filter.author || filter.topics.length > 0 || filter.conference || selectedYearFilter || showOnlyWithNotes || filterByRating) && (
        <div className="mb-6 space-y-3">
          {filter.author && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Speaker:</span>
              <button
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
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
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
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
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
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
          
          {selectedYearFilter && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Year:</span>
              <button
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                onClick={() => handleYearFilterChange(null)}
              >
                {selectedYearFilter.type === 'specific' && selectedYearFilter.year ? (
                  selectedYearFilter.year
                ) : selectedYearFilter.type === 'before' ? (
                  `Before ${selectedYearFilter.year}`
                ) : selectedYearFilter.type === 'after' ? (
                  `After ${selectedYearFilter.year}`
                ) : selectedYearFilter.type === 'last2' ? (
                  'Last 2 Years'
                ) : (
                  'Last 5 Years'
                )}
                <span className="ml-2 text-blue-600">×</span>
              </button>
            </div>
          )}
          
          {showOnlyWithNotes && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Filter:</span>
              <button
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                onClick={handleHasNotesClick}
                aria-label="Remove Has Notes filter"
              >
                Has Notes
                <span className="ml-2 text-blue-600" aria-hidden="true">×</span>
              </button>
            </div>
          )}
          
          {filterByRating && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Filter:</span>
              <button
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                onClick={handleRatingClick}
                aria-label="Remove Rating filter"
              >
                5 Stars
                <span className="ml-2 text-blue-600" aria-hidden="true">×</span>
              </button>
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