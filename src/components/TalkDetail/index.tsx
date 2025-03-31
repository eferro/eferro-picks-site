import { useParams, Link } from 'react-router-dom';
import { useTalks } from '../../hooks/useTalks';
import { PlayIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Talk } from '../../types/talks';

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

const TopicChip = ({ topic }: { topic: string }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
    {topic}
  </span>
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

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{talk.title}</h1>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-600 font-medium">
                  {talk.speakers[0].split(' ').map((n: string) => n[0]).join('')}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{talk.speakers.join(', ')}</p>
                <p className="text-sm text-gray-500">{talk.duration}</p>
              </div>
            </div>
          </div>

          <div className="prose max-w-none mb-8">
            <p className="text-gray-700">{talk.description}</p>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {talk.topics.map((topic: string) => (
              <TopicChip key={topic} topic={topic} />
            ))}
          </div>

          <a
            href={talk.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlayIcon className="h-5 w-5 mr-2" />
            Watch Talk
          </a>
        </div>
      </div>
    </div>
  );
} 