import { useParams, Link } from 'react-router-dom';
import { useTalks } from '../../hooks/useTalks';
import { PlayIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Talk } from '../../types/talks';
import { formatDuration, getSpeakerInitials } from '../../utils/format';
import { TopicChip } from '../shared/TopicChip';

const LoadingState = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
    </div>
  </div>
);

const ErrorState = ({ error }: { error: Error }) => (
  <div className="text-red-600">
    <p>Error loading talk: {error.message}</p>
  </div>
);

export function TalkDetail() {
  const { id } = useParams<{ id: string }>();
  const { talks, isLoading, error } = useTalks();
  const talk = talks.find((t: Talk) => t.airtable_id === id);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!talk) return <div>Talk not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link 
        to="/" 
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Talks
      </Link>

      <article className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{talk.title}</h1>
        
        <div className="flex items-center mb-6">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-600 font-medium">
              {getSpeakerInitials(talk.speakers[0])}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{talk.speakers.join(', ')}</p>
            <p className="text-sm text-gray-500">{formatDuration(talk.duration)}</p>
          </div>
        </div>

        <p className="text-gray-700 mb-8">{talk.description}</p>

        <div className="flex flex-wrap gap-2 mb-8">
          {talk.topics.map(topic => (
            <TopicChip key={topic} topic={topic} />
          ))}
        </div>

        <a
          href={talk.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlayIcon className="h-5 w-5 mr-2" />
          Watch Talk
        </a>
      </article>
    </div>
  );
} 