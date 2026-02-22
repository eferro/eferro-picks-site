import { Talk } from '../../types/talks';
import { TalkCard } from './TalkCard';

interface TalkSectionProps {
  coreTopic: string;
  talks: Talk[];
  onConferenceClick: (conference: string) => void;
  selectedConference: string | null;
}

export function TalkSection({
  coreTopic,
  talks,
  onConferenceClick,
  selectedConference,
}: TalkSectionProps) {
  return (
    <section data-testid="talk-section" className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {coreTopic} <span className="text-gray-500">({talks.length})</span>
      </h2>
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {talks.map((talk) => (
          <TalkCard
            key={talk.id}
            talk={talk}
            onConferenceClick={onConferenceClick}
            selectedConference={selectedConference}
          />
        ))}
      </div>
    </section>
  );
}