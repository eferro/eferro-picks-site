import { useMemo } from 'react';
import { Talk } from '../../types/talks';
import { TalkCard } from '../TalksList/TalkCard';
import { useUrlFilter } from '../../hooks/useUrlFilter';
import { useFilterHandlers } from '../../hooks/useFilterHandlers';

interface MoreTalksBySpeakerProps {
  currentTalk: Talk;
  allTalks: Talk[];
}

export function MoreTalksBySpeaker({ currentTalk, allTalks }: MoreTalksBySpeakerProps) {
  const { filter, updateFilter } = useUrlFilter();
  const { handleConferenceClick, handleTopicClick } = useFilterHandlers(filter, updateFilter);

  // Find talks by same speakers, excluding current talk
  const relatedTalks = useMemo(() => {
    if (currentTalk.speakers.length === 0) {
      return [];
    }

    return allTalks
      .filter(talk => {
        // Exclude current talk
        if (talk.id === currentTalk.id) return false;

        // Check if talk has any speaker in common with current talk
        return talk.speakers.some(speaker =>
          currentTalk.speakers.includes(speaker)
        );
      })
      .sort((a, b) => a.title.localeCompare(b.title))
      .slice(0, 3); // Limit to 3 talks
  }, [currentTalk, allTalks]);


  if (relatedTalks.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        More talks by these speakers
      </h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {relatedTalks.map(talk => (
          <TalkCard
            key={talk.id}
            talk={talk}
            onConferenceClick={handleConferenceClick}
            selectedConference={filter.conference}
            onTopicClick={handleTopicClick}
            selectedQuery={filter.query}
          />
        ))}
      </div>
    </section>
  );
}