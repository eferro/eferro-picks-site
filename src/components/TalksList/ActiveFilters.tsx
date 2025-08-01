import type { TalksFilter } from '../../utils/TalksFilter';
import type { YearFilterData } from './YearFilter';

interface ActiveFiltersProps {
  filter: TalksFilter;
  yearFilter: YearFilterData | null;
  onRemoveAuthor: () => void;
  onRemoveConference: () => void;
  onRemoveTopic: (topic: string) => void;
  onClearTopics: () => void;
  onRemoveYearFilter: () => void;
  onRemoveHasNotes: () => void;
  onRemoveRating: () => void;
  onRemoveFormat: (format: string) => void;
}

export function ActiveFilters({
  filter,
  yearFilter,
  onRemoveAuthor,
  onRemoveConference,
  onRemoveTopic,
  onClearTopics,
  onRemoveYearFilter,
  onRemoveHasNotes,
  onRemoveRating,
  onRemoveFormat,
}: ActiveFiltersProps) {
  // Check if any filters are active
  const hasActiveFilters = 
    filter.author || 
    filter.topics.length > 0 || 
    filter.conference || 
    yearFilter || 
    filter.hasNotes || 
    filter.rating === 5 || 
    filter.formats.length > 0;

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="mb-6 space-y-3">
      {filter.author && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Speaker:</span>
          <button
            className="break-words inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            onClick={onRemoveAuthor}
          >
            {filter.author}
            <span className="ml-2 text-blue-600">×</span>
          </button>
        </div>
      )}
      
      {filter.conference && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Conference:</span>
          <button
            className="break-words inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            onClick={onRemoveConference}
          >
            {filter.conference}
            <span className="ml-2 text-blue-600">×</span>
          </button>
        </div>
      )}
      
      {filter.topics.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Topics:</span>
          {filter.topics.map(topic => (
            <button
              key={topic}
              className="break-words inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
              onClick={() => onRemoveTopic(topic)}
            >
              {topic}
              <span className="ml-2 text-gray-600">×</span>
            </button>
          ))}
          <button
            className="text-sm text-gray-500 hover:text-gray-700"
            onClick={onClearTopics}
          >
            Clear all topics
          </button>
        </div>
      )}
      
      {yearFilter && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Year:</span>
          <button
            className="break-words inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            onClick={onRemoveYearFilter}
          >
            {yearFilter.type === 'specific' && yearFilter.year ? (
              yearFilter.year
            ) : yearFilter.type === 'before' ? (
              `Before ${yearFilter.year}`
            ) : yearFilter.type === 'after' ? (
              `After ${yearFilter.year}`
            ) : yearFilter.type === 'last2' ? (
              'Last 2 Years'
            ) : (
              'Last 5 Years'
            )}
            <span className="ml-2 text-blue-600">×</span>
          </button>
        </div>
      )}
      
      {filter.hasNotes && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Filter:</span>
          <button
            className="break-words inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            onClick={onRemoveHasNotes}
            aria-label="Remove Has Notes filter"
          >
            Has Notes
            <span className="ml-2 text-blue-600" aria-hidden="true">×</span>
          </button>
        </div>
      )}
      
      {filter.rating === 5 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Filter:</span>
          <button
            className="break-words inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            onClick={onRemoveRating}
            aria-label="Remove Rating filter"
          >
            5 Stars
            <span className="ml-2 text-blue-600" aria-hidden="true">×</span>
          </button>
        </div>
      )}

      {filter.formats.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Format:</span>
          {filter.formats.map(fmt => (
            <button
              key={fmt}
              className="break-words inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              onClick={() => onRemoveFormat(fmt)}
            >
              {fmt.charAt(0).toUpperCase() + fmt.slice(1)}
              <span className="ml-2 text-blue-600">×</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}