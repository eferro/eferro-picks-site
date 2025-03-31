import { useMemo } from 'react';
import { Talk } from '../../types/talks';
import { formatDuration } from '../../utils/format';

interface TalkCardProps {
  talk: Talk;
  onAuthorClick: (author: string) => void;
  selectedAuthor: string | null;
  onTopicClick: (topic: string) => void;
  selectedTopics: string[];
}

export function TalkCard({ 
  talk, 
  onAuthorClick, 
  selectedAuthor,
  onTopicClick,
  selectedTopics 
}: TalkCardProps) {
  // Memoize topics to avoid unnecessary re-renders
  const topicElements = useMemo(() => (
    talk.topics.map((topic) => (
      <button
        key={topic}
        onClick={() => onTopicClick(topic)}
        className={`px-2 py-1 rounded-full text-xs transition-colors ${
          selectedTopics.includes(topic)
            ? 'bg-gray-700 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {topic}
      </button>
    ))
  ), [talk.topics, onTopicClick, selectedTopics]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        <a href={talk.url} target="_blank" rel="noopener noreferrer" 
           className="hover:text-blue-600 transition-colors">
          {talk.title}
        </a>
      </h3>
      <div className="flex flex-wrap gap-2 mb-3">
        {talk.speakers.map((speaker) => (
          <button
            key={speaker}
            onClick={() => onAuthorClick(speaker)}
            className={`px-2 py-1 rounded-full text-xs transition-colors ${
              selectedAuthor === speaker
                ? 'bg-blue-500 text-white'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            {speaker}
          </button>
        ))}
        <span className="px-2 py-1 text-xs text-gray-500">
          • {formatDuration(talk.duration)}
        </span>
      </div>
      <p className="text-gray-700 mb-4 line-clamp-5">{talk.description}</p>
      <div className="flex flex-wrap gap-2">
        {topicElements}
      </div>
    </div>
  );
} 