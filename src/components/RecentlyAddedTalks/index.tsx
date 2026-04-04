import { useMemo } from 'react';
import { Talk } from '../../types/talks';
import { TalkCard } from '../TalksList/TalkCard';
import { useUrlFilter } from '../../hooks/useUrlFilter';
import { useFilterHandlers } from '../../hooks/useFilterHandlers';

interface RecentlyAddedTalksProps {
  talks: Talk[];
  maxTalks?: number;
}

export function RecentlyAddedTalks({ talks, maxTalks = 6 }: RecentlyAddedTalksProps) {
  const { filter, updateFilter } = useUrlFilter();
  const { handleConferenceClick, handleTopicClick } = useFilterHandlers(filter, updateFilter);

  const recentTalks = useMemo(() => {
    // Filter talks that have registered_at field
    const talksWithDate = talks.filter(talk => talk.registered_at);

    // Sort by registered_at descending (most recent first)
    const sorted = talksWithDate.sort((a, b) => {
      const dateA = new Date(a.registered_at!).getTime();
      const dateB = new Date(b.registered_at!).getTime();
      return dateB - dateA; // Descending order
    });

    // Limit to maxTalks
    return sorted.slice(0, maxTalks);
  }, [talks, maxTalks]);

  return (
    <section aria-label="Recently added talks" className="mb-8 bg-gray-50 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Recently Added</h2>

      {recentTalks.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recentTalks.map((talk) => (
            <TalkCard
              key={talk.id}
              talk={talk}
              onConferenceClick={handleConferenceClick}
              onTopicClick={handleTopicClick}
              selectedConference={filter.conference}
              selectedQuery={filter.query}
            />
          ))}
        </div>
      )}
    </section>
  );
}
