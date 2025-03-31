import { Talk } from '../../types/talks';
import { TalkCard } from './TalkCard';

interface TalkSectionProps {
  coreTopic: string;
  talks: Talk[];
  onAuthorClick: (author: string) => void;
  selectedAuthor: string | null;
  onTopicClick: (topic: string) => void;
  selectedTopics: string[];
}

export function TalkSection({ 
  coreTopic, 
  talks, 
  onAuthorClick, 
  selectedAuthor,
  onTopicClick,
  selectedTopics
}: TalkSectionProps) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {coreTopic} <span className="text-gray-500">({talks.length})</span>
      </h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {talks.map((talk) => (
          <TalkCard 
            key={talk.id} 
            talk={talk}
            onAuthorClick={onAuthorClick}
            selectedAuthor={selectedAuthor}
            onTopicClick={onTopicClick}
            selectedTopics={selectedTopics}
          />
        ))}
      </div>
    </section>
  );
} 