import { useState } from 'react';
import { Talk } from '../../types/talks';
import { TalkCard } from './TalkCard';

interface TalkSectionProps {
  coreTopic: string;
  talks: Talk[];
  onAuthorClick: (author: string) => void;
  selectedAuthor: string | null;
  onTopicClick: (topic: string) => void;
  selectedTopics: string[];
  onConferenceClick: (conference: string) => void;
  selectedConference: string | null;
  /** Whether the section starts expanded */
  openByDefault?: boolean;
}

export function TalkSection({
  coreTopic,
  talks,
  onAuthorClick,
  selectedAuthor,
  onTopicClick,
  selectedTopics,
  onConferenceClick,
  selectedConference,
  openByDefault = false,
}: TalkSectionProps) {
  const [isOpen, setIsOpen] = useState(openByDefault);

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <details data-testid="talk-section" className="mb-12" open={isOpen}>
      <summary
        role="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        className="list-none cursor-pointer text-2xl font-bold text-gray-900 mb-6"
      >
        {coreTopic} <span className="text-gray-500">({talks.length})</span>
      </summary>
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {talks.map((talk) => (
          <TalkCard
            key={talk.id}
            talk={talk}
            onAuthorClick={onAuthorClick}
            selectedAuthor={selectedAuthor}
            onTopicClick={onTopicClick}
            selectedTopics={selectedTopics}
            onConferenceClick={onConferenceClick}
            selectedConference={selectedConference}
          />
        ))}
      </div>
    </details>
  );
}