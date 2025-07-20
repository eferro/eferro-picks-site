import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTalks } from '../../hooks/useTalks';
import { PlayIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Talk } from '../../types/talks';
import { formatDuration } from '../../utils/format';
import ReactMarkdown from 'react-markdown';
import { hasMeaningfulNotes } from '../../utils/talks';
import { TalksFilter } from '../../utils/TalksFilter';

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

function TalkDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { talks, loading, error } = useTalks();

  // Centralized filter state
  const filter = TalksFilter.fromUrlParams(searchParams);

  const handleAuthorClick = (author: string) => {
    const newAuthor = filter.author === author ? null : author;
    const nextFilter = new TalksFilter({
      ...filter,
      author: newAuthor,
    });
    setSearchParams(nextFilter.toParams());
  };

  const handleConferenceClick = (conference: string) => {
    const newConference = filter.conference === conference ? null : conference;
    const nextFilter = new TalksFilter({
      ...filter,
      conference: newConference,
    });
    setSearchParams(nextFilter.toParams());
  };

  const handleYearClick = (year: number) => {
    let nextFilter: TalksFilter;
    if (filter.year === year) {
      // Remove year filter
      nextFilter = new TalksFilter({
        ...filter,
        year: null,
        yearType: null,
      });
    } else {
      nextFilter = new TalksFilter({
        ...filter,
        year: year,
        yearType: 'specific',
      });
    }
    setSearchParams(nextFilter.toParams());
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div 
            role="status"
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"
          ></div>
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
        to={{ 
          pathname: "..",
          search: searchParams.toString()
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