import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TalkSection } from './TalkSection';
import { useTalks } from '../../hooks/useTalks';
import { hasMeaningfulNotes } from '../../utils/talks';

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

  const handleHasNotesClick = () => {
    const params = new URLSearchParams(searchParams);
    if (params.get('hasNotes') === 'true') {
      params.delete('hasNotes');
    } else {
      params.set('hasNotes', 'true');
    }
    setSearchParams(params);
  };

  const hasNotesFilter = searchParams.get('hasNotes') === 'true';
  const filteredTalks = hasNotesFilter 
    ? talks.filter(talk => hasMeaningfulNotes(talk.notes))
    : talks;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={handleHasNotesClick}
          aria-label="Has Notes"
          className={`px-4 py-2 rounded-md text-white ${hasNotesFilter ? 'bg-blue-500' : 'bg-gray-500'}`}
        >
          Has Notes
        </button>
      </div>
      <TalkSection
        coreTopic="Engineering Culture"
        talks={filteredTalks}
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