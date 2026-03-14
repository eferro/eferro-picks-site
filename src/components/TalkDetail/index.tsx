import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTalks } from '../../hooks/useTalks';
import { useUrlFilter } from '../../hooks/useUrlFilter';
import { useFilterHandlers } from '../../hooks/useFilterHandlers';
import { PlayIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { LoadingSpinner, ErrorMessage, PageContainer, Button } from '../ui';
import { Talk } from '../../types/talks';
import { formatDuration } from '../../utils/format';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { hasMeaningfulNotes } from '../../utils/talks';



function TalkDetail() {
  const { id } = useParams<{ id: string }>();
  const { filter, updateFilter } = useUrlFilter();
  const { handleAuthorClick, handleConferenceClick } = useFilterHandlers(filter, updateFilter);

  const { talks, loading, error } = useTalks();

  const talk = useMemo(() => talks.find((t: Talk) => t.id === id), [talks, id]);

  const relatedTalks = useMemo(() => {
    if (!talk) return [];
    const speakerSet = new Set(talk.speakers);
    return talks
      .filter((t: Talk) => t.id !== talk.id && t.speakers.some(s => speakerSet.has(s)))
      .slice(0, 5);
  }, [talk, talks]);

  if (loading) {
    return (
      <PageContainer>
        <LoadingSpinner noContainer role="status" />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorMessage message="Error loading talk details" noContainer />
      </PageContainer>
    );
  }

  if (!talk) {
    return (
      <PageContainer>
        <ErrorMessage message="Talk not found" noContainer className="text-gray-600" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
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
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {talk.title}
            </h1>
            {talk.rating === 5 && (
              <span
                role="img"
                aria-label="Top rated"
                title="Top rated"
                className="text-yellow-500 flex-shrink-0 ml-3"
              >
                <StarIcon className="h-7 w-7" aria-hidden="true" />
              </span>
            )}
          </div>
          
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
                <Button
                  variant="tag"
                  size="sm"
                  shape="pill"
                  active={filter.conference === talk.conference_name}
                  onClick={() => handleConferenceClick(talk.conference_name!)}
                >
                  {talk.conference_name}
                </Button>
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

          {talk.blog_url && (
            <div className="mb-6">
              <a
                href={talk.blog_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                <span className="mr-2" aria-hidden="true">📝</span>
                Mentioned in curator's blog
              </a>
            </div>
          )}

          {hasMeaningfulNotes(talk.notes) && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Notes</h2>
              <div className="prose prose-blue max-w-none">
                <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                  {talk.notes}
                </ReactMarkdown>
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

      {relatedTalks.length > 0 && (
        <section className="mt-8" aria-label="More talks by this speaker">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            More by {talk.speakers.join(' & ')}
          </h2>
          <div className="grid gap-3">
            {relatedTalks.map(related => (
              <Link
                key={related.id}
                to={{ pathname: `/talk/${related.id}`, search: filter.toParams().toString() }}
                className="block bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-medium text-gray-900">{related.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  <span>{formatDuration(related.duration)}</span>
                  {related.year && <span>{related.year}</span>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </PageContainer>
  );
}
export { TalkDetail };