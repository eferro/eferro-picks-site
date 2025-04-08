import { useState, useMemo, useEffect } from 'react';
import { Talk } from '../../types/talks';
import { TalkSection } from './TalkSection';
import { useTalks } from '../../hooks/useTalks';
import { YearFilter, type YearFilterData } from './YearFilter';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useScrollPosition } from '../../hooks/useScrollPosition';

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
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedConference, setSelectedConference] = useState<string | null>(null);
  const [selectedYearFilter, setSelectedYearFilter] = useState<YearFilterData | null>(null);
  const { talks, loading, error } = useTalks();
  const [isInitialized, setIsInitialized] = useState(false);

  // Add scroll position saving
  useScrollPosition();

  // Initialize state from URL parameters
  useEffect(() => {
    const author = searchParams.get('author');
    const topics = searchParams.get('topics')?.split(',').filter(Boolean) || [];
    const conference = searchParams.get('conference');
    const year = searchParams.get('year');
    const yearType = searchParams.get('yearType');
    
    if (author) setSelectedAuthor(author);
    if (topics.length > 0) setSelectedTopics(topics);
    if (conference) setSelectedConference(conference);
    if (yearType) {
      setSelectedYearFilter({
        type: yearType as YearFilterData['type'],
        year: year ? parseInt(year) : undefined
      });
    } else {
      setSelectedYearFilter(null);
    }
    setIsInitialized(true);
  }, [searchParams]);

  // Update URL when filters change
  useEffect(() => {
    if (!isInitialized) return;

    const params = new URLSearchParams();
    if (selectedAuthor) params.set('author', selectedAuthor);
    if (selectedTopics.length > 0) params.set('topics', selectedTopics.join(','));
    if (selectedConference) params.set('conference', selectedConference);
    if (selectedYearFilter) {
      if (selectedYearFilter.year) {
        params.set('year', selectedYearFilter.year.toString());
      }
      params.set('yearType', selectedYearFilter.type);
    }
    setSearchParams(params);
  }, [isInitialized, selectedAuthor, selectedTopics, selectedConference, selectedYearFilter, setSearchParams]);

  // Handle topic selection
  const handleTopicClick = (topic: string) => {
    setSelectedTopics(prev => {
      const isSelected = prev.includes(topic);
      if (isSelected) {
        return prev.filter(t => t !== topic);
      }
      return [...prev, topic];
    });
  };

  // Handle conference selection
  const handleConferenceClick = (conference: string) => {
    setSelectedConference(prev => prev === conference ? null : conference);
  };

  // Handle author selection
  const handleAuthorClick = (author: string) => {
    setSelectedAuthor(prev => prev === author ? null : author);
  };

  // Filter talks by selected author, topics, conference, and year
  const filteredTalks = useMemo(() => {
    if (!talks) return [];
    
    return talks.filter(talk => {
      // Filter by author
      if (selectedAuthor && !talk.speakers.includes(selectedAuthor)) {
        return false;
      }

      // Filter by topics
      if (selectedTopics.length > 0) {
        const hasSelectedTopic = selectedTopics.some(topic => 
          talk.topics.includes(topic) || talk.core_topic === topic
        );
        if (!hasSelectedTopic) return false;
      }

      // Filter by conference
      if (selectedConference && talk.conference_name !== selectedConference) {
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

      return true;
    });
  }, [talks, selectedAuthor, selectedTopics, selectedConference, selectedYearFilter]);

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
          onFilterChange={setSelectedYearFilter}
        />
      </div>

      {/* Active filters */}
      {(selectedAuthor || selectedTopics.length > 0 || selectedConference || selectedYearFilter) && (
        <div className="mb-6 space-y-3">
          {selectedAuthor && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Speaker:</span>
              <button
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                onClick={() => handleAuthorClick(selectedAuthor)}
              >
                {selectedAuthor}
                <span className="ml-2 text-blue-600">×</span>
              </button>
            </div>
          )}
          
          {selectedConference && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Conference:</span>
              <button
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                onClick={() => handleConferenceClick(selectedConference)}
              >
                {selectedConference}
                <span className="ml-2 text-blue-600">×</span>
              </button>
            </div>
          )}
          
          {selectedTopics.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">Topics:</span>
              {selectedTopics.map(topic => (
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
                onClick={() => setSelectedTopics([])}
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
                onClick={() => setSelectedYearFilter(null)}
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
            selectedAuthor={selectedAuthor}
            onTopicClick={handleTopicClick}
            selectedTopics={selectedTopics}
            onConferenceClick={handleConferenceClick}
            selectedConference={selectedConference}
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