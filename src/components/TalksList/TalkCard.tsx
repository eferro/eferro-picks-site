import { useMemo } from 'react';
import { Talk } from '../../types/talks';
import { formatDuration } from '../../utils/format';

interface TalkCardProps {
  talk: Talk;
}

export function TalkCard({ talk }: TalkCardProps) {
  // Memoize topics to avoid unnecessary re-renders
  const topicElements = useMemo(() => (
    talk.topics.map((topic) => (
      <span key={topic} 
            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
        {topic}
      </span>
    ))
  ), [talk.topics]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        <a href={talk.url} target="_blank" rel="noopener noreferrer" 
           className="hover:text-blue-600 transition-colors">
          {talk.title}
        </a>
      </h3>
      <p className="text-sm text-gray-600 mb-3">
        {talk.speakers.join(', ')} • {formatDuration(talk.duration)}
      </p>
      <p className="text-gray-700 mb-4 line-clamp-2">{talk.description}</p>
      <div className="flex flex-wrap gap-2">
        {topicElements}
      </div>
    </div>
  );
} 