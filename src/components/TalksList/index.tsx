import { useState, useMemo } from 'react';
import { Talk } from '../../types/talks';
import { TalkSection } from './TalkSection';
import { useTalks } from '../../hooks/useTalks';
import { YearFilter, type YearFilterData } from './YearFilter';

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="text-center py-8">
      <p className="text-red-600 text-lg">{message}</p>
      <p className="text-gray-600 mt-2">Check the console for more details.</p>
    </div>
  );
}

export function TalksList() {
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedConference, setSelectedConference] = useState<string | null>(null);
  const [selectedYearFilter, setSelectedYearFilter] = useState<YearFilterData | null>(null);
  const { talks, loading, error } = useTalks();

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

  // Filter talks by selected author, topics, conference, and year
  const filteredTalks = useMemo(() => {
    let filtered = talks;

    if (selectedAuthor) {
      filtered = filtered.filter(talk => talk.speakers.includes(selectedAuthor));
    }

    if (selectedTopics.length > 0) {
      filtered = filtered.filter(talk =>
        selectedTopics.every(topic => talk.topics.includes(topic))
      );
    }

    if (selectedConference) {
      filtered = filtered.filter(talk => talk.conference_name === selectedConference);
    }

    if (selectedYearFilter) {
      const currentYear = new Date().getFullYear();
      filtered = filtered.filter(talk => {
        if (!talk.year) return false;
        
        switch (selectedYearFilter.type) {
          case 'specific':
            return talk.year === selectedYearFilter.year;
          case 'before':
            return talk.year < (selectedYearFilter.year || currentYear);
          case 'after':
            return talk.year > (selectedYearFilter.year || currentYear);
          case 'last2':
            return talk.year >= currentYear - 2;
          case 'last5':
            return talk.year >= currentYear - 5;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [talks, selectedAuthor, selectedTopics, selectedConference, selectedYearFilter]);

  // Memoize the grouped and sorted talks
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
                onClick={() => setSelectedAuthor(null)}
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
                onClick={() => setSelectedConference(null)}
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
            onAuthorClick={setSelectedAuthor}
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