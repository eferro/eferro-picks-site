import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderIntegration } from '../../test/integration/IntegrationTestHelpers';
import { TalkCard } from './TalkCard';
import { createTalk } from '../../test/utils';

describe('TalkCard Integration', () => {

  describe('Real Component Behavior', () => {
    it('renders with real hasMeaningfulNotes utility function', () => {
      const talkWithNotes = createTalk({
        notes: 'Comprehensive notes about the talk'
      });

      renderIntegration(
        <TalkCard
          talk={talkWithNotes}
          onConferenceClick={vi.fn()}
          selectedConference={null}
          onTopicClick={vi.fn()}
          selectedQuery=""
        />,
        {}
      );

      // Real hasMeaningfulNotes function determines icon visibility
      expect(screen.getByRole('img', { name: /This talk has detailed notes/i })).toBeInTheDocument();
    });

    it('does not show notes icon for whitespace-only notes using real utility', () => {
      const talkWithWhitespace = createTalk({
        notes: '   \n\t  \r\n   '
      });

      renderIntegration(
        <TalkCard
          talk={talkWithWhitespace}
          onConferenceClick={vi.fn()}
          selectedConference={null}
          onTopicClick={vi.fn()}
          selectedQuery=""
        />,
        {}
      );

      // Real hasMeaningfulNotes utility correctly identifies whitespace-only notes
      expect(screen.queryByRole('img', { name: /This talk has detailed notes/i })).not.toBeInTheDocument();
    });

    it('shows 5-star indicator for top-rated talks', () => {
      const topRatedTalk = createTalk({ rating: 5 });

      renderIntegration(
        <TalkCard
          talk={topRatedTalk}
          onConferenceClick={vi.fn()}
          selectedConference={null}
          onTopicClick={vi.fn()}
          selectedQuery=""
        />,
        {}
      );

      expect(screen.getByRole('img', { name: /top rated/i })).toBeInTheDocument();
    });
  });

  describe('Interaction Handlers', () => {
    it('calls onTopicClick when topic button is clicked', () => {
      const onTopicClick = vi.fn();
      const talk = createTalk({ topics: ['testing', 'tdd'] });

      renderIntegration(
        <TalkCard
          talk={talk}
          onConferenceClick={vi.fn()}
          selectedConference={null}
          onTopicClick={onTopicClick}
          selectedQuery=""
        />,
        {}
      );

      const topicButton = screen.getByRole('button', { name: /Filter by topic testing/i });
      fireEvent.click(topicButton);

      expect(onTopicClick).toHaveBeenCalledWith('testing');
    });

    it('calls onConferenceClick when conference button is clicked', () => {
      const onConferenceClick = vi.fn();
      const talk = createTalk({ conference_name: 'NDC London' });

      renderIntegration(
        <TalkCard
          talk={talk}
          onConferenceClick={onConferenceClick}
          selectedConference={null}
          onTopicClick={vi.fn()}
          selectedQuery=""
        />,
        {}
      );

      const conferenceButton = screen.getByRole('button', { name: /Filter by conference NDC London/i });
      fireEvent.click(conferenceButton);

      expect(onConferenceClick).toHaveBeenCalledWith('NDC London');
    });
  });
});
