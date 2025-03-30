import { useEffect, useState } from 'react';
import { Talk } from '../../types/talks';
import { TalkSection } from './TalkSection';

export function TalksList() {
  const [talks, setTalks] = useState<Talk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTalks = async () => {
      try {
        const response = await fetch('/data/talks.json');
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 text-lg">{error}</p>
        <p className="text-gray-600 mt-2">Check the console for more details.</p>
      </div>
    );
  }

  // Group talks by core topic
  const talksByTopic = talks.reduce((acc, talk) => {
    const topic = talk.core_topic || 'Uncategorized';
    if (!acc[topic]) {
      acc[topic] = [];
    }
    acc[topic].push(talk);
    return acc;
  }, {} as Record<string, Talk[]>);

  // Sort topics by number of talks (descending)
  const sortedTopics = Object.entries(talksByTopic)
    .sort(([, a], [, b]) => b.length - a.length);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {sortedTopics.map(([topic, topicTalks]) => (
        <TalkSection 
          key={topic} 
          coreTopic={topic} 
          talks={topicTalks} 
        />
      ))}
    </div>
  );
} 