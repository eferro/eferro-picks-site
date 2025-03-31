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

const NotFoundState = () => (
  <div className="max-w-4xl mx-auto px-4 py-8">
    <Link 
      to="/" 
      className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
    >
      <ArrowLeftIcon className="h-5 w-5 mr-2" />
      Back to Talks
    </Link>
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Talk Not Found</h1>
      <p className="text-gray-700">The talk you're looking for could not be found.</p>
    </div>
  </div>
);

export function TalkDetail() {
  const { id } = useParams<{ id: string }>();
  const { talks, loading, error } = useTalks();
  
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center text-red-600">
          Error loading talk details
        </div>
      </div>
    );
  }

  const talk = talks.find((t: Talk) => t.id === id);

  if (!talk) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center text-gray-600">
          Talk not found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Link 
        to="/" 
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Talks
      </Link>

      <article className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {talk.title}
          </h1>
          
          <div className="flex items-center text-gray-600 mb-6">
            <span className="font-medium">{talk.speakers.join(', ')}</span>
            <span className="mx-2">•</span>
            <span>{talk.duration}</span>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700 mb-6">
              {talk.description}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {talk.topics.map(topic => (
              <span 
                key={topic}
                className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {topic}
              </span>
            ))}
          </div>

          <div className="mt-8">
            <a
              href={talk.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Watch Talk
            </a>
          </div>
        </div>
      </article>
    </div>
  );
} 