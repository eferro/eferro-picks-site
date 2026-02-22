import type { TalksFilter } from '../../utils/TalksFilter';
import type { YearFilterData } from './YearFilter';
import { FilterChip } from '../ui';

interface ActiveFiltersProps {
  filter: TalksFilter;
  yearFilter: YearFilterData | null;
  onRemoveConference: () => void;
  onRemoveYearFilter: () => void;
  onRemoveHasNotes: () => void;
  onRemoveRating: () => void;
  onRemoveFormat: (format: string) => void;
}

export function ActiveFilters({
  filter,
  yearFilter,
  onRemoveConference,
  onRemoveYearFilter,
  onRemoveHasNotes,
  onRemoveRating,
  onRemoveFormat,
}: ActiveFiltersProps) {
  // Check if any filters are active
  const hasActiveFilters =
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
      {filter.conference && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Conference:</span>
          <FilterChip onRemove={onRemoveConference}>
            {filter.conference}
          </FilterChip>
        </div>
      )}

      {yearFilter && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Year:</span>
          <FilterChip onRemove={onRemoveYearFilter}>
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
          </FilterChip>
        </div>
      )}
      
      {filter.hasNotes && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Filter:</span>
          <FilterChip 
            onRemove={onRemoveHasNotes}
            ariaLabel="Remove Has Notes filter"
          >
            Has Notes
          </FilterChip>
        </div>
      )}
      
      {filter.rating === 5 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Filter:</span>
          <FilterChip 
            onRemove={onRemoveRating}
            ariaLabel="Remove Rating filter"
          >
            5 Stars
          </FilterChip>
        </div>
      )}

      {filter.formats.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Format:</span>
          {filter.formats.map(fmt => (
            <FilterChip
              key={fmt}
              onRemove={() => onRemoveFormat(fmt)}
            >
              {fmt.charAt(0).toUpperCase() + fmt.slice(1)}
            </FilterChip>
          ))}
        </div>
      )}
    </div>
  );
}