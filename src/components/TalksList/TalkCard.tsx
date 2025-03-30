import { Talk } from '../../types/talks';

interface TalkCardProps {
  talk: Talk;
}

export function TalkCard({ talk }: TalkCardProps) {
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

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
        {talk.topics.map((topic) => (
          <span key={topic} 
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            {topic}
          </span>
        ))}
      </div>
    </div>
  );
} 