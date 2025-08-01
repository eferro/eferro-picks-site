import { useParams, Link } from 'react-router-dom';
import { useTalks } from '../../hooks/useTalks';
import { useUrlFilter } from '../../hooks/useUrlFilter';
import { useFilterHandlers } from '../../hooks/useFilterHandlers';
import { PlayIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner, ErrorMessage } from '../ui';
import { Talk } from '../../types/talks';
import { formatDuration } from '../../utils/format';
import ReactMarkdown from 'react-markdown';
import { hasMeaningfulNotes } from '../../utils/talks';



function TalkDetail() {
  const { id } = useParams<{ id: string }>();
  const { filter, updateFilter } = useUrlFilter();
  const { handleAuthorClick, handleConferenceClick } = useFilterHandlers(filter, updateFilter);

  const { talks, loading, error } = useTalks();



  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <LoadingSpinner noContainer role="status" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <ErrorMessage message="Error loading talk details" noContainer />
      </div>
    );
  }

  const talk = talks.find((t: Talk) => t.id === id);

  if (!talk) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <ErrorMessage message="Talk not found" noContainer className="text-gray-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Link 
        to={{ 
          pathname: "..",
          search: filter.toParams().toString()
        }}
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
            <div className="flex flex-wrap gap-2">
              {talk.speakers.map(speaker => (
                <button
                  key={speaker}
                  onClick={() => handleAuthorClick(speaker)}
                  className={`font-medium px-3 py-1 rounded-full text-sm transition-colors ${
                    filter.author === speaker
                      ? 'bg-blue-500 text-white'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  {speaker}
                </button>
              ))}
            </div>
            <span className="ml-4">{formatDuration(talk.duration)}</span>
          </div>
          
          {(talk.conference_name || talk.year) && (
            <div className="text-sm text-gray-600 -mt-4 mb-6">
              {talk.conference_name && (
                <button
                  onClick={() => handleConferenceClick(talk.conference_name!)}
                  className={`font-medium px-3 py-1 rounded-full text-sm transition-colors ${
                    filter.conference === talk.conference_name
                      ? 'bg-blue-500 text-white'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  {talk.conference_name}
                </button>
              )}
              {talk.conference_name && talk.year && <span className="mx-1">·</span>}
              {talk.year && <span>{talk.year}</span>}
            </div>
          )}

          <div className="mb-6">
            <a
              href={talk.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlayIcon className="h-4 w-4 mr-2" aria-hidden="true" />
              Watch Talk
            </a>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700 mb-6">
              {talk.description}
            </p>
          </div>

          {hasMeaningfulNotes(talk.notes) && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Notes</h2>
              <div className="prose prose-blue max-w-none">
                <ReactMarkdown>{talk.notes}</ReactMarkdown>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-4">
            {talk.core_topic && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Core Topic</h3>
                <span 
                  className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                >
                  {talk.core_topic}
                </span>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Topics</h3>
              <div className="flex flex-wrap gap-2">
                {talk.topics.map(topic => (
                  <span 
                    key={topic}
                    className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </article>
    </div>
  );
}
export { TalkDetail }; 