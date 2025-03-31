import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Talk } from '../../types/talks';

export function TalkDetail() {
  const { id } = useParams<{ id: string }>();
  const [talk, setTalk] = useState<Talk | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTalk = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/talks.json`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const foundTalk = data.talks.find((t: Talk) => t.airtable_id === id);
        
        if (!foundTalk) {
          throw new Error('Talk not found');
        }
        
        setTalk(foundTalk);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load talk');
        console.error('Error loading talk:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTalk();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !talk) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Talk not found'}</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            ← Back to talks list
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/" className="text-blue-600 hover:text-blue-800 mb-6 inline-block">
        ← Back to talks list
      </Link>
      
      <article className="bg-white rounded-lg shadow-lg p-6 mt-4">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {talk.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="font-medium">Speakers:</span>
              <div className="ml-2 flex flex-wrap gap-2">
                {talk.speakers.map(speaker => (
                  <span
                    key={speaker}
                    className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full"
                  >
                    {speaker}
                  </span>
                ))}
              </div>
            </div>
            {talk.duration && (
              <div>
                <span className="font-medium">Duration:</span>
                <span className="ml-2">{Math.floor(talk.duration / 60)} minutes</span>
              </div>
            )}
          </div>
        </header>

        <div className="prose max-w-none mb-6">
          <p className="text-gray-700 whitespace-pre-line">
            {talk.description}
          </p>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Topics</h2>
          <div className="flex flex-wrap gap-2">
            {talk.topics.map(topic => (
              <span
                key={topic}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <a
            href={talk.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Watch Talk →
          </a>
        </div>
      </article>
    </div>
  );
} 