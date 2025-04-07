import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TalkSection } from './TalkSection';
import { useTalks } from '../../hooks/useTalks';

const TalksList: React.FC = () => {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [selectedConference, setSelectedConference] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { talks, loading, error } = useTalks();

  // Handle both initialization and updates
  useEffect(() => {
    const topics = searchParams.get('topics')?.split(',').filter(Boolean) || [];
    setSelectedTopics(topics);
  }, [searchParams]);

  const handleTopicClick = (topic: string) => {
    const newTopics = selectedTopics.includes(topic)
      ? selectedTopics.filter(t => t !== topic)
      : [...selectedTopics, topic];

    setSelectedTopics(newTopics);
    
    // Update URL directly in the click handler
    const params = new URLSearchParams(searchParams);
    if (newTopics.length > 0) {
      params.set('topics', newTopics.join(','));
    } else {
      params.delete('topics');
    }
    setSearchParams(params);
  };

  const handleAuthorClick = (author: string) => {
    setSelectedAuthor(prev => prev === author ? null : author);
  };

  const handleConferenceClick = (conference: string) => {
    setSelectedConference(prev => prev === conference ? null : conference);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <TalkSection
        coreTopic="Engineering Culture"
        talks={talks}
        selectedTopics={selectedTopics}
        onTopicClick={handleTopicClick}
        selectedAuthor={selectedAuthor}
        onAuthorClick={handleAuthorClick}
        selectedConference={selectedConference}
        onConferenceClick={handleConferenceClick}
      />
    </div>
  );
};

export default TalksList; 