import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Talk } from '../../types/talks';
import { formatDuration } from '../../utils/format';
import { hasMeaningfulNotes } from '../../utils/talks';
import { DocumentTextIcon, PlayIcon, VideoCameraIcon, MicrophoneIcon } from '@heroicons/react/24/outline';

interface TalkCardProps {
  talk: Talk;
  onConferenceClick: (conference: string) => void;
  selectedConference: string | null;
}

export function TalkCard({
  talk,
  onConferenceClick,
  selectedConference
}: TalkCardProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Memoize topics to avoid unnecessary re-renders
  const topicElements = useMemo(
    () =>
      talk.topics.map((topic) => (
        <span
          key={topic}
          aria-label={`Topic: ${topic}`}
          className="break-words px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
        >
          {topic}
        </span>
      )),
    [talk.topics]
  );

  const handleCardClick = () => {
    // Navigate to talk detail
    navigate({
      pathname: `/talk/${talk.id}`,
      search: searchParams.toString()
    });
  };

  return (
    <div
      onClick={handleCardClick}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      role="article"
      tabIndex={0}
      aria-label={`Talk: ${talk.title}`}
      className="block w-full bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="p-6 flex flex-col h-full">
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {talk.title}
            </h3>
            <div className="flex items-center gap-1">
              {hasMeaningfulNotes(talk.notes) && (
                <span
                  role="img"
                  aria-label="This talk has detailed notes"
                  title="This talk has detailed notes"
                >
                  <DocumentTextIcon
                    className="h-5 w-5 text-blue-500 flex-shrink-0 ml-2"
                    aria-hidden="true"
                  />
                </span>
              )}
              {talk.format === 'podcast' ? (
                <MicrophoneIcon className="h-5 w-5 text-gray-500" aria-label="Format: Podcast" />
              ) : (
                <VideoCameraIcon className="h-5 w-5 text-gray-500" aria-label="Format: Talk" />
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {talk.speakers.map((speaker) => (
              <span
                key={speaker}
                aria-label={`Speaker: ${speaker}`}
                className="break-words px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700"
              >
                {speaker}
              </span>
            ))}
            <span className="px-2 py-1 text-xs text-gray-500" aria-label={`Duration: ${formatDuration(talk.duration)}`}>
              {formatDuration(talk.duration)}
            </span>
          </div>
          {(talk.conference_name || talk.year) && (
            <div className="text-xs text-gray-600 -mt-1 mb-3 flex items-center gap-2">
              {talk.conference_name && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    onConferenceClick(talk.conference_name!);
                  }}
                  aria-label={`Filter by conference ${talk.conference_name}`}
                  className={`break-words px-2 py-1 rounded-full text-xs transition-colors ${
                    selectedConference === talk.conference_name
                      ? 'bg-blue-500 text-white'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  {talk.conference_name}
                </button>
              )}
              {talk.conference_name && talk.year && <span className="mx-1">·</span>}
              {talk.year && <span className="px-2 py-1 text-gray-500">{talk.year}</span>}
            </div>
          )}
          <p className="text-gray-700 mb-4 line-clamp-5">{talk.description}</p>
          <div className="flex flex-wrap gap-2">
            {topicElements}
          </div>
        </div>
        <div className="border-t pt-4 mt-4">
          <a
            href={talk.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Watch ${talk.title}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <PlayIcon className="h-4 w-4 mr-2" aria-hidden="true" />
            Watch Talk
          </a>
        </div>
      </div>
    </div>
  );
} 