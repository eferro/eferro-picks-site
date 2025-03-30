import { useEffect, useState, useMemo } from 'react';
import { Talk } from '../../types/talks';
import { TalkSection } from './TalkSection';

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
  const [talks, setTalks] = useState<Talk[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTalks = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/talks.json`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTalks(data.talks);
      } catch (err) {
        setError('Failed to load talks. Please try again later.');
        console.error('Error loading talks:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTalks();
  }, []);

  // Filter talks by selected author
  const filteredTalks = useMemo(() => {
    if (!selectedAuthor) return talks;
    return talks.filter(talk => talk.speakers.includes(selectedAuthor));
  }, [talks, selectedAuthor]);

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

    // Sort topics by number of talks (descending)
    return Object.entries(talksByTopic)
      .sort(([, a], [, b]) => b.length - a.length);
  }, [filteredTalks]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {selectedAuthor && (
        <div className="mb-6 flex items-center gap-2">
          <span className="text-sm text-gray-500">Showing talks by:</span>
          <button
            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            onClick={() => setSelectedAuthor(null)}
          >
            {selectedAuthor}
            <span className="ml-2 text-blue-600">×</span>
          </button>
        </div>
      )}
      
      {sortedTopics.map(([topic, topicTalks]) => (
        <TalkSection 
          key={topic} 
          coreTopic={topic} 
          talks={topicTalks}
          onAuthorClick={setSelectedAuthor}
          selectedAuthor={selectedAuthor}
        />
      ))}
    </div>
  );
} 